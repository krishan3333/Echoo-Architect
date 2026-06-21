import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function createPrismaClient() {
  const url = process.env.DATABASE_URL!
  if (url.startsWith('prisma+postgres://')) {
    return new PrismaClient({ accelerateUrl: url })
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof createPrismaClient>
} & typeof global

const prisma = globalThis.prismaGlobal ?? createPrismaClient()
export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}
