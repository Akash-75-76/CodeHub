const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
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

const getAllUsers = (req, res) => {
  res.send("All users fetched");
};

const signup = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    await connectClient();
    const db = client.db("codehub");

    const user = await db.collection("users").findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.collection("users").insertOne({
      username,
      email,
      password: hashedPassword,
      repositories: [],
      followedUsers: [],
      starRepos: []
    });
    const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: "User created", userId: result.insertedId, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async(req, res) => {
 const {email,password} = req.body;
 try {
   await connectClient();
   const db = client.db("codehub");

   const user = await db.collection("users").findOne({ email });
   if (!user) {
     return res.status(400).json({ message: "Invalid credentials" });
   }

   const isMatch = await bcrypt.compare(password, user.password);
   if (!isMatch) {
     return res.status(400).json({ message: "Invalid credentials" });
   }

   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
   res.status(200).json({ message: "Login successful", token });
 } catch (error) {
   console.error(error);
   res.status(500).json({ message: "Server error" });
 }
};

const getUserProfile = (req, res) => {
  res.send("User profile fetched");
};

const updateUserProfile = (req, res) => {
  res.send("User profile updated");
};

const deleteUserProfile = (req, res) => {
  res.send("User profile deleted");
};

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
