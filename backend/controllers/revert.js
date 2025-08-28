import fs from "fs";
import path from "path";
import { promisify } from "util";

const readdir = promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);

async function revertRepo({ commitID }) {
  const repoPath = path.resolve(process.cwd(), ".codehubGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    const commitDir = path.join(commitsPath, commitID);

    // Read all files stored in that commit
    const files = await readdir(commitDir);

    // Parent directory (actual project root, one level up from .apnaGit)
    const parentDir = path.resolve(repoPath, "..");

    // Copy each file from commit folder to working directory
    for (const file of files) {
      await copyFile(
        path.join(commitDir, file),        // source file
        path.join(parentDir, file)         // destination
      );
    }

    console.log(`Reverted to commit ${commitID}`);
  } catch (err) {
    console.error("Unable to revert:", err);
  }
}

export { revertRepo };
