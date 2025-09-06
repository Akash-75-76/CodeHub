import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./createrepo.css";

const CreateRepository = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [contents, setContents] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: "", message: "" });

  const navigate = useNavigate();

  const handleAddContent = () => {
    if (content.trim()) {
      setContents((prev) => [...prev, content.trim()]);
      setContent("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const owner = localStorage.getItem("userId");
    if (!owner) {
      setDialog({ open: true, type: "error", message: "⚠️ You must be logged in to create a repository!" });
      return;
    }

    // Check if backend is reachable
    try {
      await fetch("http://localhost:3000/", { method: "HEAD", timeout: 5000 });
    } catch (err) {
      setDialog({ 
        open: true, 
        type: "error", 
        message: "⚠️ Cannot connect to server. Please make sure the backend is running on port 3000." 
      });
      return;
    }

    const repoData = { owner, name, description, content: contents, visibility };
    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const response = await fetch("http://localhost:3000/api/repos/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(repoData),
      });

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Server error: ${response.status}`);
        } catch {
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      setLoading(false);

      setDialog({ open: true, type: "success", message: "✅ Repository created successfully!" });

      // Reset form
      setName("");
      setDescription("");
      setContents([]);
      setVisibility("public");

      // Redirect after 2s
      setTimeout(() => {
        setDialog({ open: false, type: "", message: "" });
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setLoading(false);
      console.error("❌ Error creating repository:", error);
      
      let errorMessage = "Something went wrong while creating repository!";
      
      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        errorMessage = "Cannot connect to server. Please check if the backend is running on port 3000.";
      } else if (error.name === "TypeError") {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      setDialog({ open: true, type: "error", message: errorMessage });
    }
  };

  return (
    <div className="repo-container">
      <form className="repo-form" onSubmit={handleSubmit}>
        <h2>Create a New Repository</h2>

        <label htmlFor="repo-name">
          Repository Name *
          <span className="helper-text">(Only letters, numbers, hyphens, and underscores allowed)</span>
        </label>
        <input
          id="repo-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          pattern="[a-zA-Z0-9_-]+"
          title="Only alphanumeric characters, hyphens, and underscores are allowed"
          required
        />

        <label htmlFor="repo-description">Description *</label>
        <textarea
          id="repo-description"
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
            placeholder="e.g. README.md"
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

        <label htmlFor="visibility">Visibility</label>
        <select
          id="visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <div className="visibility-description">
          <p>
            {visibility === "public" ? (
              <>
                <strong>Public</strong> - Anyone can see this repository
              </>
            ) : (
              <>
                <strong>Private</strong> - Only you can see this repository
              </>
            )}
          </p>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Repository"}
        </button>
      </form>

      {dialog.open && (
        <div className="dialog-overlay">
          <div className={`dialog-box ${dialog.type}`}>
            <p>{dialog.message}</p>
            <button onClick={() => setDialog({ open: false, type: "", message: "" })}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRepository;