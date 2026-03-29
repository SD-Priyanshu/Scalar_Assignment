// Server entry point

require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/utils/db');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 Kanban Board API Server Running   ║
║  📍 http://localhost:${PORT}               ║
║  🗄️  Database: Connected               ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✓ Database connection closed');
    process.exit(0);
  });
});

// Handle unhandled rejections
process.on('unhandledRejection', async (err) => {
  console.error('Unhandled Rejection:', err);
  await prisma.$disconnect();
  process.exit(1);
});
