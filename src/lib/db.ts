import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Local JSON file database path for fallback development mode
const MOCK_DB_PATH = path.join(process.cwd(), 'local-db.json');

// Interface defining the data store
interface MockDbStore {
  users: Record<string, any>;
  profiles: Record<string, any>;
  ghlConnections: Record<string, any>;
}

// Initial empty store
const initialStore: MockDbStore = {
  users: {},
  profiles: {},
  ghlConnections: {},
};

// Simple filesystem JSON db helper
class LocalJsonDb {
  private static readStore(): MockDbStore {
    try {
      if (!fs.existsSync(MOCK_DB_PATH)) {
        fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(initialStore, null, 2), 'utf-8');
        return initialStore;
      }
      const raw = fs.readFileSync(MOCK_DB_PATH, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.warn("Failed to read mock db file, resetting to empty store", err);
      return initialStore;
    }
  }

  private static writeStore(store: MockDbStore) {
    try {
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(store, null, 2), 'utf-8');
    } catch (err) {
      console.error("Failed to save mock db state to disk", err);
    }
  }

  static isMockActive(): boolean {
    return !process.env.DATABASE_URL;
  }

  // User methods
  static async getOrCreateUser(email: string) {
    const store = this.readStore();
    let user = Object.values(store.users).find((u: any) => u.email === email);
    if (!user) {
      user = {
        id: 'mock-user-uuid',
        email,
        password: 'hashedpassword_mock',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.users[user.id] = user;
      this.writeStore(store);
    }
    return user;
  }

  // Profile methods
  static async getProfileByEmail(email: string) {
    const user = await this.getOrCreateUser(email);
    const store = this.readStore();
    return store.profiles[user.id] || null;
  }

  static async saveProfile(email: string, profileData: any) {
    const user = await this.getOrCreateUser(email);
    const store = this.readStore();
    const existing = store.profiles[user.id] || {};
    const updated = {
      id: existing.id || 'mock-profile-uuid',
      userId: user.id,
      ...existing,
      ...profileData,
      updatedAt: new Date().toISOString(),
    };
    if (!existing.id) {
      updated.createdAt = new Date().toISOString();
    }
    store.profiles[user.id] = updated;
    this.writeStore(store);
    return updated;
  }

  // Ghl connection methods
  static async getGhlConnection(locationId: string) {
    const store = this.readStore();
    return store.ghlConnections[locationId] || null;
  }

  static async saveGhlConnection(locationId: string, data: any) {
    const store = this.readStore();
    const updated = {
      id: store.ghlConnections[locationId]?.id || 'mock-ghl-uuid',
      locationId,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    if (!store.ghlConnections[locationId]) {
      updated.createdAt = new Date().toISOString();
    }
    store.ghlConnections[locationId] = updated;
    this.writeStore(store);
    return updated;
  }
}

// Instantiate PrismaClient
let prisma: PrismaClient | null = null;
let useMock = true;

if (process.env.DATABASE_URL) {
  try {
    if (process.env.DATABASE_URL.startsWith('prisma+postgres://') || process.env.DATABASE_URL.startsWith('prisma://')) {
      prisma = new PrismaClient({
        accelerateUrl: process.env.DATABASE_URL,
      });
    } else {
      prisma = new PrismaClient();
    }
    useMock = false;
  } catch (e) {
    console.error("PrismaClient initialization failed, falling back to Local JSON DB", e);
    prisma = null;
    useMock = true;
  }
} else {
  console.log("DATABASE_URL not found, using Local JSON database fallback.");
}

// Unified Database Provider
export const db = {
  isMock: useMock,
  
  async getProfile(email: string) {
    if (useMock || !prisma) {
      return LocalJsonDb.getProfileByEmail(email);
    }
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { businessProfile: true }
      });
      return user?.businessProfile || null;
    } catch (e) {
      console.warn("Prisma error, using mock fallback for profile fetch", e);
      return LocalJsonDb.getProfileByEmail(email);
    }
  },

  async saveProfile(email: string, profileData: any) {
    if (useMock || !prisma) {
      return LocalJsonDb.saveProfile(email, profileData);
    }
    try {
      // Find or create user
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            password: 'demopassword'
          }
        });
      }
      
      const profile = await prisma.businessProfile.upsert({
        where: { userId: user.id },
        update: profileData,
        create: {
          userId: user.id,
          ...profileData,
        }
      });
      return profile;
    } catch (e) {
      console.warn("Prisma error, using mock fallback for profile saving", e);
      return LocalJsonDb.saveProfile(email, profileData);
    }
  },

  async getGhlConnection(locationId: string) {
    if (useMock || !prisma) {
      return LocalJsonDb.getGhlConnection(locationId);
    }
    try {
      return await prisma.ghlConnection.findUnique({
        where: { locationId }
      });
    } catch (e) {
      console.warn("Prisma error, using mock fallback for GHL connection fetch", e);
      return LocalJsonDb.getGhlConnection(locationId);
    }
  },

  async saveGhlConnection(locationId: string, connectionData: { accessToken: string; refreshToken: string; scopes: string; expiresAt: Date }) {
    if (useMock || !prisma) {
      return LocalJsonDb.saveGhlConnection(locationId, connectionData);
    }
    try {
      return await prisma.ghlConnection.upsert({
        where: { locationId },
        update: connectionData,
        create: {
          locationId,
          ...connectionData
        }
      });
    } catch (e) {
      console.warn("Prisma error, using mock fallback for GHL connection saving", e);
      return LocalJsonDb.saveGhlConnection(locationId, connectionData);
    }
  }
};
