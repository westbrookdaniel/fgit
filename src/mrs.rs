use reqwest::header::{HeaderMap, HeaderValue, ACCEPT, AUTHORIZATION};
use std::{env, process::exit};

fn get_gitlab_token() -> Result<String, String> {
    env::var("GITLAB_TOKEN").map_err(|_| "Missing GITLAB_TOKEN environment variable".to_string())
}

fn get_gitlab_project_id(args: &[String]) -> Result<String, String> {
    // First argument is optional gitlab project id
    if args.len() > 1 {
        Ok(args[1].clone())
    } else {
        env::var("GITLAB_PROJECT_ID").map_err(|_| {
            "Missing project-id argument, or try adding a GITLAB_PROJECT_ID environment variable"
                .to_string()
        })
    }
}

fn get_merge_requests(token: &str, project_id: &str) -> Result<Vec<serde_json::Value>, String> {
    let api_url = format!(
        "https://gitlab.com/api/v4/projects/{}/merge_requests",
        project_id
    );

    let mut headers = HeaderMap::new();
    headers.insert(ACCEPT, HeaderValue::from_static("application/json"));
    headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {}", token))
            .expect("Failed to create authorization header"),
    );

    let client = reqwest::blocking::Client::builder()
        .default_headers(headers)
        .build()
        .expect("Failed to create HTTP client");

    let response = client
        .get(&api_url)
        .send()
        .map_err(|error| format!("Failed to send HTTP request: {}", error))?;

    if !response.status().is_success() {
        return Err(format!(
            "Failed to list merge requests: {}",
            response.status()
        ));
    }

    let merge_requests: Vec<serde_json::Value> = response
        .json()
        .map_err(|error| format!("Failed to parse response JSON: {}", error))?;

    Ok(merge_requests)
}

pub fn handle_mrs_command(args: &[String]) {
    let token = get_gitlab_token().unwrap_or_else(|error| {
        eprintln!("Error: {}", error);
        exit(1);
    });

    let project_id = get_gitlab_project_id(args).unwrap_or_else(|error| {
        eprintln!("Error: {}", error);
        exit(1);
    });

    let merge_requests = get_merge_requests(&token, &project_id).unwrap_or_else(|error| {
        eprintln!("Error: {}", error);
        exit(1);
    });

    for merge_request in merge_requests {
        let title = merge_request["title"].as_str().unwrap_or_else(|| {
            eprintln!("Error: Missing merge request title");
            exit(1);
        });
        let author_name = merge_request["author"]["name"].as_str().unwrap_or_else(|| {
            eprintln!("Error: Missing merge request author name");
            exit(1);
        });
        let web_url = merge_request["web_url"].as_str().unwrap_or_else(|| {
            eprintln!("Error: Missing merge request web URL");
            exit(1);
        });

        println!("{} by {} ({})", title, author_name, web_url);
    }
}
