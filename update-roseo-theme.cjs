const { PrismaClient } = require('@bdesh/database');
(async () => {
  const prisma = new PrismaClient();
  const stores = await prisma.store.update({
    where: { subdomain: 'roseo' },
    data: { theme: JSON.stringify({ templateId: 'roseo' }) },
    select: { name: true, subdomain: true, theme: true }
  });
  console.log('Updated:', JSON.stringify(stores, null, 2));
  await prisma.$disconnect();
})();