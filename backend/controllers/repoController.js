const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository(req, res) {
  const { owner, name, issues, content, description, visibility } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid User ID!" });
    }

    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner,
      content,
      issues,
    });

    const result = await newRepository.save();

    res.status(201).json({
      message: "Repository created!",
      repositoryID: result._id,
    });
  } catch (err) {
    console.error("Error during repository creation:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

async function getAllRepositories(req, res) {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");

    res.json(repositories);
  } catch (err) {
    console.error("Error during fetching repositories:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findById(id)
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

async function fetchRepositoryByName(req, res) {
  const { name } = req.params;
  try {
    const repository = await Repository.findOne({ name })
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {
  try {
    const { userID } = req.params;

    const repos = await Repository.find({ owner: userID })
      .populate("owner", "username email");

    if (!repos || repos.length === 0) {
      return res.status(404).json({ message: "No repositories found for this user" });
    }

    res.json({ repositories: repos });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { content, description } = req.body;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    if (content) repository.content.push(content);
    if (description) repository.description = description;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository updated successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during updating repository:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

async function toggleVisibilityById(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    repository.visibility =
      repository.visibility === "public" ? "private" : "public";

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository visibility toggled successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during toggling visibility:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

async function deleteRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findByIdAndDelete(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}


async function getPublicRepositories(req, res) {
  try {
    const publicRepos = await Repository.find({ visibility: "public" })
      .populate("owner", "username email");

    res.json({ repositories: publicRepos });
  } catch (err) {
    console.error("Error fetching public repos:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

// Fetch repositories from followed users
// get repos of people the current user is following
async function getFollowingRepositories(req, res) {
  try {
    const userId = req.user?.id || req.params.userID; // safer

    const user = await User.findById(userId).populate("followedUsers");
    if (!user) return res.status(404).json({ message: "User not found" });

    const followingIds = user.followedUsers.map(u => u._id);

    const repos = await Repository.find({
      owner: { $in: followingIds },
      visibility: "public",
    }).populate("owner", "username email");

    res.json({ repositories: repos });
  } catch (err) {
    console.error("Error fetching following repos:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
  getPublicRepositories,          // add export
  getFollowingRepositories  
};
