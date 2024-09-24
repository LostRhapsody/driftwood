use crate::driftwood::{NewSite, Post, SiteDetails, read_and_parse,template_html};
use crate::netlify::Netlify;
use serde::{Deserialize, Serialize};
use serde_json::{from_str, Value};
use std::fs::{File, OpenOptions};
use std::io::{Read, Write};
use std::path::Path;

// This is like the post struct from driftwood.rs, but
// is strictly for serializing the json from the client.
#[derive(Serialize, Deserialize, Debug)]
struct PostData {
    post_name: String,
    post_text: String,
}

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
        true => match std::fs::remove_file(token_file) {
            Ok(_) => true,
            Err(_) => false,
        },
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
            })
            .to_string())
        }
        Err(err) => Err(serde_json::json!({
            "success":false,
            "title": "Failed to create site",
            "description": err.to_string(),
            "name": "error",
        })
        .to_string()),
    }
}

#[tauri::command]
pub fn update_site(site: &str) -> Result<String, String> {
    println!("Updating a site");
    println!("Updated site args: {}", site);

    let site: SiteDetails = serde_json::from_str(site).map_err(|e| e.to_string())?;
    let netlify = Netlify::new().map_err(|e| e.to_string())?;

    match netlify.update_site(site.clone()) {
        Ok(site_details) => Ok(serde_json::json!({
            "success":true,
            "title": "updated",
            "description": "Site updated successfully! 🎉",
            "name": site_details.name,
        })
        .to_string()),
        Err(err) => Err(serde_json::json!({
            "success":false,
            "title": "Failed to update site",
            "description": err.to_string(),
            "name": "error",
        })
        .to_string()),
    }
}

#[tauri::command]
pub fn refresh_sites(return_site: bool) -> String {
    println!("Refreshing sites");
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

            let sites_json_string = serde_json::to_string(&sites_json)
                .unwrap_or_else(|_| String::from("Failed to serialize sites"));
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
                })
                .to_string()
            }
        }
        Err(e) => {
            println!("Error: {:?}", e);
            String::from("Failed to retrieve sites from Netlify")
        }
    }
}

#[tauri::command]
pub fn get_site_details(site_id: String) -> String {
    println!("Getting details for site {}", site_id);

    match get_single_site_details(site_id) {
        Ok(result) => serde_json::to_string(&result)
            .unwrap_or_else(|_| String::from("Failed to serialize sites from disk")),
        Err(err) => err,
    }
}

#[tauri::command]
pub fn list_sites() -> String {
    println!("Listing sites");

    // Load JSON from file
    match load_json_from_file() {
        Ok(Some(loaded_json)) => {
            println!("Loaded JSON: {}", loaded_json);
            serde_json::to_string(&loaded_json)
                .unwrap_or_else(|_| String::from("Failed to serialize sites from disk"))
        }
        Ok(None) => {
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
                            "required": site.required.is_some(),
                        });
                        sites_json.push(site_json);
                    }

                    let sites_json_string = serde_json::to_string(&sites_json)
                        .unwrap_or_else(|_| String::from("Failed to serialize sites"));
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

#[tauri::command]
pub fn create_post(post_data: String, site_data: String) -> String {
    println!("Create post, data: {}", post_data);

    // serialize the post_data into a JSON object for interactivity.
    let post_data: PostData = serde_json::from_str(&post_data).unwrap_or_else(|e| {
        println!("Error deserializing: {}", e);
        PostData {
            post_name: "".to_string(),
            post_text: "".to_string(),
        }
    });

    // serialize the site_data into a JSON object for interactivity.
    let site_data: SiteDetails = serde_json::from_str(&site_data).unwrap_or_else(|e| {
        println!("Error deserializing: {}", e);
        SiteDetails {
            name: None,
            domain: None,
            id: None,
            ssl: None,
            url: None,
            screenshot_url: None,
            password: None,
            required: None,
        }
    });

    println!("Serialized post data: {:?}", post_data);
    println!("Serialized site data: {:?}", site_data);

    // create a new post
    // date is set automatically
    let mut new_post = Post::new(post_data.post_name);

    // strip bad chars and set post.filename
    let _ = new_post.clean_filename();
    // (replace "-"" with spaces basically) and set post.title
    let _ = new_post.build_post_name();
    // check if the site dir exists, if ont create it (sites/sitedr)
    let _ = site_data.check_site_dir();
    // check if the site post dir exists, if not create it (sitedir/md_posts)
    let _ = Post::check_post_dir(&site_data);

    // remove special chars and set post.tags
    // TODO - add tags
    let _ = new_post.clean_and_set_tags(String::new());

    // write the post to disk
    match new_post.write_post_to_disk(&site_data, post_data.post_text) {
        Ok(_) => {
            println!("Post written to disk.");
            String::from("Create post successfully")
        }
        Err(e) => {
            println!("Error: {}", e);
            String::from(e.to_string())
        }
    }
}

#[tauri::command]
pub fn deploy_site(site_id: String) -> String {
    match Netlify::new() {
        Ok(netlify) => {

            let site = get_single_site_details(site_id).expect("Failed to load site details");
            // first loop through the site's posts and convert them to HTML
            let site_path = SiteDetails::build_site_path(&site).expect("Failed to build site path");
            // convert site_path PathBuf to string
            let site_path = site_path.to_string_lossy().to_string();
            let post_path = format!("{}/md_posts", site_path);
            let html_post_path = format!("{}/posts", site_path);

            // lol bad names... it's the PATH types of these string paths
            let post_path_path = Path::new(&post_path);
            let html_post_path_path = Path::new(&html_post_path);
            if !post_path_path.exists() {
                std::fs::create_dir(post_path_path)
                    .expect("Failed to create this site's 'md_posts' directory");
            }
            if !html_post_path_path.exists() {
                std::fs::create_dir(html_post_path_path)
                    .expect("Failed to create this site's 'md_posts' directory");
            }

            let mut html_file_names = vec![];

            // loop through md posts
            for entry in std::fs::read_dir(post_path).unwrap() {
                // md filename
                let entry = entry.unwrap();
                println!("> {:?}", entry.file_name().to_string_lossy());
                // full path to md file
                let md_file_name = entry.path();
                println!("> {:?}", md_file_name);
                // full path to html file
                let html_file_name = format!(
                    "{}/posts/{}.html",
                    site_path,
                    entry.file_name().to_string_lossy()
                );
                println!("> {:?}", html_file_name);

                if md_file_name.is_file() {
                    let md_file_name = md_file_name.to_string_lossy();
                    // let html_file_name = html_file_name.file_name().unwrap().to_string_lossy().into_owned();
                    // convert to html
                    let success = read_and_parse(&md_file_name, &html_file_name);
                    match success {
                        Ok(_) => {
                            println!("Successfully converted markdown to HTML.");
                            // add this html file name to a vector of strings
                            html_file_names.push(html_file_name);
                        }
                        Err(e) => {
                            println!("Failed to convert markdown to HTML.");
                            println!("Error: {:?}", e);
                        }
                    }
                }
            }

            // remove any dashes or underscores from the site name, replace with spaces
            let clean_site_name = site
                .name
                .clone()
                .unwrap()
                .replace("-", " ")
                .replace("_", " ");
            let template_success =
                template_html(html_file_names, site_path.clone(), clean_site_name);
            match template_success {
                Ok(_) => {
                    println!("Successfully templated blog links.");
                }
                Err(e) => {
                    println!("Failed to template blog links.");
                    println!("Error: {:?}", e);
                }
            }

            // second generate the sha1 hash of all the html files
            let post_path = format!("{}/posts", site_path);

            let site_path = Path::new(&site_path);
            let post_path = Path::new(&post_path);

            let sha1_result = Netlify::generate_sha1_for_posts(site_path, post_path);

            if sha1_result.is_ok() {
                println!("> SHA1 hash generated successfully.");
            } else {
                let sha_error = sha1_result.err().unwrap();
                println!("> Error: {}", sha_error);
                return serde_json::json!({
                    "success":false,
                    "title": "Failed to deploy site",
                    "description": format!("Error: {}", sha_error),
                })
                .to_string()
            }

            // unwrap the result to get the FileHashes struct
            let sha1_hashmap = sha1_result.unwrap();

            // post the file hashes to netlify
            let new_site = netlify.send_file_checksums(site.clone(), &sha1_hashmap);

            // make sure you don't overlap "site" and "new site"
            // site is the og site details, new site is the deploy details + site details
            // the id will overlap
            match new_site {
                Ok(new_site) => {
                    println!(">Site Details:");
                    println!("{:?}", new_site);

                    // loop over the site's required vector (unwrap to get outside the option)
                    new_site.required.unwrap().iter().for_each(|file| {
                        println!("> Required file: {:?}", file);

                        // loop through our hashmap of file hashes
                        sha1_hashmap.files.iter().for_each(|file_hash| {
                            // destructure the tuple (apparently iterating through hashmaps gives you tuples)
                            let (current_file_name, current_file_hash) = file_hash;
                            // if they match, print
                            if file == current_file_hash {
                                println!("> Matching File hash: {:?}", file_hash);
                                let response = netlify.upload_file(
                                    site.name.clone().unwrap(),
                                    site.id.clone().unwrap(),
                                    new_site.id.clone().unwrap(),
                                    Path::new(current_file_name),
                                );
                                match response {
                                    Ok(_) => {
                                        println!("> File uploaded successfully.");
                                    }
                                    Err(e) => {
                                        println!("> Error: {:?}", e);
                                    }
                                }
                            }
                        });
                    });
                }
                Err(e) => {
                    println!("Error: {:?}", e);
                }
            }

            serde_json::json!({
                "success":true,
                "title": "Site deployed 🚀",
                "description": "Finished deploying site!",
            })
            .to_string()

        }
        Err(e) => e.to_string()
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
    let serialized_json = serde_json::to_string(&json_data)
        .unwrap_or_else(|_| String::from("Failed to serialize sites"));

    // Open the file in append mode and create it if it doesn't exist
    let mut file = OpenOptions::new()
        .write(true)
        .truncate(true) // This ensures the file is emptied before writing
        .create(true)
        .open(file_path)?;

    // Write the serialized JSON array to the file
    file.write_all(serialized_json.as_bytes())?;
    file.write_all(b"\n")?; // Optional: Add a newline at the end

    Ok(())
}

/// reads a json value from disk
fn load_json_from_file() -> Result<Option<Value>, std::io::Error> {
    let file_path = "./sites";
    let file_name = "sites.json";
    let full_path: String = format!("{}/{}", file_path, file_name);

    println!(
        "Loading JSON from file, file_path: {}/{} ",
        file_path, file_name
    );

    // if the path exists first and if it doesn't, create it.
    // this will trigger "contents.is_empty" and we'll retrieve it from the API
    let path = Path::new(file_path);

    if !path.exists() {
        println!("Path does not exist, creating.");
        std::fs::create_dir(path)?;
        // return here, as if the path does not exist, neither does a file that stores the sites
        return Ok(None);
    }

    let file_name = Path::new(&full_path);

    if !file_name.exists() {
        println!("Sites file does not exist, creating.");
        File::create(file_name)?;
        // again if the file didn't exist, there's nothing to load.
        return Ok(None);
    }

    let mut file = OpenOptions::new().read(true).open(file_name)?;

    let mut contents = String::new();
    file.read_to_string(&mut contents)?;

    if !contents.is_empty() {
        let json_data: Value = from_str(&contents).unwrap_or(Value::Null);
        Ok(Some(json_data))
    } else {
        Ok(None)
    }
}

fn get_single_site_details(site_id: String) -> Result<SiteDetails, String> {
    // Load JSON from file
    match load_json_from_file() {
        Ok(Some(loaded_json)) => {
            println!("Loaded JSON: {}", loaded_json);
            let site_details: Vec<SiteDetails> =
                serde_json::from_str(&loaded_json.to_string()).unwrap();
            let mut sites_json: Option<SiteDetails> = None;
            for site in site_details {
                if site.id.clone().unwrap_or_else(|| "".to_string()) == site_id {
                    sites_json = Some(site);
                    break;
                }
            }
            if let Some(ref data) = sites_json {
                Ok(data.clone())
            } else {
                eprintln!("Could not find this site on disk.");
                Err(String::from("Could not find this site on disk."))
            }
        }
        Ok(None) => {
            eprintln!("No sites or JSON on disk to load from!");
            Err(String::from("No sites or JSON on disk to load from!"))
        }
        Err(e) => {
            eprintln!("Failed to load JSON from file: {}", e);
            Err(String::from(format!(
                "Failed to load JSON from file: {}",
                e
            )))
        }
    }
}
