// src/services/users.service.js
// All Prisma queries for the User model live here.
// No req/res — pure data layer.

const prisma = require("../db");

/**
 * Create a new user.
 * @param {{ username: string, email: string, fullname: string, bio?: string }} data
 */
async function createUser(data) {
  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      fullname: data.fullname,
      bio: data.bio ?? null,
    },
  });
}

/**
 * Return a paginated, sorted, filtered list of users plus a total count.
 * Both queries run inside a single transaction.
 *
 * @param {{
 *   page: number,
 *   limit: number,
 *   sortBy: string,
 *   order: string,
 *   isPrivate?: boolean,
 *   search?: string
 * }} opts
 * @returns {{ data: object[], meta: { page, limit, total, totalPages } }}
 */
async function listUsers({ page, limit, sortBy, order, isPrivate, search }) {
  // Build the WHERE clause
  const where = {};

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { fullname: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  // Single transaction: fetch page + count
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    data: users,
    meta: { page, limit, total, totalPages },
  };
}

/**
 * Return a single user by id, or null if not found.
 * @param {number} id
 */
async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

/**
 * Partially update a user.
 * Only fullname, bio and isPrivate are editable.
 * @param {number} id
 * @param {{ fullname?: string, bio?: string, isPrivate?: boolean }} data
 */
async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data: {
      ...(data.fullname !== undefined && { fullname: data.fullname }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.isPrivate !== undefined && { isPrivate: data.isPrivate }),
    },
  });
}

/**
 * Delete a user by id.
 * @param {number} id
 */
async function deleteUser(id) {
  return prisma.user.delete({ where: { id } });
}

module.exports = { createUser, listUsers, getUserById, updateUser, deleteUser };
