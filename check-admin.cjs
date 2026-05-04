const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  
  // Check for existing admin
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  
  if (admins.length > 0) {
    console.log('Admin users already exist:');
    admins.forEach(a => console.log('  - ' + a.email + ' (' + a.name + ')'));
  } else {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@bdesh.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Created admin user:');
    console.log('  Email: ' + admin.email);
    console.log('  Password: admin123');
  }
  
  // Also list all users
  const allUsers = await prisma.user.findMany({ select: { email: true, name: true, role: true } });
  console.log('\nAll users:');
  allUsers.forEach(u => console.log('  - ' + u.email + ' (' + u.name + ') [' + u.role + ']'));
  
  await prisma.$disconnect();
}

main().catch(console.error);
