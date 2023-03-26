mod commit;
mod issue;
mod update;

use std::env;
use std::process::{exit, Command};

const VERSION: &str = "1.1.4";

const HELP_TEXT: &str = "Usage: fgit [command]

fgit is a command-line tool that wraps around Git and provides a simpler way to create conventional commits and other niceties. Conventional commits follow a standardized format for commit messages, making it easier to understand the purpose of a change.

Commands:
    commit <type> <scope> <description>
    issue <issue-key>-<issue-number> [suffix]
    update
    --fgit-help     Show help information
    --version  Show version information";

fn main() {
    let args: Vec<String> = env::args().skip(1).collect();

    // Check if a command is provided
    if args.is_empty() {
        eprintln!("No git command provided");
        exit(1);
    }

    // Handle different commands using separate functions
    match args[0].as_str() {
        "update" => update::handle_update_command(),
        "issue" => issue::handle_issue_command(&args),
        "commit" => commit::handle_commit_command(&args),
        "--fgit-help" => {
            println!("{}", HELP_TEXT);
        }
        "--version" => {
            println!("fgit version {}", VERSION);
        }
        _ => {
            let status = Command::new("git")
                .args(&args)
                .status()
                .expect("Failed to execute git command");
            exit(status.code().unwrap_or(1));
        }
    }
}
