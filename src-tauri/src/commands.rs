use crate::netlify::Netlify;
use crate::driftwood::{SiteDetails, NewSite};
use std::path::Path;

#[tauri::command]
pub fn netlify_login() -> bool {
    println!("Logging in");
    let netlify = Netlify::new();
    match netlify {
        Ok(_) => true,
        Err(_) => false,
    }
}

#[tauri::command]
pub fn netlify_logout() -> bool {
    println!("Logging out");
    let token_file = Path::new("netlify_token.json");
    match token_file.exists() {
        true => {
            match std::fs::remove_file(token_file) {
                Ok(_) => true,
                Err(_) => false,
            }
        }
        false => false,
    }
}

#[tauri::command]
pub fn check_token() -> bool {
    println!("Checking token");
    let token_file = Path::new("netlify_token.json");
    match token_file.exists() {
        true => true,
        false => false,
    }
}

#[tauri::command]
pub fn create_site(new_site: &str) -> Result<String, String> {
    println!("Creating a site");
    println!("new site args: {}", new_site);

    let site: NewSite = serde_json::from_str(new_site).map_err(|e| e.to_string())?;
    let netlify = Netlify::new().map_err(|e| e.to_string())?;

    match netlify.create_site(site.clone()) {
        Ok(site_details) => {
            // if github or password enabled are true, perform some follow-up API requests
            if site.github_enabled {
                println!("Github not yet implemented.");
            }
            if site.password_enabled {
                println!("Password not yet implemented.");
            }
            Ok(serde_json::json!({
                "success":true,
                "title": "created",
                "description": "New site created successfully! 🎉 Let's start building!",
                "name": site_details.name,
            }).to_string())
        },
        Err(err) => Err(
            serde_json::json!({
                "success":false,
                "title": "Failed to create site",
                "description": err.to_string(),
                "name": "error",
            }).to_string()
        ),
    }

}

#[tauri::command]
pub fn list_sites() -> String {

    println!("Listing sites");

    match Netlify::new() {
        Ok(netlify) => {
            println!("Netlify instance created");
            let site_details: Vec<SiteDetails> = get_sites(netlify);
            let mut sites_json = Vec::new();

            for site in site_details {
                let site_json = serde_json::json!({
                    "name": site.name.unwrap_or_else(|| "".to_string()),
                    "domain": site.domain.unwrap_or_else(|| "".to_string()),
                    "id": site.id.unwrap_or_else(|| "".to_string()),
                    "ssl": site.ssl.unwrap_or(false),
                    "url": site.url.unwrap_or_else(|| "".to_string()),
                    "screenshot_url": site.screenshot_url.unwrap_or_else(|| "https://images.unsplash.com/photo-1615147342761-9238e15d8b96?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1001&q=80".to_string()),
                    "required": site.required.is_some(),
                });
                sites_json.push(site_json);
            }

            serde_json::to_string(&sites_json).unwrap_or_else(|_| String::from("Failed to serialize sites"))
        }
        Err(e) => {
            println!("Error: {:?}", e);
            String::from("Failed to login, please try again")
        }

    }
}

/// Get all the sites for the user
/// netlify: A Netlify instance
/// Returns a vector of SiteDetails
fn get_sites(netlify: Netlify) -> Vec<SiteDetails> {
    match netlify.get_sites() {
        Ok(sites) => {
            println!("Done");
            for each in &sites {
                println!("\nSite Details:");
                println!("{:?}", each);
            }
            sites
        }
        Err(e) => {
            println!("Error: {:?}", e);
            vec![]
        }
    }
}
