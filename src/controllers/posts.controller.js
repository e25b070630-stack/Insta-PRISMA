// src/controllers/posts.controller.js
// Each function reads from req, calls a service function, and sends a response.

const { PrismaClientKnownRequestError } = require("@prisma/client/runtime/library");
const postsService = require("../services/posts.service");

const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt"];

/**
 * POST /posts — Create a post
 */
async function create(req, res) {
  const { imageUrl, caption, location } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  const post = await postsService.createPost({ imageUrl, caption, location });
  return res.status(201).json(post);
}

/**
 * GET /posts — List posts with pagination, sorting, and filtering
 */
async function list(req, res) {
  // --- Pagination ---
  let page  = req.query.page  !== undefined ? Number(req.query.page)  : 1;
  let limit = req.query.limit !== undefined ? Number(req.query.limit) : 10;

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    return res.status(400).json({ error: "page and limit must be positive integers" });
  }

  // Cap limit at 50
  if (limit > 50) limit = 50;

  // --- Sorting ---
  const sortBy = req.query.sortBy !== undefined ? req.query.sortBy : "createdAt";
  const order  = req.query.order  !== undefined ? req.query.order  : "desc";

  if (!ALLOWED_SORT_FIELDS.includes(sortBy)) {
    return res.status(400).json({ error: "sortBy must be one of: createdAt, updatedAt" });
  }

  if (order !== "asc" && order !== "desc") {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  // --- Filtering ---
  const location = req.query.location || undefined;
  const search   = req.query.search   || undefined;

  let from, to;

  if (req.query.from !== undefined) {
    from = new Date(req.query.from);
    if (isNaN(from.getTime())) {
      return res.status(400).json({ error: "from and to must be valid dates" });
    }
  }

  if (req.query.to !== undefined) {
    to = new Date(req.query.to);
    if (isNaN(to.getTime())) {
      return res.status(400).json({ error: "from and to must be valid dates" });
    }
  }

  const result = await postsService.listPosts({ page, limit, sortBy, order, location, search, from, to });
  return res.status(200).json(result);
}

/**
 * GET /posts/:id — Get one post
 */
async function getOne(req, res) {
  const id = parseInt(req.params.id, 10);
  const post = await postsService.getPostById(id);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  return res.status(200).json(post);
}

/**
 * PATCH /posts/:id — Partial update (caption, location only)
 */
async function update(req, res) {
  const id = parseInt(req.params.id, 10);
  const { caption, location } = req.body; // imageUrl silently ignored

  try {
    const post = await postsService.updatePost(id, { caption, location });
    return res.status(200).json(post);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    throw err;
  }
}

/**
 * DELETE /posts/:id — Delete a post
 */
async function remove(req, res) {
  const id = parseInt(req.params.id, 10);

  try {
    await postsService.deletePost(id);
    return res.status(204).send();
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    throw err;
  }
}

module.exports = { create, list, getOne, update, remove };
