import { execSync } from "child_process";
import { question } from "./util";

export async function handleUpdateCommand() {
  try {
    const output = execSync("git fetch --dry-run origin main", {
      stdio: "pipe",
    }).toString();

    if (!output) {
      console.log("fgit is up to date");
      return;
    }

    await question("New version of fgit is available. Do you want to update?");

    execSync("git pull origin main", { stdio: "inherit" });
    console.log();
    execSync("bun compile", { stdio: "inherit" });
    console.log();
    console.log("Project updated successfully\n");
  } catch (error) {
    console.error("Update failed:", error);
    process.exit(1);
  }
}
