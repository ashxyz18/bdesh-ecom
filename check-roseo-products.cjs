const { PrismaClient } = require('@bdesh/database');
(async () => {
  const prisma = new PrismaClient();
  const products = await prisma.product.findMany({ 
    where: { store: { subdomain: 'roseo' } },
    select: { id: true, name: true, price: true, images: true }
  });
  console.log('Roseo products:', JSON.stringify(products, null, 2));
  await prisma.$disconnect();
})();