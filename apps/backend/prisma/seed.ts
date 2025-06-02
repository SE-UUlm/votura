import { Prisma, PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  const initUser: Prisma.UserCreateInput = {
    email: 'user@votura.org',
    passwordHash: '123456789',
  };

  await prisma.user.upsert({
    where: {
      email: 'user@votura.org',
    },
    update: {},
    create: initUser,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
