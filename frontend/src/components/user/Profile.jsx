import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import Navbar from "../Navbar";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon, PeopleIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";

const Profile = () => {
  const navigate = useNavigate();
  const { userId: profileUserId } = useParams();
  const [userDetails, setUserDetails] = useState({ 
    username: "username", 
    name: "",
    bio: "",
    followers: [], 
    followedUsers: [] 
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser, setCurrentUser } = useAuth();
  const [repositories, setRepositories] = useState([]);

  // Determine if we're viewing our own profile or someone else's
  const isOwnProfile = !profileUserId || profileUserId === currentUser?._id;
  const displayedUserId = profileUserId || currentUser?._id;

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!displayedUserId) return;

      try {
        const token = localStorage.getItem("token");

        // Fetch user details
        const response = await axios.get(
          `https://codehub.duckdns.org/api/users/${displayedUserId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserDetails(response.data);

        // Fetch repositories separately
        const repoResponse = await axios.get(
          `https://codehub.duckdns.org/api/repos/user/${displayedUserId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRepositories(repoResponse.data.repositories || []);

        // Check follow status if not own profile
        if (!isOwnProfile && currentUser) {
          try {
            const followStatusResponse = await axios.get(
              `https://codehub.duckdns.org/api/users/follow-status/${displayedUserId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsFollowing(followStatusResponse.data.isFollowing);
          } catch (followErr) {
            console.error("Error checking follow status: ", followErr);
          }
        }
      } catch (err) {
        console.error("Cannot fetch user details: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [displayedUserId, isOwnProfile, currentUser]);

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (isFollowing) {
        await axios.post(
          `https://codehub.duckdns.org/api/users/unfollow/${displayedUserId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsFollowing(false);
        // Update follower count locally
        setUserDetails(prev => ({
          ...prev,
          followers: prev.followers.filter(id => id !== currentUser._id)
        }));
      } else {
        await axios.post(
          `https://codehub.duckdns.org/api/users/follow/${displayedUserId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsFollowing(true);
        // Update follower count locally
        setUserDetails(prev => ({
          ...prev,
          followers: [...prev.followers, currentUser._id]
        }));
      }
    } catch (err) {
      console.error("Error updating follow status: ", err);
      alert("Error updating follow status. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    setCurrentUser(null);
    window.location.href = "/auth";
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "2rem", textAlign: "center" }}>
          Loading profile...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <UnderlineNav 
        aria-label="Profile Navigation"
        sx={{
          backgroundColor: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-primary)',
          padding: '0 16px'
        }}
      >
        <UnderlineNav.Item
          aria-current="page"
          icon={BookIcon}
          sx={{
            color: 'var(--text-secondary)',
            '&:hover': { color: 'var(--text-primary)' },
            '&[aria-current="page"]': {
              color: 'var(--text-primary)',
              borderBottomColor: '#f78166',
              fontWeight: '600'
            }
          }}
        >
          Overview
        </UnderlineNav.Item>

        <UnderlineNav.Item
          onClick={() => navigate("/repo")}
          icon={RepoIcon}
          sx={{
            backgroundColor: "transparent",
            color: "whitesmoke",
            "&:hover": {
              textDecoration: "underline",
              color: "white",
            },
          }}
        >
          Starred Repositories
        </UnderlineNav.Item>

        <UnderlineNav.Item
          onClick={() => navigate("/dashboard")}
          icon={PeopleIcon}
          sx={{
            backgroundColor: "transparent",
            color: "whitesmoke",
            "&:hover": {
              textDecoration: "underline",
              color: "white",
            },
          }}
        >
          Repositories
        </UnderlineNav.Item>
        
        {isOwnProfile && (
          <UnderlineNav.Item
            onClick={() => navigate("/update-profile")}
            sx={{
              backgroundColor: "transparent",
              color: "whitesmoke",
              "&:hover": {
                textDecoration: "underline",
                color: "white",
              },
            }}
          >
            Edit Profile
          </UnderlineNav.Item>
        )}
      </UnderlineNav>

      {isOwnProfile && (
        <button
          onClick={handleLogout}
          style={{ position: "fixed", bottom: "50px", right: "50px" }}
          id="logout"
        >
          Logout
        </button>
      )}

      <div className="profile-page-wrapper">
        <div className="user-profile-section">
          <div className="profile-image">
            {userDetails.profilePicture ? (
              <img
                src={`https://codehub.duckdns.org${userDetails.profilePicture}`} 
                alt="Profile"
                className="profile-avatar"
              />
            ) : (
              <div className="avatar-placeholder">
                {userDetails.username?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          <div className="name">
            <h3>{userDetails.name || userDetails.username}</h3>
            {userDetails.email && (
              <p className="email">{userDetails.email}</p>
            )}
            {userDetails.bio && (
              <p className="bio">{userDetails.bio}</p>
            )}
          </div>

          {!isOwnProfile && currentUser && (
            <button 
              className={`follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
              disabled={!currentUser}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}

          <div className="follower-stats">
            <div className="stat">
              <PeopleIcon size={16} />
              <span>
                <strong>{userDetails.followers?.length || 0}</strong> followers
              </span>
            </div>
            <div className="stat">
              <span>
                <strong>{userDetails.followedUsers?.length || 0}</strong> following
              </span>
            </div>
          </div>

          {userDetails.followers && userDetails.followers.length > 0 && (
            <div className="followers-list">
              <h4>Followers</h4>
              <div className="mini-avatars">
                {userDetails.followers.slice(0, 5).map((follower, index) => (
                  <div key={index} className="mini-avatar" title={`Follower ${index + 1}`}>
                    {typeof follower === 'object' ? follower.username?.charAt(0) : 'U'}
                  </div>
                ))}
                {userDetails.followers.length > 5 && (
                  <div className="mini-avatar-more">
                    +{userDetails.followers.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="heat-map-section">
          <HeatMapProfile userId={displayedUserId} />
          
          {/* Additional profile stats */}
          <div className="profile-stats">
            <h3>Profile Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{repositories.length || 0}</span>
                <span className="stat-label">Repositories</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{userDetails.starRepos?.length || 0}</span>
                <span className="stat-label">Stars</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{userDetails.followers?.length || 0}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{userDetails.followedUsers?.length || 0}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;