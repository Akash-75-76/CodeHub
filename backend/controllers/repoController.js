const mongoose=require("mongoose");
const Repository=require("../models/repoModel");
const User=require("../models/userModel");
const Issue=require("../models/issueModel");
const createRepository = async (req, res) => {
    try {
        const {owner,name,issues,content,description,visibility}=req.body;
         if(!owner || !name ) {
             return res.status(400).json({
                 success: false,
                 message: " Please provide all required fields."
             });
         }
        const newRepository = new Repository({
            owner,
            name,
            issues,
            content,
            description,
            visibility
        });

        await newRepository.save();
        res.status(201).json({
            success: true,
            message: "New repository has been successfully created.",
            data: newRepository
        });
    } catch (error) {
        console.log("Error creating repository:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getAllRepositories = async (req, res) => {
    try {
        const repositories = await Repository.find()
            .populate("owner", "username email")
            .populate("issues");

        res.status(200).json({
            success: true,
            count: repositories.length,
            data: repositories
        });
    } catch (error) {
        console.log("Error fetching all repositories:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const fetchRepositoryById = async (req, res) => {
    const repoId = req.params.id;
    try {
        const repository = await Repository.findById(repoId)
            .populate("owner", "username email")
            .populate("issues");

        if (!repository) {
            return res.status(404).json({
                success: false,
                message: "Repository not found"
            });
        }

        res.status(200).json({
            success: true,
            data: repository
        });
    } catch (error) {
        console.log("Error fetching repository by id:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const fetchRepositoryByName = async (req, res) => {
    const repoName = req.params.name;

    try {
        const repository = await Repository.findOne({ name: repoName })
            .populate("owner", "username email")
            .populate("issues");

        if (!repository) {
            return res.status(404).json({
                success: false,
                message: "Repository not found"
            });
        }

        res.status(200).json({
            success: true,
            data: repository
        });
    } catch (error) {
        console.log("Error fetching repository by name:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const fetchRepositoryForCurrentUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const repositories = await Repository.find({ owner: userId })
            .populate("owner", "username email")
            .populate("issues");

            if (repositories.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No repositories found for this user"
                });
            }

        res.status(200).json({
            success: true,
            count: repositories.length,
            data: repositories
        });
    } catch (error) {
        console.log("Error fetching repositories for current user:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const updateRepository = async (req, res) => {
    const {id}=req.params;
    const{content,description}=req.body;

    try {
        const updatedRepository = await Repository.findByIdAndUpdate(id, { content, description }, { new: true })
            .populate("owner", "username email")
            .populate("issues");

        if (!updatedRepository) {
            return res.status(404).json({
                success: false,
                message: "Repository not found"
            });
        }

        res.status(200).json({
            success: true,
            data: updatedRepository
        });
    } catch (error) {
        console.log("Error updating repository:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const toggleVisibility = async (req, res) => {
    const {id}=req.params;
    try {
        const repository = await Repository.findById(id);
        if (!repository) {
            return res.status(404).json({
                success: false,
                message: "Repository not found"
            });
        }

        repository.isPrivate = !repository.isPrivate;
        await repository.save();

        res.status(200).json({
            success: true,
            data: repository
        });
    } catch (error) {
        console.log("Error toggling repository visibility:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const deleteRepositoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedRepository = await Repository.findByIdAndDelete(id);
        if (!deletedRepository) {
            return res.status(404).json({
                success: false,
                message: "Repository not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "🗑 Repository has been deleted successfully."
        });
    } catch (error) {
        console.log("Error deleting repository:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    createRepository,
    getAllRepositories,
    fetchRepositoryById,
    fetchRepositoryByName,
    fetchRepositoryForCurrentUser,
    updateRepository,
    toggleVisibility,
    deleteRepositoryById
};
