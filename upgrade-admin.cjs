const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  // List all users
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, name: true }
  });
  
  console.log('All users:');
  users.forEach(u => console.log('  ' + u.email + ' - ' + u.role + ' (' + u.name + ')'));
  
  // Find the first MERCHANT user and upgrade to ADMIN
  const merchant = users.find(u => u.role === 'MERCHANT');
  if (merchant) {
    const updated = await prisma.user.update({
      where: { id: merchant.id },
      data: { role: 'ADMIN' }
    });
    console.log('\nUpgraded ' + updated.email + ' to ADMIN role');
  } else {
    console.log('\nNo MERCHANT user found to upgrade');
  }
  
  // Verify
  const after = await prisma.user.findMany({
    select: { id: true, email: true, role: true, name: true }
  });
  console.log('\nUsers after update:');
  after.forEach(u => console.log('  ' + u.email + ' - ' + u.role + ' (' + u.name + ')'));
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
