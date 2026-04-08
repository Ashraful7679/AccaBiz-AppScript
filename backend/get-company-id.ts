import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const company = await prisma.company.findFirst();
  console.log('COMPANY_ID:', company?.id);
  await prisma.$disconnect();
}
main();
