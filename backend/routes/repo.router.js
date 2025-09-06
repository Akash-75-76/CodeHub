const express = require("express");
const repoController = require("../controllers/repoController");
const auth = require("../middleware/auth");

const repoRouter = express.Router();

// ✅ Put static routes BEFORE any ":param" routes
repoRouter.get("/public", repoController.getPublicRepositories);
repoRouter.get("/following", auth, repoController.getFollowingRepositories);
repoRouter.get("/all", repoController.getAllRepositories);

// Create repo
repoRouter.post("/create", auth, repoController.createRepository);

// Fetch by name
repoRouter.get("/name/:name", repoController.fetchRepositoryByName);

// Fetch all repos for a user
repoRouter.get("/user/:userID", auth, repoController.fetchRepositoriesForCurrentUser);

// Fetch by ID (must come AFTER public/following)
repoRouter.get("/:id", repoController.fetchRepositoryById);

// Update repo
repoRouter.put("/update/:id", auth, repoController.updateRepositoryById);

// Delete repo
repoRouter.delete("/delete/:id", auth, repoController.deleteRepositoryById);

// Toggle visibility
repoRouter.patch("/toggle/:id", auth, repoController.toggleVisibilityById);

module.exports = repoRouter;
