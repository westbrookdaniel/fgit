import { execSync } from "child_process";

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

export function handleCommitCommand(args: string[]) {
  if (args.length < 3) {
    console.error("Usage: fgit commit <type> <scope> <description>");
    console.log("\n\`fgit --fgit-help` for more details\n");
    process.exit(1);
  }

  const commitType = args[1].toLowerCase();
  if (!VALID_TYPES.includes(commitType)) {
    console.error(
      `Invalid commit type '${commitType}'.\nValid types are ${VALID_TYPES.join(
        ", ",
      )}`,
    );
    console.log("\n\`fgit --fgit-help` for more details\n");
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

function getCurrentBranch(): string {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
}
