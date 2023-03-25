use std::process::{exit, Command};
use std::{env, io};

const VALID_TYPES: [&str; 10] = [
    "feat", "fix", "build", "chore", "ci", "docs", "style", "refactor", "perf", "test",
];
const VERSION: &str = "1.1.0";

const HELP_TEXT: &str = "Usage: fgit [command]

fgit is a command-line tool that wraps around Git and provides a simpler way to create conventional commits and other niceties. Conventional commits follow a standardized format for commit messages, making it easier to understand the purpose of a change.

Commands:
    commit <type> <scope> <description>
    issue <issue-key>-<issue-number> [suffix]
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
        Command::new("cd")
            .arg(env::current_dir().unwrap().to_str().unwrap())
            .output()
            .expect("Failed to execute cd command");

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

        Command::new("cd")
            .arg("-")
            .output()
            .expect("Failed to execute cd command");

        exit(0);
    }

    // Handle git issue command
    if args[0] == "issue" {
        if args.len() < 2 || args.len() > 3 {
            eprintln!("Usage: fgit issue <issue-key>-<issue-number> [suffix]");
            exit(1);
        }

        let issue_key_number = &args[1];
        let suffix = if args.len() == 3 { &args[2] } else { "" };
        let issue_branch_name = format!("issue/{}-{}-{}", issue_key_number, suffix, VERSION);

        let mut branch_exists = false;
        let branch_output = Command::new("git")
            .arg("show-ref")
            .arg("--verify")
            .arg(format!("refs/heads/{}", issue_branch_name))
            .output()
            .expect("Failed to execute git command");
        if branch_output.status.success() {
            branch_exists = true;
        }

        while branch_exists {
            println!(
                "A branch named '{}' already exists. Please enter a new suffix:",
                issue_branch_name
            );
            let mut new_suffix = String::new();
            io::stdin()
                .read_line(&mut new_suffix)
                .expect("Failed to read input");
            let new_suffix = new_suffix.trim();
            let new_issue_branch_name =
                format!("issue/{}-{}-{}", issue_key_number, new_suffix, VERSION);
            let branch_output = Command::new("git")
                .arg("show-ref")
                .arg("--verify")
                .arg(format!("refs/heads/{}", new_issue_branch_name))
                .output()
                .expect("Failed to execute git command");
            if branch_output.status.success() {
                branch_exists = true;
            } else {
                branch_exists = false;
                git_command
                    .arg("checkout")
                    .arg("-b")
                    .arg(&new_issue_branch_name);
            }
        }

        if !branch_exists {
            git_command
                .arg("checkout")
                .arg("-b")
                .arg(&issue_branch_name);
        }
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
