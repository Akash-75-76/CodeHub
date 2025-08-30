const mongoose=require("mongoose");
const Repository=require("../models/repoModel");
const User=require("../models/userMode");
const Issue=require("../models/IssueModel");
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

const getAllRepositories =async (req, res) => {
    res.send("📂 All repository details have been fetched successfully.");
};

const fetchRepositoryById =async (req, res) => {
    res.send("🔍 Repository details fetched by ID.");
};

const fetchRepositoryByName =async (req, res) => {
    res.send("🔍 Repository details fetched by name.");
};

const fetchRepositoryForCurrentUser = async (req, res) => {
    res.send("👤 Repositories for the currently logged-in user have been retrieved.");
};

const updateRepository = async (req, res) => {
    res.send("✏️ Repository details have been successfully updated.");
};

const toggleVisibility = async (req, res) => {
    res.send("👁 Repository visibility has been changed successfully.");
};

const deleteRepositoryById = async (req, res) => {
    res.send("🗑 Repository has been deleted successfully.");
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
