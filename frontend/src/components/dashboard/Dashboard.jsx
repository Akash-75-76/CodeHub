import React, { useState, useEffect } from "react";
import "./dashboard.css";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followedUsersRepos, setFollowedUsersRepos] = useState([]);
  const [activeTab, setActiveTab] = useState("myRepos");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication token missing. Please log in again.");
          setLoading(false);
          return;
        }

        // Fetch user's repositories
        try {
          const repoResponse = await fetch(
            `http://localhost:3000/api/repos/user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (repoResponse.status === 401) {
            // Token is invalid or expired
            logout();
            navigate("/auth");
            return;
          }

          if (!repoResponse.ok) {
            throw new Error(
              `Failed to fetch repositories: ${repoResponse.status}`
            );
          }

          const repoData = await repoResponse.json();
          setRepositories(repoData.repositories || []);
        } catch (repoErr) {
          console.error("Error fetching user repositories:", repoErr);
          setRepositories([]);
        }

        // Fetch suggested repositories (public repos)
        try {
          const suggestedResponse = await fetch(
            `http://localhost:3000/api/repos/public`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (suggestedResponse.ok) {
            const suggestedData = await suggestedResponse.json();
            setSuggestedRepositories(suggestedData.repositories || []);
          }
        } catch (suggestedErr) {
          console.error("Error fetching suggested repositories:", suggestedErr);
          setSuggestedRepositories([]);
        }

        // Fetch repositories from followed users
        if (
          currentUser &&
          currentUser.followedUsers &&
          currentUser.followedUsers.length > 0
        ) {
          try {
            const followedReposResponse = await fetch(
              `http://localhost:3000/api/repos/following`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (followedReposResponse.ok) {
              const followedReposData = await followedReposResponse.json();
              setFollowedUsersRepos(followedReposData.repositories || []);
            }
          } catch (followedErr) {
            console.error(
              "Error fetching followed users repositories:",
              followedErr
            );
            setFollowedUsersRepos([]);
          }
        }
      } catch (err) {
        console.error("Error while fetching data: ", err);
        setError("Failed to load dashboard data. Please try again.");
        setRepositories([]);
        setSuggestedRepositories([]);
        setFollowedUsersRepos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, navigate, logout]);

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

  const handleUpdate = async (id) => {
    const newDescription = prompt("Enter new description:");
    if (!newDescription) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/repos/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ description: newDescription }),
        }
      );

      if (response.ok) {
        setRepositories((prev) =>
          prev.map((r) =>
            r._id === id ? { ...r, description: newDescription } : r
          )
        );
      } else if (response.status === 401) {
        logout();
        navigate("/auth");
      } else {
        alert("Failed to update repository");
      }
    } catch (err) {
      console.error("Error updating repository:", err);
      alert("Error updating repository");
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/repos/toggle/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const updated = await res.json();
        setRepositories((prev) =>
          prev.map((r) =>
            r._id === id ? { ...r, visibility: updated.visibility } : r
          )
        );
      } else if (res.status === 401) {
        logout();
        navigate("/auth");
      } else {
        alert("Failed to toggle visibility");
      }
    } catch (err) {
      console.error("Error toggling visibility:", err);
      alert("Error toggling visibility");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this repository?"))
      return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/repos/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setRepositories((prev) => prev.filter((r) => r._id !== id));
      } else if (response.status === 401) {
        logout();
        navigate("/auth");
      } else {
        alert("Failed to delete repository");
      }
    } catch (err) {
      console.error("Error deleting repository:", err);
      alert("Error deleting repository");
    }
  };

  const handleFollowUserFromRepo = async (ownerId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/users/follow/${ownerId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Successfully followed user!");
        // Refresh suggested repos to update UI
        try {
          const suggestedResponse = await fetch(
            `http://localhost:3000/api/repos/public`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (suggestedResponse.ok) {
            const suggestedData = await suggestedResponse.json();
            setSuggestedRepositories(suggestedData.repositories || []);
          }
        } catch (refreshErr) {
          console.error("Error refreshing suggested repos:", refreshErr);
        }
      } else if (response.status === 401) {
        logout();
        navigate("/auth");
      } else {
        alert("Failed to follow user");
      }
    } catch (err) {
      console.error("Error following user:", err);
      alert("Error following user");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </>
    );
  }

  const renderRepositories = (repos, showOwner = false) => {
    return repos.length > 0 ? (
      <div className="repos-grid">
        {repos.map((repo) => (
          <div key={repo._id} className="repo-card">
            <div className="repo-header">
              <h4>{repo.name}</h4>
              <span
                className={`visibility-badge ${
                  repo.visibility === true || repo.visibility === "public"
                    ? "public"
                    : "private"
                }`}
              >
                {repo.visibility === true || repo.visibility === "public"
                  ? "Public"
                  : "Private"}
              </span>
            </div>
            <p className="repo-description">
              {repo.description || "No description provided"}
            </p>

            {showOwner && repo.owner && (
              <div className="repo-owner">
                <span className="owner-label">Owner:</span>
                <span className="owner-name">{repo.owner.username}</span>
                {currentUser && currentUser._id !== repo.owner._id && (
                  <button
                    onClick={() => handleFollowUserFromRepo(repo.owner._id)}
                    className="follow-user-btn"
                  >
                    Follow
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons - only show for user's own repos */}
            {!showOwner && (
              <div className="repo-actions">
                <button
                  onClick={() => handleUpdate(repo._id)}
                  className="btn-update"
                >
                  <i className="icon-edit"></i> Edit
                </button>
                <button
                  onClick={() => handleToggleVisibility(repo._id)}
                  className="btn-visibility"
                >
                  <i className="icon-visibility"></i>
                  {repo.visibility === true || repo.visibility === "public"
                    ? " Make Private"
                    : " Make Public"}
                </button>
                <button
                  onClick={() => handleDelete(repo._id)}
                  className="btn-delete"
                >
                  <i className="icon-delete"></i> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="empty-state">
        <i className="icon-empty"></i>
        <p>No repositories found.</p>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <section id="dashboard">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError("")} className="dismiss-btn">
              ×
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        {/* Add this above the tabs */}
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {currentUser?.username}!</p>
        </div>
        <div className="dashboard-tabs">
          <button
            className={activeTab === "myRepos" ? "active" : ""}
            onClick={() => setActiveTab("myRepos")}
          >
            <i className="icon-repos"></i>
            My Repositories
          </button>
          <button
            className={activeTab === "suggested" ? "active" : ""}
            onClick={() => setActiveTab("suggested")}
          >
            <i className="icon-discover"></i>
            Discover
          </button>
          <button
            className={activeTab === "following" ? "active" : ""}
            onClick={() => setActiveTab("following")}
          >
            <i className="icon-following"></i>
            Following
          </button>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          <main className="dashboard-main">
            {activeTab === "myRepos" && (
              <>
                <div className="section-header">
                  <h2>Your Repositories</h2>
                  <div id="search" className="search-box">
                    <i className="icon-search"></i>
                    <input
                      type="text"
                      value={searchQuery}
                      placeholder="Search your repositories..."
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                {renderRepositories(searchResults)}
                <button
                  onClick={() => navigate("/create")}
                  className="create-btn"
                >
                  <i className="icon-add"></i> Create New Repository
                </button>
              </>
            )}

            {activeTab === "suggested" && (
              <>
                <div className="section-header">
                  <h2>Discover Public Repositories</h2>
                </div>
                {renderRepositories(suggestedRepositories, true)}
              </>
            )}

            {activeTab === "following" && (
              <>
                <div className="section-header">
                  <h2>Repositories from Users You Follow</h2>
                </div>
                {renderRepositories(followedUsersRepos, true)}
              </>
            )}
          </main>

          {/* Events Sidebar */}
          <aside className="dashboard-sidebar">
            <div className="sidebar-card">
              <h3>
                <i className="icon-events"></i>
                Upcoming Events
              </h3>
              <ul className="events-list">
                <li>
                  <div className="event-date">Dec 15</div>
                  <div className="event-details">
                    <p className="event-title">Tech Conference</p>
                    <p className="event-location">Viman Nagar,Pune</p>
                  </div>
                </li>
                <li>
                  <div className="event-date">Dec 25</div>
                  <div className="event-details">
                    <p className="event-title">Developer Meetup</p>
                    <p className="event-location">Kharadi,Pune</p>
                  </div>
                </li>
                <li>
                  <div className="event-date">Jan 5</div>
                  <div className="event-details">
                    <p className="event-title">React Summit</p>
                    <p className="event-location">Online</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* User Stats */}
            {currentUser && (
              <div className="sidebar-card user-stats">
                <h3>
                  <i className="icon-stats"></i>
                  Your Stats
                </h3>
                <div className="stat-item">
                  <span className="stat-label">Repositories</span>
                  <span className="stat-value">{repositories.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Followers</span>
                  <span className="stat-value">
                    {currentUser.followers?.length || 0}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Following</span>
                  <span className="stat-value">
                    {currentUser.followedUsers?.length || 0}
                  </span>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
