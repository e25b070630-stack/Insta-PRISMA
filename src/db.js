// src/db.js
// Singleton Prisma Client with pg driver adapter (required by Prisma v7).
// Import this wherever you need DB access.

require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
