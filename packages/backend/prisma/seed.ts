import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean database to remove old categories/products and prevent duplicates
  await prisma.transactionItem.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  const adminPassword = await bcrypt.hash('admin123', 10);
  const cashierPassword = await bcrypt.hash('kasir123', 10);

  await prisma.user.upsert({
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

  await prisma.user.upsert({
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

  // Store Setting
  await prisma.storeSetting.upsert({
    where: { id: 'default' },
    update: {
      storeName: 'Kantin Nusantara',
      address: 'Pusat Kuliner Nusantara, Jakarta',
      phone: '081234567890',
      email: 'kantin@kantinnusantara.id',
    },
    create: {
      id: 'default',
      storeName: 'Kantin Nusantara',
      address: 'Pusat Kuliner Nusantara, Jakarta',
      phone: '081234567890',
      email: 'kantin@kantinnusantara.id',
    },
  });

  // Categories definition
  const catMainDish = await prisma.category.create({
    data: { name: 'Makanan Utama', description: 'Nasi goreng, mie Jawa, sate, dan makanan berat lainnya' },
  });

  const catSnacks = await prisma.category.create({
    data: { name: 'Makanan Ringan', description: 'Pisang goreng, bakwan, singkong keju, dan camilan lainnya' },
  });

  const catFreshDrinks = await prisma.category.create({
    data: { name: 'Minuman Dingin', description: 'Es teh manis, jus segar, es kelapa muda, dan lemon tea' },
  });

  const catHotDrinks = await prisma.category.create({
    data: { name: 'Minuman Hangat', description: 'Kopi susu gula aren, kopi tubruk, teh tarik, dan wedang jahe' },
  });

  const catDesserts = await prisma.category.create({
    data: { name: 'Pencuci Mulut', description: 'Es campur durian, roti bakar, kue cubit, dan ketan mangga' },
  });

  // 20 Delicious Food and Drink Products with Unsplash URLs
  const productsData = [
    // 1. Makanan Utama
    {
      name: 'Nasi Goreng Kampung',
      sku: 'SKU-MAK-001',
      categoryId: catMainDish.id,
      price: 25000,
      stock: 30,
      description: 'Nasi goreng bumbu tradisional dengan telur mata sapi, kerupuk, dan acar segar.',
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Mie Goreng Jawa',
      sku: 'SKU-MAK-002',
      categoryId: catMainDish.id,
      price: 22000,
      stock: 25,
      description: 'Mie kuning goreng dengan kol, sawi, suwiran ayam, dan taburan bawang goreng harum.',
      imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Sate Ayam Madura (Isi 10)',
      sku: 'SKU-MAK-003',
      categoryId: catMainDish.id,
      price: 28000,
      stock: 20,
      description: 'Sate daging ayam pilihan dibakar harum dengan siraman bumbu kacang gurih manis.',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Soto Ayam Lamongan',
      sku: 'SKU-MAK-004',
      categoryId: catMainDish.id,
      price: 20000,
      stock: 35,
      description: 'Soto ayam kuah kuning hangat gurih taburan koya khas, lengkap dengan soun dan kol.',
      imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600&auto=format&fit=crop',
    },

    // 2. Makanan Ringan / Camilan
    {
      name: 'Pisang Goreng Pasir (Isi 5)',
      sku: 'SKU-CAM-001',
      categoryId: catSnacks.id,
      price: 15000,
      stock: 40,
      description: 'Pisang goreng berbalut tepung roti krispi garing di luar manis lembut di dalam.',
      imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Cireng Rujak Pedas',
      sku: 'SKU-CAM-002',
      categoryId: catSnacks.id,
      price: 12000,
      stock: 50,
      description: 'Cireng goreng renyah kenyal dengan cocolan saus sambal rujak manis pedas asam.',
      imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Singkong Goreng Merekah',
      sku: 'SKU-CAM-003',
      categoryId: catSnacks.id,
      price: 14000,
      stock: 30,
      description: 'Singkong gurih empuk merekah dengan rasa bawang ketumbar yang meresap.',
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Bakwan Sayur Garing (Isi 5)',
      sku: 'SKU-CAM-004',
      categoryId: catSnacks.id,
      price: 10000,
      stock: 45,
      description: 'Gorengan bakwan sayur renyah lengkap dengan cocolan sambal atau cabai rawit hijau.',
      imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=600&auto=format&fit=crop',
    },

    // 3. Minuman Dingin
    {
      name: 'Es Teh Manis Jumbo',
      sku: 'SKU-MIN-001',
      categoryId: catFreshDrinks.id,
      price: 5000,
      stock: 100,
      description: 'Es teh manis segar pelepas dahaga berukuran gelas besar jumbo.',
      imageUrl: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Es Jeruk Peras Segar',
      sku: 'SKU-MIN-002',
      categoryId: catFreshDrinks.id,
      price: 8000,
      stock: 80,
      description: 'Es dari perasan buah jeruk asli manis segar kaya vitamin C.',
      imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Es Kelapa Muda Gula Aren',
      sku: 'SKU-MIN-003',
      categoryId: catFreshDrinks.id,
      price: 12000,
      stock: 50,
      description: 'Es kelapa muda serut dengan pemanis sirup gula aren kental yang legit.',
      imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Es Lemon Tea Madu',
      sku: 'SKU-MIN-004',
      categoryId: catFreshDrinks.id,
      price: 10000,
      stock: 60,
      description: 'Teh lemon segar dingin dengan pemanis madu murni alami.',
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop',
    },

    // 4. Minuman Hangat
    {
      name: 'Kopi Susu Gula Aren',
      sku: 'SKU-KOP-001',
      categoryId: catHotDrinks.id,
      price: 15000,
      stock: 70,
      description: 'Kopi espresso hangat dengan campuran susu segar dan legitnya gula aren cair.',
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Kopi Tubruk Hitam',
      sku: 'SKU-KOP-002',
      categoryId: catHotDrinks.id,
      price: 10000,
      stock: 90,
      description: 'Kopi hitam tradisional tubruk seduh kental beraroma harum menusuk.',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Teh Tarik Hangat',
      sku: 'SKU-KOP-003',
      categoryId: catHotDrinks.id,
      price: 12000,
      stock: 50,
      description: 'Teh tarik berbusa melimpah perpaduan pekatnya teh hitam dan susu manis.',
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Wedang Jahe Susu',
      sku: 'SKU-KOP-004',
      categoryId: catHotDrinks.id,
      price: 10000,
      stock: 40,
      description: 'Minuman jahe merah hangat berkhasiat dipadu krimer kental manis hangat di tenggorokan.',
      imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=600&auto=format&fit=crop',
    },

    // 5. Pencuci Mulut / Dessert
    {
      name: 'Es Campur Durian',
      sku: 'SKU-DES-001',
      categoryId: catDesserts.id,
      price: 20000,
      stock: 25,
      description: 'Es campur manis isi cincau, cendol, kolang-kaling dengan tambahan buah durian lezat.',
      imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Kue Cubit Setengah Matang',
      sku: 'SKU-DES-002',
      categoryId: catDesserts.id,
      price: 12000,
      stock: 30,
      description: 'Kue cubit panggang setengah matang lumer meleleh di mulut taburan meses cokelat.',
      imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Roti Bakar Cokelat Keju',
      sku: 'SKU-DES-003',
      categoryId: catDesserts.id,
      price: 18000,
      stock: 20,
      description: 'Roti bakar tebal mentega dengan isian melimpah cokelat meises dan parutan keju cheddar.',
      imageUrl: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Ketan Susu Mangga',
      sku: 'SKU-DES-004',
      categoryId: catDesserts.id,
      price: 22000,
      stock: 15,
      description: 'Ketan putih gurih kukus bersiram saus vla susu manis manis asam potongan mangga harum manis.',
      imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=600&auto=format&fit=crop',
    },
  ];

  for (const item of productsData) {
    await prisma.product.upsert({
      where: { sku: item.sku },
      update: {
        name: item.name,
        categoryId: item.categoryId,
        price: item.price,
        stock: item.stock,
        description: item.description,
        imageUrl: item.imageUrl,
      },
      create: {
        name: item.name,
        sku: item.sku,
        categoryId: item.categoryId,
        price: item.price,
        stock: item.stock,
        description: item.description,
        imageUrl: item.imageUrl,
      },
    });
  }

  console.log('✅ Seed completed with 20 culinary products (Makanan & Minuman)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
