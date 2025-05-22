import { PrismaClient, type Election, type User } from '../generated/prisma/index.js';
import express from 'express';

const prisma = new PrismaClient();

async function main() {
  // Only for a prisma demo, remove in production
  await prisma.election.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: { email: 'my@mail.com', pwHash: 'xx' },
  });
  const demoUser: User | null = await prisma.user.findUnique({
    where: { email: 'my@mail.com' },
  });
  if (demoUser) {
    await prisma.election.create({
      data: {
        name: 'Demo Election',
        votingStart: new Date(),
        votingEnd: new Date(Date.now() + 1000 * 60 * 60 * 24),
        electionCreator: { connect: { id: demoUser.id } },
      },
    });
  }

  const allUsers: User[] = await prisma.user.findMany();
  console.log(allUsers);
  const allElections: Election[] = await prisma.election.findMany();
  console.log(allElections);

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
