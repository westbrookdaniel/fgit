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
    console.log("\n\`fgit --fgit-help` for more details\n");
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
    console.log(`${mr.title} by ${mr.author.name}`);
    console.log(`${mr.web_url}`);
    console.log();
  }
}
