const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
console.log('duelQueue:', typeof p.duelQueue);
console.log('duelRoom:', typeof p.duelRoom);
p.$disconnect();
