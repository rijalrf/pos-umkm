import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const cashierPassword = await bcrypt.hash('kasir123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      fullName: 'Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const cashier = await prisma.user.upsert({
    where: { username: 'kasir' },
    update: {},
    create: {
      username: 'kasir',
      passwordHash: cashierPassword,
      fullName: 'Kasir Demo',
      role: 'CASHIER',
      isActive: true,
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Makanan' },
      update: {},
      create: { name: 'Makanan', description: 'Produk makanan' },
    }),
    prisma.category.upsert({
      where: { name: 'Minuman' },
      update: {},
      create: { name: 'Minuman', description: 'Produk minuman' },
    }),
    prisma.category.upsert({
      where: { name: 'Lainnya' },
      update: {},
      create: { name: 'Lainnya', description: 'Produk lainnya' },
    }),
  ]);

  const storeSetting = await prisma.storeSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Toko Demo',
      address: 'Jl. Contoh No. 123, Jakarta',
      phone: '081234567890',
      email: 'toko@example.com',
    },
  });

  console.log('✅ Seed completed');
  console.log({ admin, cashier, categories, storeSetting });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
