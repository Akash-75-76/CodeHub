const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();
const uri = process.env.MONGO_URL;

let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
  }
}

/**
 * Signup
 */
async function signup(req, res) {
  const { username, password, email } = req.body;

  try {
    await connectClient();
    const db = client.db("codehub");
    const usersCollection = db.collection("users");

    const existing = await usersCollection.findOne({
      $or: [{ username }, { email }],
    });
    if (existing) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      followers: [],
      starRepos: [],
    };

    const result = await usersCollection.insertOne(newUser);

    const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, userId: result.insertedId });
  } catch (err) {
    console.error("❌ Error during signup:", err.message);
    res.status(500).json({ message: err.message });
  }
}

/**
 * Login
 */
async function login(req, res) {
  const { email, password } = req.body;

  try {
    await connectClient();
    const db = client.db("codehub");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials!" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, userId: user._id });
  } catch (err) {
    console.error("❌ Error during login:", err.message);
    res.status(500).json({ message: err.message });
  }
}

/**
 * Get All Users
 */
async function getAllUsers(req, res) {
  try {
    await connectClient();
    const db = client.db("codehub");
    const usersCollection = db.collection("users");

    const users = await usersCollection
      .find({}, { projection: { password: 0 } })
      .toArray();

    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err.message);
    res.status(500).json({ message: err.message });
  }
}

/**
 * Get User Profile
 */
async function getUserProfile(req, res) {
  const currentID = req.params.id;

  try {
    await connectClient();
    const db = client.db("codehub");
    const usersCollection = db.collection("users");

    if (!ObjectId.isValid(currentID)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await usersCollection.findOne(
      { _id: new ObjectId(currentID) },
      { projection: { password: 0 } }
    );

    if (!user) return res.status(404).json({ message: "User not found!" });

    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching profile:", err.message);
    res.status(500).json({ message: err.message });
  }
}

/**
 * Update User Profile
 */
async function updateUserProfile(req, res) {
  const currentID = req.params.id;
  const { email, password } = req.body;

  try {
    await connectClient();
    const db = client.db("codehub");
    const usersCollection = db.collection("users");

    let updateFields = {};
    if (email) updateFields.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(currentID) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result.value)
      return res.status(404).json({ message: "User not found!" });

    res.json(result.value);
  } catch (err) {
    console.error("❌ Error updating profile:", err.message);
    res.status(500).json({ message: err.message });
  }
}

/**
 * Delete User Profile
 */
async function deleteUserProfile(req, res) {
  const currentID = req.params.id;

  try {
    await connectClient();
    const db = client.db("codehub");
    const usersCollection = db.collection("users");

    const result = await usersCollection.deleteOne({
      _id: new ObjectId(currentID),
    });

    if (result.deletedCount === 0)
      return res.status(404).json({ message: "User not found!" });

    res.json({ message: "User Profile Deleted!" });
  } catch (err) {
    console.error("❌ Error deleting profile:", err.message);
    res.status(500).json({ message: err.message });
  }
}

/**
 * Follow a User
 */
async function followUser(req, res) {
  const userId  = req.user.id; // from auth middleware
  const { userToFollowId } = req.params;

  

  try {
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(userToFollowId)) {
      console.log("❌ Invalid ObjectId(s)");
      return res.status(400).json({ message: "Invalid user ID(s)" });
    }

    if (new ObjectId(userId).equals(new ObjectId(userToFollowId))) {
      console.log("❌ Tried to follow self");
      return res.status(400).json({ message: "You cannot follow yourself!" });
    }

    await connectClient();
    const db = client.db("codehub");
    const usersCollection = db.collection("users");

    const currentUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    const userToFollow = await usersCollection.findOne({ _id: new ObjectId(userToFollowId) });

    if (!userToFollow) {
      return res.status(404).json({ message: "User to follow not found!" });
    }

    const alreadyFollowing = currentUser.followedUsers?.some(
      (id) => id.toString() === userToFollowId
    );
    if (alreadyFollowing) {
      console.log("❌ Already following:", userToFollowId);
      return res.status(400).json({ message: "Already following this user!" });
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { followedUsers: new ObjectId(userToFollowId) } }
    );

    await usersCollection.updateOne(
      { _id: new ObjectId(userToFollowId) },
      { $push: { followers: new ObjectId(userId) } }
    );

    console.log("✅ Successfully followed:", userToFollowId);
    res.json({ message: "Successfully followed user!" });
  } catch (err) {
    console.error("❌ Error following user:", err.message);
    res.status(500).json({ message: err.message });
  }
}


async function unfollowUser(req, res) {
  const  userId = req.user.id; // from auth middleware
  const { userToUnfollowId } = req.params;

  try {
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(userToUnfollowId)) {
      return res.status(400).json({ message: "Invalid user ID(s)" });
    }

    await connectClient();
    const db = client.db("codehub");
    const usersCollection = db.collection("users");

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { followedUsers: new ObjectId(userToUnfollowId) } }
    );

    await usersCollection.updateOne(
      { _id: new ObjectId(userToUnfollowId) },
      { $pull: { followers: new ObjectId(userId) } }
    );

    res.json({ message: "Successfully unfollowed user!" });
  } catch (err) {
    console.error("❌ Error unfollowing user:", err.message);
    res.status(500).json({ message: err.message });
  }
}


/**
 * Check Follow Status
 */
async function checkFollowStatus(req, res) {
  const userId = req.user.id; // ✅ from auth middleware
  const { targetUserId } = req.params;

  try {
    if (!ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid target user ID" });
    }

    await connectClient();
    const db = client.db("codehub");
    const usersCollection = db.collection("users");

    const currentUser = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    const isFollowing = currentUser.followedUsers?.some(
      (id) => id.toString() === targetUserId
    ) || false;

    res.json({ isFollowing });
  } catch (err) {
    console.error("❌ Error checking follow status:", err.message);
    res.status(500).json({ message: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, bio } = req.body;

    let updateData = { name, bio };

    if (req.file) {
      updateData.profilePicture = `/uploads/${req.file.filename}`;
    }

    await connectClient();
    const db = client.db("codehub");
    const usersCollection = db.collection("users");

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    res.json({ message: "Profile updated successfully", updateData });
  } catch (err) {
    console.error("❌ Error updating profile:", err.message);
    res.status(500).json({ message: err.message });
  }
}


module.exports = {
  getAllUsers,
  signup,
  login,
  updateProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  followUser,
  unfollowUser,
  checkFollowStatus,
};
