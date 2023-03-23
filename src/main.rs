use std::process::{exit, Command};
use std::{env, io};

const VALID_TYPES: [&str; 10] = [
    "feat", "fix", "build", "chore", "ci", "docs", "style", "refactor", "perf", "test",
];
const VERSION: &str = "1.0.0";

const HELP_TEXT: &str = "Usage: fgit [command]

Wrapper around git. All unhandled commands are handled by git.

Commands:
    commit <type> <scope> <description>
    update
    --help     Show help information
    --version  Show version information";

fn main() {
    let args: Vec<String> = env::args().skip(1).collect();
    let mut git_command = Command::new("git");

    // Handle --help and --version options
    if let Some(option) = args.iter().next() {
        match option.as_str() {
            "--help" => {
                println!("{}", HELP_TEXT);
                exit(0);
            }
            "--version" => {
                println!("fgit version {}", VERSION);
                exit(0);
            }
            _ => {}
        }
    }

    // Check if git command is provided
    if args.is_empty() {
        eprintln!("No git command provided");
        exit(1);
    }

    // Handle updating fgit
    if args[0] == "update" {
        let output = Command::new("git")
            .arg("fetch")
            .arg("--dry-run")
            .arg("origin")
            .arg("main")
            .output()
            .expect("Failed to execute git command");

        if output.stdout.is_empty() {
            println!("fgit is up to date");
        } else {
            println!("New version of fgit is available. Do you want to update? (y/n)");
            let mut input = String::new();
            io::stdin()
                .read_line(&mut input)
                .expect("Failed to read input");

            if input.trim().to_lowercase() == "y" {
                let output = Command::new("git")
                    .arg("pull")
                    .arg("origin")
                    .arg("main")
                    .output()
                    .expect("Failed to execute git command");
                println!("{}", String::from_utf8_lossy(&output.stdout));
                exit(0);
            }
        }

        exit(0);
    }

    // Handle git commit command
    if args[0] == "commit" {
        if args.len() < 3 {
            eprintln!("Usage: fgit commit <type> <scope> <description>");
            exit(1);
        }

        let commit_type = args[1].to_lowercase();
        if !VALID_TYPES.contains(&&*commit_type) {
            eprintln!("Invalid commit type '{}'", commit_type);
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

        git_command.arg("commit").arg("-m").arg(commit_message);
    } else {
        git_command.args(&args);
    }

    let status = git_command.status().expect("Failed to execute git command");
    exit(status.code().unwrap_or(1));
}
