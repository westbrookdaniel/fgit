use std::process::{exit, Command};

const VALID_TYPES: [&str; 10] = [
    "feat", "fix", "build", "chore", "ci", "docs", "style", "refactor", "perf", "test",
];

pub fn handle_commit_command(args: &[String]) {
    if args.len() < 3 {
        eprintln!("Usage: fgit commit <type> <scope> <description>");
        exit(1);
    }

    let commit_type = args[1].to_lowercase();
    if !VALID_TYPES.contains(&&*commit_type) {
        eprintln!(
            "Invalid commit type '{}'.\nValid types are {}",
            commit_type,
            VALID_TYPES.join(", ")
        );
        exit(1);
    }

    let scope = args[2].to_lowercase();
    let description = args[3..].join(" ");
    let mut commit_message = format!("{}({}): {}", commit_type, scope, description);

    // Append issue number if current branch name starts with "issue/XXX-000"
    let branch_output = Command::new("git")
        .arg("rev-parse")
        .arg("--abbrev-ref")
        .arg("HEAD")
        .output()
        .expect("Failed to execute git command");
    let branch_name = String::from_utf8_lossy(&branch_output.stdout)
        .trim()
        .to_string();

    if branch_name.starts_with("issue/") {
        if let Some(issue_number) = branch_name[6..].find('-') {
            let issue_key = &branch_name[6..6 + issue_number];
            let issue_number = &branch_name[6 + issue_number + 1..]
                .chars()
                .take_while(|c| c.is_ascii_digit())
                .collect::<String>();
            commit_message.push_str(&format!(" [{}-{}]", issue_key, issue_number));
        }
    }

    Command::new("git")
        .arg("commit")
        .arg("-m")
        .arg(commit_message)
        .status()
        .expect("Failed to execute git command");
}
