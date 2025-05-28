import { execSync } from "child_process";

export function handleUpdateCommand() {
  try {
    const output = execSync("git fetch --dry-run origin main", {
      stdio: "pipe",
    }).toString();

    if (!output) {
      console.log("fgit is up to date");
      return;
    }

    console.log(
      "New version of fgit is available. Do you want to update? (y/n)",
    );
    process.stdin.once("data", async (data) => {
      const input = data.toString().trim().toLowerCase();
      if (input === "y") {
        execSync("git pull origin main");
        execSync("bun compile");
        console.log("Project built successfully");
      }
    });
  } catch (error) {
    console.error("Update failed:", error);
    process.exit(1);
  }
}
