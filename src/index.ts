import { execSync } from "child_process";
import { handleCommitCommand } from "./commit";
import { handleIssueCommand } from "./issue";
import { handleMrsCommand } from "./mrs";
import { handleUpdateCommand } from "./update";

const VERSION = "2.0.0";

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
                                                If not provided will use GITLAB_PROJECT_ID. Requires GITLAB_AUTH_TOKEN

    update                                      Update fgit to the latest version

    --fgit-help                                 Show help information
    --version                                   Show version information
`;

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
