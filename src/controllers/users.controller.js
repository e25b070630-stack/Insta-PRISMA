// src/controllers/users.controller.js
// Each function reads from req, calls a service function, and sends a response.

const { PrismaClientKnownRequestError } = require("@prisma/client/runtime/library");
const usersService = require("../services/users.service");

const ALLOWED_SORT_FIELDS = ["createdAt", "username", "fullname"];

/**
 * POST /users — Create a user
 */
async function create(req, res) {
  const { username, email, fullname, bio } = req.body;

  // Validate required fields
  if (!username || !email || !fullname) {
    return res
      .status(400)
      .json({ error: "username, email and fullname are required" });
  }

  try {
    const user = await usersService.createUser({ username, email, fullname, bio });
    return res.status(201).json(user);
  } catch (err) {
    // Prisma unique-constraint violation → P2002
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      return res.status(409).json({ error: "username or email already taken" });
    }
    throw err;
  }
}

/**
 * GET /users — List users with pagination, sorting, and filtering
 */
async function list(req, res) {
  // --- Pagination ---
  let page = req.query.page !== undefined ? Number(req.query.page) : 1;
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
    return res.status(400).json({ error: "sortBy must be one of: createdAt, username, fullname" });
  }

  if (order !== "asc" && order !== "desc") {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  // --- Filtering ---
  let isPrivate;
  if (req.query.isPrivate !== undefined) {
    if (req.query.isPrivate === "true")       isPrivate = true;
    else if (req.query.isPrivate === "false") isPrivate = false;
    else {
      return res.status(400).json({ error: "isPrivate must be true or false" });
    }
  }

  const search = req.query.search || undefined;

  const result = await usersService.listUsers({ page, limit, sortBy, order, isPrivate, search });
  return res.status(200).json(result);
}

/**
 * GET /users/:id — Get one user
 */
async function getOne(req, res) {
  const id = parseInt(req.params.id, 10);
  const user = await usersService.getUserById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.status(200).json(user);
}

/**
 * PATCH /users/:id — Partial update
 */
async function update(req, res) {
  const id = parseInt(req.params.id, 10);
  const { fullname, bio, isPrivate } = req.body; // username/email silently ignored

  try {
    const user = await usersService.updateUser(id, { fullname, bio, isPrivate });
    return res.status(200).json(user);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    throw err;
  }
}

/**
 * DELETE /users/:id — Delete a user
 */
async function remove(req, res) {
  const id = parseInt(req.params.id, 10);

  try {
    await usersService.deleteUser(id);
    return res.status(204).send();
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    throw err;
  }
}

module.exports = { create, list, getOne, update, remove };
