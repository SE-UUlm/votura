import { PrismaClient, type User } from '../generated/prisma/index.js';
import express from 'express';

const prisma = new PrismaClient();

async function main() {
  const allUsers: User[] = await prisma.user.findMany();
  console.log(allUsers);

  const app = express();
  const port = 5000;

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
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
