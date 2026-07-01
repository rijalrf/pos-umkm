import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Use bcrypt to hash the password for customer accounts
  const passwordHash = await bcrypt.hash('member123', 10);

  const customers = [
    {
      email: 'budi@example.com',
      passwordHash,
      name: 'Budi Santoso',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 10, Jakarta Pusat',
      isEmailVerified: true,
    },
    {
      email: 'siti@example.com',
      passwordHash,
      name: 'Siti Rahma',
      phone: '085678901234',
      address: 'Jl. Mawar No. 5, Bandung',
      isEmailVerified: true,
    },
    {
      email: 'joko@example.com',
      passwordHash,
      name: 'Joko Widodo',
      phone: '089999999999',
      address: 'Jl. Melati No. 18, Solo',
      isEmailVerified: true,
    },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { email: c.email },
      update: {
        name: c.name,
        phone: c.phone,
        address: c.address,
        isEmailVerified: c.isEmailVerified,
      },
      create: c,
    });
  }

  console.log('✅ Seeded 3 customer accounts successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
