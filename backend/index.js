// index.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const mainRouter=require("./routes/mainRouter");
// Load environment variables
dotenv.config();

// === Controllers (CLI commands) ===
const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

// === Yargs CLI Commands ===
yargs(hideBin(process.argv))
  .command("start", "Starts the server", {}, startServer)
  .command("init", "Initialize a new repository", {}, initRepo)
  .command(
    "add <file>",
    "Add a file to the repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "File to add to staging area",
        type: "string",
      });
    },
    addRepo
  )
  .command(
    "commit <message>",
    "Commit changes to the repository",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit message",
        type: "string",
      });
    },
    commitRepo
  )
  .command("push", "Push commits to S3", {}, pushRepo)
  .command("pull", "Pull commits from S3", {}, pullRepo)
  .command(
    "revert <commitID>",
    "Revert to a specific commit",
    (yargs) => {
      yargs.positional("commitID", {
        describe: "Commit ID to revert to",
        type: "string",
      });
    },
    revertRepo
  )
  .demandCommand(1, "You must specify a command") // helpful for errors
  .help()
  .argv;

// === Server function ===
function startServer() {
  const app = express();

  // Middleware
  app.use(cors({
  origin: "http://localhost:5173", // or your deployed frontend URL
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

  app.use(bodyparser.json());
  app.use(bodyparser.urlencoded({ extended: true }));
  app.use("/",mainRouter);
  const port = process.env.PORT || 3000;

  // Connect to MongoDB
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("✅ Connected to MongoDB");

      const server = http.createServer(app);

      // Setup socket.io
      const io = new Server(server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      });

      // Example socket event
      io.on("connection", (socket) => {
        console.log("🔌 New client connected");

        socket.on("joinRoom", (userId) => {
          console.log(`User joined room: ${userId}`);
          socket.join(userId);
        });

        socket.on("disconnect", () => {
          console.log("❌ Client disconnected");
        });
      });

      

      const db=mongoose.connection;

      db.once("open",async()=>{
        console.log("CRUD operations are called");
      });

      // Start server
      server.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error("❌ MongoDB connection error:", error);
    });
}
