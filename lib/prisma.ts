import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// pg v9 will change the semantics of sslmode=require/prefer/verify-ca.
// Explicitly using verify-full locks in the current secure behaviour now.
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
  prismaGlobal: ReturnType<typeof createPrismaClient>
} & typeof global

const prisma = globalThis.prismaGlobal ?? createPrismaClient()
export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}
