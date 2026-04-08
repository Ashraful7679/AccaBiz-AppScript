import { PrismaClient } from '@prisma/client';
import { ProductRepository } from './src/repositories/ProductRepository';

const prisma = new PrismaClient();

async function testInventory() {
  console.log('--- Starting Inventory Test ---');

  try {
    // 1. Create a test product
    const product = await prisma.product.create({
      data: {
        name: 'Test Stock Product',
        code: 'TEST-001',
        companyId: '235280c2-f037-4249-8696-bc38738a190e', // Updated with valid ID
        unitPrice: 100,
        isInventory: true,
        openingStock: 10,
        quantityOnHand: 10,
      },
    });
    console.log('Created product with 10 units on hand.');

    // 2. Test Increase Stock (Purchase simulation)
    console.log('Simulating purchase: +5 units');
    await prisma.$transaction(async (tx) => {
      await ProductRepository.updateStock(tx, product.id, 5);
    });
    
    let updated = await prisma.product.findUnique({ where: { id: product.id } });
    console.log(`New quantity: ${updated?.quantityOnHand} (Expected: 15)`);

    // 3. Test Decrease Stock (Sales simulation)
    console.log('Simulating sale: -3 units');
    await prisma.$transaction(async (tx) => {
      await ProductRepository.updateStock(tx, product.id, -3);
    });
    
    updated = await prisma.product.findUnique({ where: { id: product.id } });
    console.log(`New quantity: ${updated?.quantityOnHand} (Expected: 12)`);

    // 4. Test Negative Stock Block
    console.log('Simulating sale that exceeds stock: -15 units');
    try {
      await prisma.$transaction(async (tx) => {
        await ProductRepository.updateStock(tx, product.id, -15);
      });
      console.error('FAIL: Negative stock was NOT blocked!');
    } catch (error: any) {
      console.log('SUCCESS: Blocked negative stock. Error:', error.message);
    }

    // 5. Verify final balance is unchanged after failed transaction
    updated = await prisma.product.findUnique({ where: { id: product.id } });
    console.log(`Final quantity after rolled back transaction: ${updated?.quantityOnHand} (Expected: 12)`);

    // Cleanup
    await prisma.product.delete({ where: { id: product.id } });
    console.log('Cleanup: Test product deleted.');

  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testInventory();
