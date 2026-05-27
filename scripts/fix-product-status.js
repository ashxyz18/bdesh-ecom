#!/usr/bin/env node

/**
 * Script to update all draft products to active status
 * This fixes the issue where products were created without explicit status
 * and defaulted to "draft", making them invisible on storefronts.
 * 
 * Usage: node scripts/fix-product-status.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Finding draft products...');
  
  const draftProducts = await prisma.product.findMany({
    where: {
      status: 'draft',
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      status: true,
      storeId: true
    }
  });

  console.log(`📦 Found ${draftProducts.length} draft products`);

  if (draftProducts.length === 0) {
    console.log('✅ No draft products found. All products are already active or archived.');
    return;
  }

  console.log('\n📝 Products to be updated:');
  draftProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} (${product.id}) - Store: ${product.storeId}`);
  });

  console.log('\n🔄 Updating products to "active" status...');

  const result = await prisma.product.updateMany({
    where: {
      status: 'draft',
      deletedAt: null
    },
    data: {
      status: 'active'
    }
  });

  console.log(`✅ Successfully updated ${result.count} products to "active" status!`);
  console.log('🎉 Products are now visible on storefronts.');
}

main()
  .catch((error) => {
    console.error('❌ Error updating products:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
