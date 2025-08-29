const express = require("express");
const repoController = require("../controllers/repoController.js");

const repoRouter = express.Router();

// Order matters! Keep static routes first, dynamic last
repoRouter.post("/create", repoController.createRepository);
repoRouter.get("/all", repoController.getAllRepositories);
repoRouter.get("/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/user/:userId", repoController.fetchRepositoryForCurrentUser);
repoRouter.put("/update/:id", repoController.updateRepository);
repoRouter.patch("/:id/toggle", repoController.toggleVisibility);
repoRouter.delete("/delete/:id", repoController.deleteRepositoryById);

// Dynamic ID route LAST
repoRouter.get("/:id", repoController.fetchRepositoryById);

module.exports = repoRouter;
