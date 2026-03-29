const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() { 
  const board = await prisma.board.create({
    data: {
      title: 'Sample Board',
      lists: {
        create: [
          {
            title: 'To Do',
            order: 0,
            cards: {
              create: [
                {
                  title: 'Card 1',
                  description: 'Description for card 1',
                  order: 0,
                  members: ['Alice', 'Bob'],
                  attachments: [],
                  dueDate: new Date('2024-12-31'),
                  checklist: {
                    create: [
                      { text: 'Item 1', done: true },
                      { text: 'Item 2', done: false },
                    ],
                  },
                },
                {
                  title: 'Card 2',
                  order: 1,
                  members: [],
                  attachments: [],
                },
              ],
            },
          },
          {
            title: 'In Progress',
            order: 1,
            cards: {
              create: [
                {
                  title: 'Card 3',
                  order: 0,
                  members: [],
                  attachments: [],
                },
              ],
            },
          },
          {
            title: 'Done',
            order: 2,
          },
        ],
      },
    },
  });

  const label1 = await prisma.label.create({
    data: {
      name: 'Urgent',
      color: '#ff0000',
    },
  });

  const label2 = await prisma.label.create({
    data: {
      name: 'Feature',
      color: '#00ff00',
    },
  });

  // Assign labels to cards
  const card1 = await prisma.card.findFirst({ where: { title: 'Card 1' } });
  await prisma.cardLabel.create({
    data: {
      cardId: card1.id,
      labelId: label1.id,
    },
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