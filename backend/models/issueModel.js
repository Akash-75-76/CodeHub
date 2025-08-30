const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/IssueModel");

const createIssue = async (req, res) => {
    const { title, description, repositoryId } = req.body;

    if (!title || !description || !repositoryId) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields."
        });
    }

    try {
        const newIssue = new Issue({
            title,
            description,
            repository: repositoryId
        });

        await newIssue.save();

        res.status(201).json({
            success: true,
            message: "Issue created successfully.",
            data: newIssue
        });
    } catch (error) {
        console.log("Error creating issue:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const updateIssueById = async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;

    try {
        const updatedIssue = await Issue.findByIdAndUpdate(
            id,
            { title, description, status },
            { new: true }
        );

        if (!updatedIssue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        res.status(200).json({
            success: true,
            data: updatedIssue
        });
    } catch (error) {
        console.log("Error updating issue:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const deleteIssueById = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedIssue = await Issue.findByIdAndDelete(id);
        if (!deletedIssue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "🗑 Issue has been deleted successfully."
        });
    } catch (error) {
        console.log("Error deleting issue:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getAllIssues = async (req, res) => {
    try {
        const issues = await Issue.find().populate("repository", "name");

        res.status(200).json({
            success: true,
            count: issues.length,
            data: issues
        });
    } catch (error) {
        console.log("Error fetching all issues:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getIssueById = async (req, res) => {
    const { id } = req.params;

    try {
        const issue = await Issue.findById(id).populate("repository", "name");

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        res.status(200).json({
            success: true,
            data: issue
        });
    } catch (error) {
        console.log("Error fetching issue by id:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    createIssue,
    updateIssueById,
    deleteIssueById,
    getAllIssues,
    getIssueById
};
