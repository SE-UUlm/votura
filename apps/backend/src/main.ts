import { PrismaClient, type User } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  const allUsers: User[] = await prisma.user.findMany();
  console.log(allUsers);
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
