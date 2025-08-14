const fs=require("fs").promises;
const path=require("path");
async function initRepo() {
  const repoPath=path.resolve(process.cwd(),".codehubGit");
  const commitsPath=path.join(repoPath,"commits");
  try {
    await fs.mkdir(repoPath,{ recursive: true });
    await fs.mkdir(commitsPath,{ recursive: true });
    await fs.writeFile(
        path.join(repoPath,"config.json"),
        JSON.stringify({ bucket: "your-s3-bucket-name" })
    )
    console.log("Repository initialized successfully.");
  } catch (error) {
    console.log(`Error initializing repository: ${error.message}`);
  }
}

module.exports = { initRepo };
