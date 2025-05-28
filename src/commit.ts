import { execSync } from "child_process";
import { S } from "./util";

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

const COMMIT_HELP = `${S.Red}Usage: fgit commit <type> <scope> <description>${S.Reset}

    Available types: ${VALID_TYPES.join(", ")}

    Example: fgit commit feat auth add login functionality

${S.Dim}\`fgit --fgit-help\` for more details${S.Reset}
`;

export function handleCommitCommand(args: string[]) {
  if (args.length < 3) {
    console.log(COMMIT_HELP);
    process.exit(1);
  }

  const commitType = args[1].toLowerCase();
  if (!VALID_TYPES.includes(commitType)) {
    console.error(
      `Invalid commit type '${commitType}'.\nValid types are ${VALID_TYPES.join(
        ", ",
      )}`,
    );
    console.log(`${S.Dim}\n\`fgit --fgit-help\` for more details\n${S.Reset}`);
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

  try {
    execSync(`git commit -m "${commitMessage}"`, { stdio: "inherit" });
  } catch {}
}

function getCurrentBranch(): string {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
}
