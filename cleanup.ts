import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Finding duplicate logs...');
  const logs = await prisma.habitLog.findMany();
  
  const seen = new Set();
  const toDelete = [];
  
  for (const log of logs) {
    const key = `${log.habitId}-${log.date}`;
    if (seen.has(key)) {
      toDelete.push(log.id);
    } else {
      seen.add(key);
    }
  }
  
  if (toDelete.length > 0) {
    console.log(`Found ${toDelete.length} duplicate logs. Deleting...`);
    await prisma.habitLog.deleteMany({
      where: {
        id: {
          in: toDelete
        }
      }
    });
    console.log('Duplicates deleted.');
  } else {
    console.log('No duplicate logs found.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
