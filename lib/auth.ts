import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { createHmac } from 'node:crypto';
import { Platform } from '@prisma/client';
import { getEnv } from '@/lib/env';
import { prisma } from '@/lib/db';

type SocialProviders = NonNullable<BetterAuthOptions['socialProviders']>;

const PLATFORM_VALUES = Object.values(Platform);
const DEVICE_COOKIE = 'ms_device';
const DEFAULT_GROUP_NAME = 'Music Story Community';

function buildSocialProviders(env: ReturnType<typeof getEnv>): SocialProviders {
  return {
    google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
    github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET },
    discord: { clientId: env.DISCORD_CLIENT_ID, clientSecret: env.DISCORD_CLIENT_SECRET },
  };
}

function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const pepper = process.env.CODE_PEPPER ?? getEnv().BETTER_AUTH_SECRET;
  return createHmac('sha256', pepper).update(ip).digest('hex');
}

function readCookie(header: string | null | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (rawKey === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

async function ensureDeviceForSession(
  userId: string,
  cookieHeader: string | null | undefined,
  userAgent: string | null | undefined,
) {
  const cookieValue = readCookie(cookieHeader, DEVICE_COOKIE);
  if (cookieValue) {
    const existing = await prisma.device.findFirst({
      where: { id: cookieValue, userId, revokedAt: null },
      select: { id: true },
    });
    if (existing) {
      await prisma.device.update({ where: { id: existing.id }, data: { lastSeenAt: new Date() } });
      return existing.id;
    }
  }

  const device = await prisma.device.create({
    data: {
      userId,
      label: 'Device',
      userAgent: userAgent?.slice(0, 300),
    },
    select: { id: true },
  });
  return device.id;
}

async function ensureFirstSignInData(userId: string) {
  const existingConnections = await prisma.platformConnection.findMany({
    where: { userId },
    select: { platform: true },
  });
  const existing = new Set(existingConnections.map((c) => c.platform));
  const missing = PLATFORM_VALUES.filter((platform) => !existing.has(platform));
  if (missing.length > 0) {
    await prisma.platformConnection.createMany({
      data: missing.map((platform) => ({ userId, platform, status: 'NOT_CONNECTED', simulated: true })),
      skipDuplicates: true,
    });
  }

  const group = await prisma.group.upsert({
    where: { name: DEFAULT_GROUP_NAME },
    update: {},
    create: { name: DEFAULT_GROUP_NAME },
    select: { id: true },
  });
  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId } },
    update: {},
    create: { groupId: group.id, userId },
  });
}

let cachedAuth: ReturnType<typeof betterAuth> | undefined;

export function getAuth() {
  if (cachedAuth) return cachedAuth;

  const env = getEnv();
  const auth = betterAuth({
    appName: 'Music Story',
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    socialProviders: buildSocialProviders(env),
    session: {
      cookieCache: {
        enabled: false,
      },
    },
    advanced: {
      ipAddress: {
        disableIpTracking: true,
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const name =
              typeof user.name === 'string' && user.name.trim().length > 0
                ? user.name.trim().slice(0, 40)
                : 'Member';
            return {
              data: {
                displayName: name,
                image: null,
              },
            };
          },
          after: async (user) => {
            await ensureFirstSignInData(user.id);
          },
        },
      },
      session: {
        create: {
          before: async (session, ctx) => {
            const headers = ctx?.headers;
            const cookieHeader = headers?.get('cookie');
            const userAgent = headers?.get('user-agent');
            const ip = ctx?.request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
            const deviceId = await ensureDeviceForSession(session.userId, cookieHeader, userAgent);
            return {
              data: {
                deviceId,
                ipAddress: hashIp(ip),
                userAgent: userAgent?.slice(0, 300) ?? null,
              },
            };
          },
        },
      },
    },
    plugins: [nextCookies()],
  });

  cachedAuth = auth as unknown as ReturnType<typeof betterAuth>;
  return cachedAuth;
}
