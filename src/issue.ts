import { execSync } from "child_process";
import { S } from "./util";

export async function handleIssueCommand(args: string[]) {
  if (args.length < 2 || args.length > 3) {
    console.error("Usage: fgit issue <issue-key>-<issue-number> [suffix]");
    console.log(`${S.Dim}\n\`fgit --fgit-help\` for more details\n${S.Reset}`);
    process.exit(1);
  }

  const issueKeyNumber = args[1];
  const suffix = args[2] || "";
  let issueBranchName = suffix.trim()
    ? `issue/${issueKeyNumber}-${suffix}`
    : `issue/${issueKeyNumber}`;

  try {
    execSync(`git show-ref --verify refs/heads/${issueBranchName}`, {
      stdio: "ignore",
    });

    // Branch exists
    while (true) {
      console.log(
        `A branch named '${issueBranchName}' already exists. Please enter a new suffix:`,
      );
      const newSuffix = await new Promise<string>((resolve) => {
        process.stdin.once("data", (data) => {
          resolve(data.toString().trim());
        });
      });

      issueBranchName = newSuffix.trim()
        ? `issue/${issueKeyNumber}-${newSuffix}`
        : `issue/${issueKeyNumber}`;

      try {
        execSync(`git show-ref --verify refs/heads/${issueBranchName}`, {
          stdio: "ignore",
        });
      } catch {
        // Branch doesn't exist, we can create it
        break;
      }
    }
  } catch {
    // Branch doesn't exist
  }

  try {
    execSync(`git checkout -b ${issueBranchName}`, { stdio: "inherit" });
  } catch {}
}
