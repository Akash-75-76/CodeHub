const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function commitRepo({ message }) {
  const repoPath = path.resolve(process.cwd(), '.codehubGit');
  const stagedPath = path.join(repoPath, 'staged');
  const commitsPath = path.join(repoPath, 'commits');

  try {
    const commitID = uuidv4();
    const commitDir = path.join(commitsPath, commitID);

    await fs.mkdir(commitDir, { recursive: true });

    const files = await fs.readdir(stagedPath);
    for (const file of files) {
      const filePath = path.join(stagedPath, file);
      const destPath = path.join(commitDir, file);
      await fs.copyFile(filePath, destPath);
    }

    await fs.writeFile(
      path.join(commitDir, 'commit.json'),
      JSON.stringify({ message, date: new Date().toISOString() })
    );

    console.log(`Commit successful with ID: ${commitID}`);
  } catch (error) {
    console.error('Error committing changes:', error);
  }
}

module.exports = { commitRepo };
