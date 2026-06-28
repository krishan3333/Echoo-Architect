import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function normalizeSslMode(url: string): string {
  return url.replace(/sslmode=(prefer|require|verify-ca)(\b|&|$)/, 'sslmode=verify-full$2')
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL!
  if (url.startsWith('prisma+postgres://')) {
    return new PrismaClient({ accelerateUrl: url })
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: normalizeSslMode(url) }) })
}

declare const globalThis: {
  prismaGlobal: PrismaClient
} & typeof global

let _prisma: PrismaClient | null = null

function getPrismaInstance(): PrismaClient {
  if (globalThis.prismaGlobal) return globalThis.prismaGlobal
  if (!_prisma) {
    _prisma = createPrismaClient()
    if (process.env.NODE_ENV !== 'production') {
      globalThis.prismaGlobal = _prisma
    }
  }
  return _prisma
}

// Lazy proxy — only initializes the real client on first property access (i.e. first query),
// not at module import time. This lets Trigger.dev import the file safely during build.
export default new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    const instance = getPrismaInstance()
    const value = (instance as any)[prop]
    return typeof value === 'function' ? value.bind(instance) : value
  },
})
