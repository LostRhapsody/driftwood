use crate::netlify::Netlify;
use crate::driftwood::{SiteDetails, NewSite};
use std::path::Path;
use std::fs::{File, OpenOptions};
use std::io::{Read, Write};
use serde_json::{Value, from_str};

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
pub fn update_site(site: &str) -> Result<String, String> {
    println!("Creating a site");
    println!("Updated site args: {}", site);

    let site: SiteDetails = serde_json::from_str(site).map_err(|e| e.to_string())?;
    let netlify = Netlify::new().map_err(|e| e.to_string())?;

    match netlify.update_site(site.clone()) {
        Ok(site_details) => {
            Ok(serde_json::json!({
                "success":true,
                "title": "created",
                "description": "Site updated successfully! 🎉",
                "name": site_details.name,
            }).to_string())
        },
        Err(err) => Err(
            serde_json::json!({
                "success":false,
                "title": "Failed to update site",
                "description": err.to_string(),
                "name": "error",
            }).to_string()
        ),
    }

}

#[tauri::command]
pub fn refresh_sites(return_site:bool) -> String {
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
                });
                sites_json.push(site_json);
            }

            let sites_json_string = serde_json::to_string(&sites_json).unwrap_or_else(|_| String::from("Failed to serialize sites"));
            if let Err(e) = save_json_to_file("sites/sites.json", sites_json) {
                eprintln!("Failed to save JSON to file: {}", e);
            }
            if return_site {
                sites_json_string
            } else {
                serde_json::json!({
                    "success":true,
                    "title": "refreshed",
                    "description": "Sites refreshed",
                }).to_string()
            }

        }
        Err(e) => {
            println!("Error: {:?}", e);
            String::from("Failed to retrieve sites from Netlify")
        }
    }
}

#[tauri::command]
pub fn get_site_details(site_id:String) -> String {

    println!("Getting details for site {}", site_id);

    // Load JSON from file
    match load_json_from_file("sites/sites.json") {
        Ok(Some(loaded_json)) => {
            println!("Loaded JSON: {}", loaded_json);
            let site_details: Vec<SiteDetails> = serde_json::from_str(&loaded_json.to_string()).unwrap();
            let mut sites_json: Option<Value> = None;
            for site in site_details {
                if site.id.clone().unwrap_or_else(|| "".to_string()) == site_id {
                    let site_json = serde_json::json!({
                        "name": site.name.unwrap_or_else(|| "".to_string()),
                        "domain": site.domain.unwrap_or_else(|| "".to_string()),
                        "id": site.id.unwrap_or_else(|| "".to_string()),
                        "ssl": site.ssl.unwrap_or(false),
                        "url": site.url.unwrap_or_else(|| "".to_string()),
                        "screenshot_url": site.screenshot_url.unwrap_or_else(|| "https://images.unsplash.com/photo-1615147342761-9238e15d8b96?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1001&q=80".to_string()),
                        "password": site.password.unwrap_or_else(|| "".to_string()),
                    });
                    sites_json = Some(site_json);
                    break;
                }
            }
            if let Some(ref data) = sites_json {
                serde_json::to_string(&data).unwrap_or_else(|_| String::from("Failed to serialize sites from disk"))
            } else {
                eprintln!("Could not find this site on disk.");
                String::from("Could not find this site on disk.")
            }
        }
        Ok(None) =>{
            eprintln!("No sites or JSON on disk to load from!");
            String::from("No sites or JSON on disk to load from!")
        }
        Err(e) => {
            eprintln!("Failed to load JSON from file: {}", e);
            String::from(format!("Failed to load JSON from file: {}", e))
        }
    }
}

#[tauri::command]
pub fn list_sites() -> String {

    println!("Listing sites");

    // Load JSON from file
    match load_json_from_file("sites/sites.json") {
        Ok(Some(loaded_json)) => {
            println!("Loaded JSON: {}", loaded_json);
            serde_json::to_string(&loaded_json).unwrap_or_else(|_| String::from("Failed to serialize sites from disk"))
        }
        Ok(None) =>{
            println!("File is empty or JSON could not be parsed.");
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
                        });
                        sites_json.push(site_json);
                    }

                    let sites_json_string = serde_json::to_string(&sites_json).unwrap_or_else(|_| String::from("Failed to serialize sites"));
                    if let Err(e) = save_json_to_file("sites/sites.json", sites_json) {
                        eprintln!("Failed to save JSON to file: {}", e);
                    }
                    sites_json_string
                }
                Err(e) => {
                    println!("Error: {:?}", e);
                    String::from("Failed to login, please try again")
                }

            }
        }
        Err(e) => {
            eprintln!("Failed to load JSON from file: {}", e);
            String::from(format!("Failed to load JSON from file: {}", e))
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

/// Saves a JSON vector to disk by appending the entire vector as a single array.
fn save_json_to_file(file_path: &str, json_data: Vec<Value>) -> Result<(), std::io::Error> {
    // Serialize the entire vector as a single JSON array
    let serialized_json = serde_json::to_string(&json_data).unwrap_or_else(|_| String::from("Failed to serialize sites"));

    // Open the file in append mode and create it if it doesn't exist
    let mut file = OpenOptions::new()
        .write(true)
        .truncate(true) // This ensures the file is emptied before writing
        .create(true)
        .open(file_path)?;

    // Write the serialized JSON array to the file
    file.write_all(serialized_json.as_bytes())?;
    file.write_all(b"\n")?;  // Optional: Add a newline at the end

    Ok(())
}

/// reads a json value from disk
fn load_json_from_file(file_path: &str) -> Result<Option<Value>, std::io::Error> {
    // if the path exists first and if it doesn't, create it.
    // this will trigger "contents.is_empty" and we'll retrieve it from the API
    let path = Path::new(file_path);

    if !path.exists() {
        File::create(path)?;
    }

    let mut file = OpenOptions::new().read(true).open(file_path)?;

    let mut contents = String::new();
    file.read_to_string(&mut contents)?;

    if !contents.is_empty() {
        let json_data: Value = from_str(&contents).unwrap_or(Value::Null);
        Ok(Some(json_data))
    } else {
        Ok(None)
    }
}
