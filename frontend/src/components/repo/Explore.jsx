import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext";
import { Link } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Grid,
} from "@mui/material";

const Explore = () => {
  const { token, currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Remove self from list
        const filtered = res.data.filter((u) => u._id !== currentUser?._id);
        setUsers(filtered);

        // Check follow status
        const statusPromises = filtered.map(async (u) => {
          const statusRes = await axios.get(
            `http://localhost:3000/api/users/follow-status/${u._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return { id: u._id, isFollowing: statusRes.data.isFollowing };
        });

        const statuses = await Promise.all(statusPromises);
        const statusMap = {};
        statuses.forEach((s) => {
          statusMap[s.id] = s.isFollowing;
        });
        setFollowed(statusMap);
      } catch (err) {
        console.error("❌ Error fetching users:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, currentUser]);

  const toggleFollow = async (id, isFollowing) => {
    try {
      if (isFollowing) {
        await axios.post(
          `http://localhost:3000/api/users/unfollow/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `http://localhost:3000/api/users/follow/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setFollowed((prev) => ({ ...prev, [id]: !isFollowing }));
    } catch (err) {
      console.error("❌ Error toggling follow:", err.message);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#0d1117"
      >
        <CircularProgress sx={{ color: "#58a6ff" }} />
      </Box>
    );
  }

  return (
    <Box bgcolor="#0d1117" minHeight="100vh" p={4}>
      <Typography variant="h4" color="white" mb={3}>
        Explore Users
      </Typography>
      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user._id}>
            <Card
              sx={{
                backgroundColor: "#161b22",
                borderRadius: "12px",
                border: "1px solid #30363d",
                color: "white",
                "&:hover": { borderColor: "#58a6ff" },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                 <Avatar
  src={user.profilePicture ? `http://localhost:3000${user.profilePicture}` : undefined}
  alt={user.username}
  sx={{
    bgcolor: user.profilePicture ? "transparent" : "#58a6ff",
    mr: 2,
    textTransform: "uppercase",
    width: 48,
    height: 48,
  }}
>
  {!user.profilePicture && user.username[0]}
</Avatar>

                  <Box>
                    <Typography variant="h6">{user.username}</Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#8b949e", fontSize: "0.85rem" }}
                    >
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  px: 2,
                  pb: 2,
                }}
              >
                <Button
                  component={Link}
                  to={`/profile/${user._id}`}
                  sx={{ color: "#58a6ff", textTransform: "none" }}
                >
                  View Profile
                </Button>
                <Button
                  onClick={() => toggleFollow(user._id, followed[user._id])}
                  variant="contained"
                  sx={{
                    backgroundColor: followed[user._id]
                      ? "#d73a49"
                      : "#238636",
                    "&:hover": {
                      backgroundColor: followed[user._id]
                        ? "#a71d2a"
                        : "#2ea043",
                    },
                    textTransform: "none",
                    borderRadius: "8px",
                  }}
                >
                  {followed[user._id] ? "Unfollow" : "Follow"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Explore;
