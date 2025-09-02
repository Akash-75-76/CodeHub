import { useState } from "react";
import { useNavigate } from "react-router-dom";  // ✅ Import navigate hook
import "./createrepo.css";

const CreateRepository = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [contents, setContents] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();  // ✅ initialize navigation

  const handleAddContent = () => {
    if (content.trim()) {
      setContents([...contents, content]);
      setContent("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const owner = localStorage.getItem("userId"); // logged-in userId
    if (!owner) {
      alert("You must be logged in to create a repository!");
      return;
    }

    const repoData = { owner, name, description, content: contents, visibility };

    try {
      setLoading(true);

      const response = await fetch("http://localhost:3000/repo/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(repoData),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        alert(`❌ Error: ${data.message || "Failed to create repository"}`);
        return;
      }

      alert("✅ Repository created successfully!");
      console.log("Repository saved:", data);

      // Reset form
      setName("");
      setDescription("");
      setContents([]);
      setVisibility("public");

      // ✅ Redirect to user's dashboard
      navigate("/");
      // (Assumes you have a route like /dashboard/:userId)
      
    } catch (error) {
      setLoading(false);
      console.error("❌ Error creating repository:", error);
      alert("Something went wrong while creating repository!");
    }
  };

  return (
    <div className="repo-container">
      <form className="repo-form" onSubmit={handleSubmit}>
        <h2>Create a New Repository</h2>

        <label>Repository Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>

        <label>Add Content</label>
        <div className="content-row">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="button" onClick={handleAddContent}>
            Add
          </button>
        </div>

        {contents.length > 0 && (
          <ul className="content-list">
            {contents.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        )}

        <label>Visibility</label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Repository"}
        </button>
      </form>
    </div>
  );
};

export default CreateRepository;
