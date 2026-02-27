async function main() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({ adapter: { provider: 'postgres', url: process.env.DATABASE_URL } });
    const users = await prisma.user.findMany({ take: 5 });
    console.log('OK users count:', users.length);
    console.log(users.map(u=>({id:u.id,firebaseId:u.firebaseId,email:u.email})));
    await prisma.$disconnect();
  } catch (e) {
    console.error('ERR', e);
    process.exitCode = 1;
  }
}

main();
