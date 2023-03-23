use std::env;
use std::process::{Command, exit};

const VALID_TYPES: [&str; 10] = ["feat", "fix", "build", "chore", "ci", "docs", "style", "refactor", "perf", "test"];

fn main() {
    let args: Vec<String> = env::args().skip(1).collect();
    let mut git_command = Command::new("git");
    
    if args.is_empty() {
        eprintln!("No git command provided");
        exit(1);
    }
    
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
        
        let branch_output = Command::new("git")
            .arg("rev-parse")
            .arg("--abbrev-ref")
            .arg("HEAD")
            .output()
            .expect("Failed to execute git command");
        let branch_name = String::from_utf8_lossy(&branch_output.stdout).trim().to_string();
        
        if branch_name.starts_with("issue/") {
            if let Some(issue_number) = branch_name[6..].find('-') {
                let issue_key = &branch_name[6..6 + issue_number];
                let issue_number = &branch_name[6 + issue_number + 1..];
                if issue_key.len() == 3 && issue_number.chars().all(|c| c.is_ascii_digit()) {
                    commit_message.push_str(&format!(" [{}-{}]", issue_key, issue_number));
                }
            }
        }
        
        git_command.arg("commit").arg("-m").arg(commit_message);
    } else {
        git_command.args(&args);
    }
    
    let status = git_command.status().expect("Failed to execute git command");
    exit(status.code().unwrap_or(1));
}
