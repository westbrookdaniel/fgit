import { execSync } from "child_process";
import { handleCommitCommand } from "./commit";
import { handleIssueCommand } from "./issue";
import { handleMrsCommand } from "./mrs";
import { handleUpdateCommand } from "./update";
import { S } from "./util";
import { handleFinishCommand } from "./finish";

const VERSION = "2.0.0";

const HELP_TEXT = `${S.Yellow}${S.Bold}fgit${S.Reset} is a command-line tool that wraps Git with extra commands and niceties.

${S.Bold}Usage: fgit [command]${S.Reset}

${S.Dim}All commands not listed below will be passed through to Git.
For example, \`fgit status\` will run \`git status\`.${S.Reset}

${S.Bold}Commands:${S.Reset}
    ${S.Bold}${S.Blue}git${S.Reset}                                         ${S.Dim}Explicitly use a git command${S.Reset}

    ${S.Bold}${S.Blue}commit${S.Reset} <type> <scope> <description>         ${S.Dim}Create a conventional commit with the specified type, scope, and description.
                                                If on an issue branch, the issue key will be appended automatically.${S.Reset}

    ${S.Bold}${S.Blue}finish${S.Reset}                                      ${S.Dim}Pushes, but first wanrs if you have pending changes${S.Reset}

    ${S.Bold}${S.Blue}issue${S.Reset} <issue-key>-<issue-number> [suffix]   ${S.Dim}Create and switch to a new branch using the specified issue key and number.
                                                If a branch with the same name exists, you'll be prompted for a suffix.${S.Reset}

    ${S.Bold}${S.Magenta}mrs${S.Reset} [project-id]                            ${S.Dim}List merge requests on gitlab. 
                                                If not provided will use GITLAB_PROJECT_ID. Requires GITLAB_AUTH_TOKEN${S.Reset}

    ${S.Bold}${S.Green}update${S.Reset}                                      ${S.Dim}Update fgit to the latest version${S.Reset}

    --fgit-help                                 ${S.Dim}Show help information${S.Reset}
    --version                                   ${S.Dim}Show version information${S.Reset}
`;

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(HELP_TEXT);
  process.exit(0);
}

switch (args[0]) {
  case "update":
    handleUpdateCommand();
    break;
  case "issue":
    handleIssueCommand(args);
    break;
  case "commit":
    await handleCommitCommand(args);
    break;
  case "finish":
    await handleFinishCommand();
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
  case "git":
    try {
      execSync(`git ${args.slice(1).join(" ")}`, { stdio: "inherit" });
    } catch {}
    break;
  default:
    try {
      execSync(`git ${args.join(" ")}`, { stdio: "inherit" });
    } catch {}
}
