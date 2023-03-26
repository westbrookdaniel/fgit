use std::io;
use std::process::{exit, Command};

pub fn handle_issue_command(args: &[String]) {
    if args.len() < 2 || args.len() > 3 {
        eprintln!("Usage: fgit issue <issue-key>-<issue-number> [suffix]");
        exit(1);
    }

    let issue_key_number = &args[1];
    let suffix = if args.len() == 3 { &args[2] } else { "" };
    let issue_branch_name = if !suffix.trim().is_empty() {
        format!("issue/{}-{}", issue_key_number, suffix)
    } else {
        format!("issue/{}", issue_key_number)
    };

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
        let new_issue_branch_name = if !new_suffix.trim().is_empty() {
            format!("issue/{}-{}", issue_key_number, new_suffix)
        } else {
            format!("issue/{}", issue_key_number)
        };
        let branch_output = Command::new("git")
            .arg("show-ref")
            .arg("--verify")
            .arg(format!("refs/heads/{}", new_issue_branch_name))
            .output()
            .expect("Failed to execute git command");
        if !branch_output.status.success() {
            Command::new("git")
                .arg("checkout")
                .arg("-b")
                .arg(&new_issue_branch_name)
                .status() // Execute the command to create the branch
                .expect("Failed to execute git command");
        }
    }

    if !branch_exists {
        Command::new("git")
            .arg("checkout")
            .arg("-b")
            .arg(&issue_branch_name)
            .status() // Execute the command to create the branch
            .expect("Failed to execute git command");
    }
}
