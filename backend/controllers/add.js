const fs=require("fs").promises;
const path=require("path");
async function addRepo({ file }) {
  const repoPath=path.resolve(process.cwd(),".codehubGit");
  const stagedPath=path.join(repoPath,"staged");
  try {
    await fs.mkdir(stagedPath,{ recursive: true });
    await fs.copyFile(file,path.join(stagedPath,path.basename(file)));
    console.log(`File added to staging: ${file}`);
  } catch (error) {
    console.log(`Error adding file: ${error.message}`);
  }
}

module.exports = { addRepo };
