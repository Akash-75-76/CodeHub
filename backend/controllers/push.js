import { promises as fs } from "fs";
import path from "path";
import { s3, S3_BUCKET } from "../config/aws-config.js"; // ensure .js extension in ESM

async function pushRepo() {
  const repoPath = path.resolve(process.cwd(), ".codehubGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    const commitDirs = await fs.readdir(commitsPath);

    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.readdir(commitPath);

      for (const file of files) {
        const filePath = path.join(commitPath, file);
        const fileContent = await fs.readFile(filePath);

        const params = {
          Bucket: S3_BUCKET,
          Key: `commits/${commitDir}/${file}`, // fixed missing slash
          Body: fileContent
        };

        await s3.upload(params).promise();
      }
    }

    console.log("Repository pushed to S3 successfully");
  } catch (error) {
    console.error("Error pushing repository:", error);
  }
}

export { pushRepo };
