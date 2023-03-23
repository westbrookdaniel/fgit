use std::env;
use std::process::{Command, exit};

fn main() {
    let args: Vec<String> = env::args().skip(1).collect();
    let mut git_command = Command::new("git");

    if args.is_empty() {
        eprintln!("No git command provided");
        exit(1);
    }

    if args[0] == "commit" {
        if args.len() < 4 {
            eprintln!("Usage: fgit commit <type> <scope> <description>");
            exit(1);
        }

        let commit_type = args[1].to_lowercase();
        let commit_scope = &args[2];
        let commit_description = args[3..].join(" ");
        let commit_message = format!("{}({}): {}", commit_type, commit_scope, commit_description);

        // Validate the commit type against the Conventional Commits specification
        let valid_commit_types = vec![
            "build",
            "ci",
            "docs",
            "feat",
            "fix",
            "perf",
            "refactor",
            "style",
            "test",
            "chore",
        ];
        if !valid_commit_types.contains(&&*commit_type) {
            eprintln!(
                "Invalid commit type '{}'. Must be one of: {}",
                commit_type,
                valid_commit_types.join(", ")
            );
            exit(1);
        }

        git_command.arg("commit").arg("-m").arg(commit_message);
    } else {
        git_command.args(&args);
    }

    let status = git_command.status().expect("Failed to execute git command");
    exit(status.code().unwrap_or(1));
}
