import { S } from "./util";

export async function handleMrsCommand(args: string[]) {
  const token = process.env.GITLAB_AUTH_TOKEN;
  if (!token) {
    console.error("Error: Missing GITLAB_AUTH_TOKEN environment variable");
    process.exit(1);
  }

  const projectId = args[1] || process.env.GITLAB_PROJECT_ID;
  if (!projectId) {
    console.error(
      "Error: Missing project-id argument, or try adding a GITLAB_PROJECT_ID environment variable",
    );
    console.log(`${S.Dim}\n\`fgit --fgit-help\` for more details\n${S.Reset}`);
    process.exit(1);
  }

  const response = await fetch(
    `https://gitlab.com/api/v4/projects/${projectId}/merge_requests?state=opened`,
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

  console.log();

  for (const mr of mergeRequests) {
    console.log(`${S.Bold}${mr.title}${S.Reset}`);
    console.log(
      `${S.Dim}By ${mr.author.name} to ${mr.target_branch}${S.Reset} ${transformStatus(mr.detailed_merge_status)}`,
    );
    console.log(`${S.Dim}${mr.web_url}${S.Reset}\n`);
  }
}

function transformStatus(status: string) {
  const text = status.replaceAll("_", " ");

  let color = S.Dim;
  if (status === "mergeable") {
    color = S.Green;
  }
  if (status === "not_open" || status === "checking") {
    color = S.Yellow;
  }
  if (status === "cannot_be_merged" || status === "conflict") {
    color = S.Red;
  }

  return `${S.Dim}[${S.Reset}${color}${text}${S.Reset}${S.Dim}]${S.Reset}`;
}
