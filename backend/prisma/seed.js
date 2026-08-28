/**
 * Seed data awal:
 * - 1 user pengaju
 * - 1 user penerima (sekretaris)
 *
 * Jalankan: npx prisma db seed
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Buat user pengaju
  const pengaju = await prisma.user.upsert({
    where: { email: 'pengaju@ksrpmi.com' },
    update: {},
    create: {
      nama: 'Budi Santoso',
      email: 'pengaju@ksrpmi.com',
      password: hashedPassword,
      role: 'pengaju',
    },
  });

  // Buat user penerima (sekretaris)
  const penerima = await prisma.user.upsert({
    where: { email: 'sekretaris@ksrpmi.com' },
    update: {},
    create: {
      nama: 'Ani Rahayu',
      email: 'sekretaris@ksrpmi.com',
      password: hashedPassword,
      role: 'penerima',
    },
  });

  console.log('✅ Users berhasil dibuat:');
  console.log(`   Pengaju  → ${pengaju.email} (password: password123)`);
  console.log(`   Penerima → ${penerima.email} (password: password123)`);
  console.log('');
  console.log('⚠️  Jangan lupa ganti password setelah deploy!');
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
