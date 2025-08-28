import { promises as fs } from "fs";
import path from "path";
import { s3, S3_BUCKET } from "../config/aws-config.js";

async function pullRepo() {
  const repoPath = path.resolve(process.cwd(), ".codehubGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    const data = await s3
      .listObjectsV2({ Bucket: S3_BUCKET, Prefix: "commits/" })
      .promise();

    const objects = data.Contents || [];

    for (const object of objects) {
      const key = object.Key;

      const commitDir = path.join(
        commitsPath,
        path.dirname(key).split("/").pop()
      );

      await fs.mkdir(commitDir, { recursive: true });

      const params = {
        Bucket: S3_BUCKET,
        Key: key,
      };

      const fileContent = await s3.getObject(params).promise();

      // write to same relative structure inside repoPath
      const filePath = path.join(repoPath, key);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, fileContent.Body);
    }

    console.log("✅ All commits pulled from S3");
  } catch (error) {
    console.error("❌ Unable to pull:", error);
  }
}

export { pullRepo };
