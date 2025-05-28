import { execSync } from "child_process";
import { getCurrentBranch, question, S } from "./util";

export async function handleFinishCommand() {
  const branchName = getCurrentBranch();

  // Check for pending changes
  const pendingChanges = execSync("git status -s").toString();

  if (pendingChanges) {
    console.log("You have pending changes in your tree.\n");

    try {
      await question("Are you sure you want to push your changes?");
    } catch (error) {
      console.log(`\n${S.Dim}Aborting...${S.Reset}\n`);
      process.exit(1);
    }
  }

  try {
    execSync(`git push -u origin ${branchName}`, { stdio: "inherit" });
  } catch {}
}
