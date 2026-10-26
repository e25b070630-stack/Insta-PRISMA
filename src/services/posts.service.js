// src/services/posts.service.js
// All Prisma queries for the Post model live here.
// No req/res — pure data layer.

const prisma = require("../db");

/**
 * Create a new post.
 * @param {{ imageUrl: string, caption?: string, location?: string }} data
 */
async function createPost(data) {
  return prisma.post.create({
    data: {
      imageUrl: data.imageUrl,
      caption: data.caption ?? null,
      location: data.location ?? null,
    },
  });
}

/**
 * Return a paginated, sorted, filtered list of posts plus a total count.
 * Both queries run inside a single transaction.
 *
 * @param {{
 *   page: number,
 *   limit: number,
 *   sortBy: string,
 *   order: string,
 *   location?: string,
 *   search?: string,
 *   from?: Date,
 *   to?: Date,
 * }} opts
 * @returns {{ data: object[], meta: { page, limit, total, totalPages } }}
 */
async function listPosts({ page, limit, sortBy, order, location, search, from, to }) {
  // Build the WHERE clause
  const where = {};

  if (location) {
    // Case-insensitive exact match on location
    where.location = { equals: location, mode: "insensitive" };
  }

  if (search) {
    where.caption = { contains: search, mode: "insensitive" };
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to)   where.createdAt.lt  = to;   // to is exclusive
  }

  const skip = (page - 1) * limit;

  // Single transaction: fetch page + count
  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    data: posts,
    meta: { page, limit, total, totalPages },
  };
}

/**
 * Return a single post by id, or null if not found.
 * @param {number} id
 */
async function getPostById(id) {
  return prisma.post.findUnique({ where: { id } });
}

/**
 * Partially update a post.
 * Only caption and location are editable.
 * @param {number} id
 * @param {{ caption?: string, location?: string }} data
 */
async function updatePost(id, data) {
  return prisma.post.update({
    where: { id },
    data: {
      ...(data.caption !== undefined && { caption: data.caption }),
      ...(data.location !== undefined && { location: data.location }),
    },
  });
}

/**
 * Delete a post by id.
 * @param {number} id
 */
async function deletePost(id) {
  return prisma.post.delete({ where: { id } });
}

module.exports = { createPost, listPosts, getPostById, updatePost, deletePost };
