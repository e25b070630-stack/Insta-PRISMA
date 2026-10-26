// src/routes/users.routes.js
// Express Router for all /users endpoints.

const { Router } = require("express");
const usersController = require("../controllers/users.controller");

const router = Router();

router.post("/", usersController.create);
router.get("/", usersController.list);
router.get("/:id", usersController.getOne);
router.patch("/:id", usersController.update);
router.delete("/:id", usersController.remove);

module.exports = router;
