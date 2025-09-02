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

    // check existing username or email
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
      starRepos: [],
    };

    const result = await usersCollection.insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertedId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

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
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

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

    const users = await usersCollection.find({}).toArray();
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

    const user = await usersCollection.findOne({
      _id: new ObjectId(currentID),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

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

    if (!result.value) {
      return res.status(404).json({ message: "User not found!" });
    }

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

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json({ message: "User Profile Deleted!" });
  } catch (err) {
    console.error("❌ Error deleting profile:", err.message);
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
