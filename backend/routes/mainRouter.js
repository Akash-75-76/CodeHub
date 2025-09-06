const express = require("express");
const jwt = require("jsonwebtoken"); 
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");
const path = require("path");

const mainRouter = express.Router();

// Use proper base paths
mainRouter.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // Serve static files
mainRouter.use("/api/users", userRouter);
mainRouter.use("/api/repos", repoRouter);
mainRouter.use("/api/issues", issueRouter);

mainRouter.get("/", (req, res) => {
  res.send("Welcome!");
});

module.exports = mainRouter;
