use std::process::{exit, Command};
use std::{env, io};

pub fn handle_update_command() {
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
            Command::new("git")
                .arg("pull")
                .arg("origin")
                .arg("main")
                .status()
                .expect("Failed to execute git command");

            // Build the project after pulling the new version
            let build_output = Command::new("cargo")
                .arg("build")
                .output()
                .expect("Failed to execute build command");

            if build_output.status.success() {
                println!("Project built successfully");
            } else {
                eprintln!(
                    "Build failed:\n{}",
                    String::from_utf8_lossy(&build_output.stderr)
                );
                exit(1);
            }
        }
    }

    Command::new("cd")
        .arg("-")
        .output()
        .expect("Failed to execute cd command");
}
