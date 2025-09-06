const express = require("express");
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");

const userRouter = express.Router();

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save in uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

/* ============================
   🔹 USER ROUTES
============================ */

// Auth
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);

// Explore & Profile
userRouter.get("/", auth, userController.getAllUsers);
userRouter.get("/:id", auth, userController.getUserProfile);

// Follow system
userRouter.post("/follow/:userToFollowId", auth, userController.followUser);
userRouter.post("/unfollow/:userToUnfollowId", auth, userController.unfollowUser);
userRouter.get("/follow-status/:targetUserId", auth, userController.checkFollowStatus);

// Profile update (with image upload)
userRouter.put(
  "/update",
  auth,
  upload.single("profilePicture"),
  userController.updateProfile
);

module.exports = userRouter;
