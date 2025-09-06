import React, { useState, useRef } from "react";
import axios from "axios";

const Update = () => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage("Image size must be less than 5MB");
        return;
      }
      
      // Check file type
      if (!file.type.match("image.*")) {
        setMessage("Please select an image file");
        return;
      }
      
      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setMessage(""); // Clear any previous error messages
    }
  };

  const handleSelectImage = () => {
    // Programmatically click the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = () => {
    setProfilePicture(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() && !bio.trim() && !profilePicture) {
      setMessage("Please make at least one change to update");
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    
    try {
      const formData = new FormData();
      if (name.trim()) formData.append("name", name);
      if (bio.trim()) formData.append("bio", bio);
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const token = localStorage.getItem("token");

      const res = await axios.put("http://3.90.56.59:3000/api/users/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(res.data.message || "Profile updated successfully!");
      
      // Clear form after successful submission
      if (res.status === 200) {
        setName("");
        setBio("");
        setProfilePicture(null);
        setPreviewImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.settingsPage}>
      <div style={styles.settingsContainer}>
        <h2 style={styles.title}>Account Settings</h2>
        <p style={styles.subtitle}>Update your profile information</p>
        
        {message && (
          <div style={{
            ...styles.message, 
            ...(message.includes("Error") ? styles.errorMessage : styles.successMessage)
          }}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Profile Picture</label>
            <div style={styles.imageUploadContainer}>
              {previewImage ? (
                <div style={styles.imagePreviewWrapper}>
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    style={styles.imagePreview}
                  />
                  <button 
                    type="button" 
                    onClick={removeImage}
                    style={styles.removeImageBtn}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div style={styles.uploadPlaceholder}>
                  <div style={styles.uploadIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Upload your photo</span>
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                style={styles.fileInput}
                id="profilePictureInput"
              />
              
              <div style={styles.buttonGroup}>
                <button 
                  type="button" 
                  onClick={handleSelectImage}
                  style={styles.selectImageBtn}
                >
                  {previewImage ? "Change Image" : "Select Image"}
                </button>
                
                {previewImage && (
                  <button 
                    type="button" 
                    onClick={removeImage}
                    style={styles.removeBtn}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <p style={styles.fileHint}>JPG, PNG or GIF. Max size 5MB.</p>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Bio</label>
            <textarea
              placeholder="Write something about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={styles.textarea}
              rows="4"
            />
            <div style={styles.charCount}>{bio.length}/160</div>
          </div>

          <button 
            type="submit" 
            style={isLoading ? {...styles.submitBtn, ...styles.submitBtnDisabled} : styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Inline CSS styles
const styles = {
  settingsPage: {
    display: "flex",
    justifyContent: "center",
    padding: "2rem",
    minHeight: "calc(100vh - 100px)",
    backgroundColor: "#f6f8fa",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif"
  },
  settingsContainer: {
    width: "100%",
    maxWidth: "600px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
    padding: "2rem"
  },
  title: {
    margin: "0 0 0.5rem 0",
    color: "#24292e",
    fontWeight: "600"
  },
  subtitle: {
    color: "#6a737d",
    marginBottom: "1.5rem"
  },
  message: {
    padding: "0.75rem 1rem",
    borderRadius: "6px",
    marginBottom: "1.5rem",
    fontWeight: "500"
  },
  successMessage: {
    backgroundColor: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb"
  },
  errorMessage: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column"
  },
  label: {
    fontWeight: "600",
    marginBottom: "0.5rem",
    color: "#24292e"
  },
  imageUploadContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  },
  imagePreviewWrapper: {
    position: "relative",
    width: "120px",
    height: "120px",
    marginBottom: "0.5rem"
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: "8px",
    objectFit: "cover",
    border: "1px solid #e1e4e8"
  },
  removeImageBtn: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#dc3545",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0"
  },
  uploadPlaceholder: {
    width: "100%",
    height: "120px",
    borderRadius: "8px",
    background: "#f6f8fa",
    border: "2px dashed #e1e4e8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#6a737d",
    fontSize: "0.875rem",
    gap: "8px"
  },
  uploadIcon: {
    color: "#6a737d"
  },
  fileInput: {
    display: "none"
  },
  buttonGroup: {
    display: "flex",
    gap: "0.5rem"
  },
  selectImageBtn: {
    padding: "0.5rem 1rem",
    background: "#f6f8fa",
    border: "1px solid #e1e4e8",
    borderRadius: "6px",
    color: "#24292e",
    cursor: "pointer",
    fontSize: "0.875rem",
    transition: "background-color 0.2s"
  },
  removeBtn: {
    padding: "0.5rem 1rem",
    background: "#f8d7da",
    border: "1px solid #f5c6cb",
    borderRadius: "6px",
    color: "#721c24",
    cursor: "pointer",
    fontSize: "0.875rem",
    transition: "background-color 0.2s"
  },
  fileHint: {
    margin: "0",
    fontSize: "0.75rem",
    color: "#6a737d"
  },
  input: {
    padding: "0.75rem",
    border: "1px solid #e1e4e8",
    borderRadius: "6px",
    fontSize: "1rem",
    transition: "border-color 0.2s",
    fontFamily: "inherit"
  },
  textarea: {
    padding: "0.75rem",
    border: "1px solid #e1e4e8",
    borderRadius: "6px",
    fontSize: "1rem",
    transition: "border-color 0.2s",
    resize: "vertical",
    minHeight: "100px",
    fontFamily: "inherit"
  },
  charCount: {
    fontSize: "0.75rem",
    color: "#6a737d",
    textAlign: "right",
    marginTop: "0.25rem"
  },
  submitBtn: {
    padding: "0.75rem 1.5rem",
    background: "#2ea44f",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
    alignSelf: "flex-start"
  },
  submitBtnDisabled: {
    background: "#8fc99c",
    cursor: "not-allowed"
  }
};

export default Update;