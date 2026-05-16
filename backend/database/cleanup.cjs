const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  for (const id of ['bhutiq-fashion', 'electro-hub', 'furniture-living']) {
    try {
      const t = await prisma.template.findUnique({ where: { id } });
      if (t) {
        await prisma.template.delete({ where: { id } });
        console.log('DELETED: ' + id);
      } else {
        console.log('NOT_FOUND: ' + id);
      }
    } catch (e) {
      console.log('ERR ' + id + ': ' + e.message);
    }
  }
  await prisma.$disconnect();
}
main();