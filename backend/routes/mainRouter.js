const express = require("express");
const userRouter = require("./user.router");

const mainRouter = express.Router();
const repoRouter = require("./repo.router");
// Mount userRouter with no prefix
mainRouter.use("/", userRouter);
mainRouter.use("/", repoRouter);

// Root route
mainRouter.get("/", (req, res) => {
  res.send("🚀 Welcome to the CodeHub API");
});

module.exports = mainRouter;
