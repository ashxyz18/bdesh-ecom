const { PrismaClient } = require('@bdesh/database');
(async () => {
  const prisma = new PrismaClient();
  
  const placeholderImages = [
    'https://placehold.co/600x600/7c3aed/ffffff?text=Tote',
    'https://placehold.co/600x600/8b5cf6/ffffff?text=Backpack',
    'https://placehold.co/600x600/93c5fd/ffffff?text=Wallet',
    'https://placehold.co/600x600/a78bfa/ffffff?text=Messenger',
    'https://placehold.co/600x600/c084fc/ffffff?text=Duffle'
  ];
  
  const store = await prisma.store.findUnique({ where: { subdomain: 'roseo' }, include: { products: true } });
  
  for (let i = 0; i < store.products.length; i++) {
    await prisma.product.update({
      where: { id: store.products[i].id },
      data: { images: JSON.stringify([placeholderImages[i]]) }
    });
  }
  
  console.log('Updated images for Roseo products');
  await prisma.$disconnect();
})();