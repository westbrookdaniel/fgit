import { execSync } from "child_process";

const VERSION = "2.0.0";

const VALID_TYPES = [
  "feat",
  "fix",
  "build",
  "chore",
  "ci",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
];

const HELP_TEXT = `Usage: fgit [command]

fgit is a command-line tool that wraps around Git and provides a simpler way to create conventional commits and other niceties. Conventional commits follow a standardized format for commit messages, making it easier to understand the purpose of a change.

All commands not listed below will be passed through to Git.
For example, \`fgit status\` will run \`git status\`.

Commands:
    commit <type> <scope> <description>         Create a conventional commit with the specified type, scope, and description.
                                                If on an issue branch, the issue key will be appended automatically.

    issue <issue-key>-<issue-number> [suffix]   Create and switch to a new branch using the specified issue key and number.
                                                If a branch with the same name exists, you'll be prompted for a suffix.

    mrs [project-id]                            List merge requests on gitlab. 
                                                If not provided will use GITLAB_PROJECT_ID. Requires GITLAB_TOKEN

    update                                      Update fgit to the latest version

    --fgit-help                                 Show help information
    --version                                   Show version information
`;

function getCurrentBranch(): string {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
}

function handleCommitCommand(args: string[]) {
  if (args.length < 3) {
    console.error("Usage: fgit commit <type> <scope> <description>");
    process.exit(1);
  }

  const commitType = args[1].toLowerCase();
  if (!VALID_TYPES.includes(commitType)) {
    console.error(
      `Invalid commit type '${commitType}'.\nValid types are ${VALID_TYPES.join(
        ", ",
      )}`,
    );
    process.exit(1);
  }

  const scope = args[2].toLowerCase();
  const description = args.slice(3).join(" ");
  let commitMessage = `${commitType}(${scope}): ${description}`;

  const branchName = getCurrentBranch();

  if (branchName.startsWith("issue/")) {
    const match = branchName.slice(6).match(/^([^-]+)-(\d+)/);
    if (match) {
      const [, issueKey, issueNumber] = match;
      commitMessage += ` [${issueKey}-${issueNumber}]`;
    }
  }

  execSync(`git commit -m "${commitMessage}"`);
}

async function handleIssueCommand(args: string[]) {
  if (args.length < 2 || args.length > 3) {
    console.error("Usage: fgit issue <issue-key>-<issue-number> [suffix]");
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

  execSync(`git checkout -b ${issueBranchName}`);
}

async function handleMrsCommand(args: string[]) {
  const token = process.env.GITLAB_TOKEN;
  if (!token) {
    console.error("Error: Missing GITLAB_TOKEN environment variable");
    process.exit(1);
  }

  const projectId = args[1] || process.env.GITLAB_PROJECT_ID;
  if (!projectId) {
    console.error(
      "Error: Missing project-id argument, or try adding a GITLAB_PROJECT_ID environment variable",
    );
    process.exit(1);
  }

  const response = await fetch(
    `https://gitlab.com/api/v4/projects/${projectId}/merge_requests`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    console.error(`Failed to list merge requests: ${response.status}`);
    process.exit(1);
  }

  const mergeRequests = await response.json();

  for (const mr of mergeRequests) {
    console.log(`${mr.title} by ${mr.author.name} (${mr.web_url})`);
  }
}

function handleUpdateCommand() {
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
        execSync("bun build ./src/index.ts --compile --outfile ./fgit");
        console.log("Project built successfully");
      }
    });
  } catch (error) {
    console.error("Update failed:", error);
    process.exit(1);
  }
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(HELP_TEXT);
  process.exit(1);
}

switch (args[0]) {
  case "update":
    handleUpdateCommand();
    break;
  case "issue":
    handleIssueCommand(args);
    break;
  case "commit":
    handleCommitCommand(args);
    break;
  case "mrs":
    handleMrsCommand(args);
    break;
  case "--fgit-help":
    console.log(HELP_TEXT);
    break;
  case "--version":
    console.log(`fgit version ${VERSION}`);
    break;
  default:
    execSync(`git ${args.join(" ")}`, { stdio: "inherit" });
}
