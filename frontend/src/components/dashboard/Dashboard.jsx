import React, { useState, useEffect } from "react";
import "./dashboard.css";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/repo/user/${userId}`
        );
        const data = await response.json();
        setRepositories(data.repositories || []); // fallback to []
      } catch (err) {
        console.error("Error while fetching repositories: ", err);
        setRepositories([]); // prevent crash
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`http://localhost:3000/repo/all`);
        const data = await response.json();
        const repos = data.repositories || [];
        // only keep public repos
        const publicRepos = repos.filter((repo) => repo.visibility === "public");
        setSuggestedRepositories(publicRepos);
      } catch (err) {
        console.error("Error while fetching repositories: ", err);
        setSuggestedRepositories([]);
      }
    };

    Promise.all([fetchRepositories(), fetchSuggestedRepositories()]).finally(
      () => setLoading(false)
    );
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults(repositories);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  // --- ACTION HANDLERS ---

  const handleUpdate = async (id) => {
    const newDescription = prompt("Enter new description:");
    if (!newDescription) return;

    try {
      await fetch(`http://localhost:3000/repo/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: newDescription }),
      });
      setRepositories((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, description: newDescription } : r
        )
      );
    } catch (err) {
      console.error("Error updating repository:", err);
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/repo/toggle/${id}`, {
        method: "PATCH",
      });
      const updated = await res.json();
      setRepositories((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, visibility: updated.visibility } : r
        )
      );
    } catch (err) {
      console.error("Error toggling visibility:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this repository?"))
      return;
    try {
      await fetch(`http://localhost:3000/repo/delete/${id}`, {
        method: "DELETE",
      });
      setRepositories((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error deleting repository:", err);
    }
  };

  // --- RENDER ---

  if (loading) {
    return (
      <>
        <Navbar />
        <p>Loading dashboard...</p>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section id="dashboard">
        {/* Suggested Repos */}
        <aside>
          <h3>Suggested Repositories</h3>
          {suggestedRepositories.length > 0 ? (
            suggestedRepositories.map((repo) => (
              <div key={repo._id}>
                <h4>{repo.name}</h4>
                <p>{repo.description}</p>
              </div>
            ))
          ) : (
            <p>No public repositories available.</p>
          )}
        </aside>

        {/* Main Content */}
        <main>
          <h2>Your Repositories</h2>
          <div id="search">
            <input
              type="text"
              value={searchQuery}
              placeholder="Search..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {searchResults.length > 0 ? (
            searchResults.map((repo) => (
              <div key={repo._id} className="repo-card">
                <h4>{repo.name}</h4>
                <p>{repo.description}</p>
                <p>
                  <b>Visibility:</b>{" "}
                  {repo.visibility === true || repo.visibility === "public"
                    ? "Public"
                    : "Private"}
                </p>

                {/* Action Buttons */}
                <div className="repo-actions">
                  <button onClick={() => handleUpdate(repo._id)}>Update</button>
                  <button onClick={() => handleToggleVisibility(repo._id)}>
                    {repo.visibility === true || repo.visibility === "public"
                      ? "Make Private"
                      : "Make Public"}
                  </button>
                  <button onClick={() => handleDelete(repo._id)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <p>You don’t have any repositories yet.</p>
          )}

          {/* Always show Create Repo button */}
          <button onClick={() => navigate("/create")} className="create-btn">
            + Create New Repository
          </button>
        </main>

        {/* Events */}
        <aside>
          <h3>Upcoming Events</h3>
          <ul>
            <li>
              <p>Tech Conference - Dec 15</p>
            </li>
            <li>
              <p>Developer Meetup - Dec 25</p>
            </li>
            <li>
              <p>React Summit - Jan 5</p>
            </li>
          </ul>
        </aside>
      </section>
    </>
  );
};

export default Dashboard;
