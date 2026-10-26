// src/routes/posts.routes.js
// Express Router for all /posts endpoints.

const { Router } = require("express");
const postsController = require("../controllers/posts.controller");

const router = Router();

router.post("/", postsController.create);
router.get("/", postsController.list);
router.get("/:id", postsController.getOne);
router.patch("/:id", postsController.update);
router.delete("/:id", postsController.remove);

module.exports = router;
