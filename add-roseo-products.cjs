const { PrismaClient } = require('@bdesh/database');
(async () => {
  const prisma = new PrismaClient();
  const store = await prisma.store.findUnique({ where: { subdomain: 'roseo' } });
  
  const products = [
    { name: 'Classic Leather Tote', description: 'Handcrafted full-grain leather tote with brass hardware', price: 12900, images: JSON.stringify(['https://images.unsplash.com/photo-1584917424877-9a5af5c53d4b?w=600']), featured: true },
    { name: 'Vintage Messenger Bag', description: 'Distressed leather messenger with adjustable strap', price: 9900, images: JSON.stringify(['https://images.unsplash.com/photo-1553062409-98d8602540ef?w=600']), featured: true },
    { name: 'Leather Backpack', description: 'Premium leather backpack with laptop compartment', price: 14900, images: JSON.stringify(['https://images.unsplash.com/photo-1548036327-9cc1d7ee0c8c?w=600']), featured: true },
    { name: 'Slim Card Wallet', description: 'Minimalist leather wallet with RFID protection', price: 3900, images: JSON.stringify(['https://images.unsplash.com/photo-1627123424594-496670d8f4d7?w=600']), featured: false },
    { name: 'Weekend Duffle Bag', description: 'Spacious leather duffle for weekend getaways', price: 11900, images: JSON.stringify(['https://images.unsplash.com/photo-1581605405669-fcdfbf74dc3e?w=600']), featured: false },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        storeId: store.id,
        ...p,
        slug: p.name.toLowerCase().replace(/ /g, '-'),
        status: 'active'
      }
    });
  }
  console.log('Added sample products to Roseo store');
  await prisma.$disconnect();
})();