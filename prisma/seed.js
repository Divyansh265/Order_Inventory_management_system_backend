import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const hashedAdmin = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: hashedAdmin },
    create: { name: 'Admin User', email: 'admin@example.com', password: hashedAdmin, role: 'admin' },
  });

  const hashedStaff = await bcrypt.hash('password123456', 10);
  await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: { password: hashedStaff },
    create: { name: 'Staff User', email: 'staff@example.com', password: hashedStaff, role: 'staff' },
  });

  const products = [
    { name: 'Laptop', sku: 'LAP-001', price: 1299.99, stockQuantity: 50 },
    { name: 'Mouse', sku: 'MOU-001', price: 29.99, stockQuantity: 200 },
    { name: 'USB-C Hub', sku: 'HUB-001', price: 49.99, stockQuantity: 8 },
    { name: 'Keyboard', sku: 'KEY-001', price: 89.99, stockQuantity: 5 },
    { name: 'Monitor', sku: 'MON-001', price: 399.99, stockQuantity: 30 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  console.log('Seed complete!');
  console.log('Admin: admin@example.com / password123');
  console.log('Staff: staff@example.com / password123456');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
