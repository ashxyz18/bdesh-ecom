const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const template = await prisma.template.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  console.log(template ? template.buildLog : 'no template');
}
main().finally(() => prisma.$disconnect());
