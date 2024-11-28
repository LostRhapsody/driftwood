use crate::driftwood::{read_and_parse, template_html, NewSite, Post, SiteDetails};
use crate::netlify::Netlify;
use crate::response::{
    CreateSiteResponse, // Request,
    Response,
};
use crate::sites::SiteRepository;
use serde::{Deserialize, Serialize};
use crate::posts::PostRepository;
use std::path::Path;

/// TODO clone and refactor load_posts_from_disk to load_post_from_disk, iterate through dir, don't read through the files until a specific file is found
/// TODO in edit post screen, add field for image, tags, and create a way to extract an excerpt from the post's contents.
/// TODO - label post file names with IDs so they are unique

// This is like the post struct from driftwood.rs, but
// is strictly for serializing the json from the client.
#[derive(Serialize, Deserialize, Debug)]
struct PostData {
    post_name: String,
    post_text: String,
}

#[tauri::command]
pub fn netlify_login() -> Response {
    println!("Logging in");
    let netlify = Netlify::new();
    match netlify {
        Ok(_) => Response::success(String::from("Logged in")),
        Err(_) => Response::success(String::from("Logged in")),
    }
}

#[tauri::command]
pub fn netlify_logout() -> Response {
    println!("Logging out");
    let token_file = Path::new("netlify_token.json");
    match token_file.exists() {
        true => match std::fs::remove_file(token_file) {
            Ok(_) => Response::success(String::from(
                "Logged out and removed user data from the system.",
            )),
            Err(_) => Response::fail(String::from(
                "Logged out, but failed to remove user data from system.",
            )),
        },
        false => Response::fail(String::from("Could not log out.")),
    }
}

/// TODO -  Store token in a record
#[tauri::command]
pub fn check_token() -> Response {
    println!("Checking token");
    let token_file = Path::new("netlify_token.json");
    match token_file.exists() {
        true => Response::success(String::from("Has token.")),
        false => Response::fail(String::from("Does not have token.")),
    }
}

#[tauri::command]
pub fn create_site(new_site: &str) -> Response {
    println!("Creating a site");
    println!("new site args: {}", new_site);

    let site: NewSite = serde_json::from_str(new_site)
        .map_err(|e| e.to_string())
        .expect("create_site requires site data from client.");
    let netlify = Netlify::new()
        .map_err(|e| e.to_string())
        .expect("Failed to create a netlify client.");

    match netlify.create_site(site.clone()) {
        Ok(site_details) => {
            refresh_sites(false);

            let create_site_response = CreateSiteResponse {
                name: site_details.name,
                title: Some(String::from("Created")),
            };

            Response {
                result: Some(true),
                status: Some(200),
                message: Some(String::from(
                    "New site created successfully! 🎉 Let's start building!",
                )),
                body: Some(
                    serde_json::to_value(create_site_response)
                        .expect("Tried to serialize create site response in create_site"),
                ),
            }
        }
        Err(err) => {
            let create_site_response = CreateSiteResponse {
                name: None,
                title: Some(String::from("Failed to create site")),
            };

            Response {
                result: Some(false),
                status: Some(500),
                message: Some(err.to_string()),
                body: Some(
                    serde_json::to_value(create_site_response)
                        .expect("Tried to serialize create site response in create_site"),
                ),
            }
        }
    }
}

#[tauri::command]
pub fn delete_site(site_id: &str) -> Response {
    println!("Deleting site: {}", site_id);

    let netlify = Netlify::new()
        .map_err(|e| e.to_string())
        .expect("Failed to create netlify client in delete_site");

    match netlify.delete_site(site_id) {
        Ok(_site_details) => {
            refresh_sites(false);
            Response::success(String::from("Site deleted!"))
        }
        Err(err) => Response::fail(err.to_string()),
    }
}

#[tauri::command]
pub fn update_site(site: &str) -> Response {
    println!("Updating a site");
    println!("Updated site args: {}", site);

    let mut site: SiteDetails = serde_json::from_str(site)
        .map_err(|e| e.to_string())
        .expect("Need site details from client, in update_site");
    let netlify = Netlify::new()
        .map_err(|e| e.to_string())
        .expect("Failed to create netlify client in site_details.");

    match netlify.update_site(site.clone()) {
        Ok(_site_details) => {
            refresh_sites(false);
            let favicon_path = site.clone().favicon_path.unwrap_or_default();
            if favicon_path != "" {
                site.set_favicon(&favicon_path)
                    .expect("Tried saving new favicon file, failed.");
            }
            Response::success(String::from("Site updated successfully! 🎉"))
        }
        Err(err) => Response::fail(err.to_string()),
    }
}

#[tauri::command]
pub fn refresh_sites(return_site: bool) -> Response {
    println!("Refreshing sites");
    match Netlify::new() {
        Ok(netlify) => {
            println!("Netlify instance created");
            let site_details: Vec<SiteDetails> = get_sites(netlify);
            let mut sites_json = Vec::new();

            // update sites in database
            let site_repo = SiteRepository::new().expect("Failed to init site repository in refresh_sites");

            if let Err(e) = site_repo.refresh_sites(site_details.clone()) {
                eprintln!("Failed to insert site data into database: {}", e);
            }

            if return_site {

                // create JSON to send back to client
                for site in site_details {
                    sites_json.push(
                        serde_json::to_value(site)
                            .expect("Failed to serialize site data in refresh_sites"),
                    );
                }

                Response {
                    result: Some(true),
                    status: Some(200),
                    message: Some(String::from("Refreshed sites")),
                    body: Some(
                        serde_json::to_value(sites_json)
                            .expect("Failed to serialize site array in refresh_sites"),
                    ),
                }
            } else {
                Response::success(String::from("Refreshed sites"))
            }
        }
        Err(e) => {
            println!("Error: {:?}", e);
            Response::fail(e.to_string())
        }
    }
}

#[tauri::command]
pub fn get_site_details(site_id: String) -> Response {
    println!("Getting details for site {}", site_id);

    match read_site(site_id){
        Ok(Some(site)) => {
            let mut response = Response::success(String::from("Retrieved site details"));
            response.body = Some(
                serde_json::to_value(site)
                    .expect("Failed to serialize SiteDetails in get_site_details"),
            );
            response
        },
        Ok(None) => Response::success(String::from("No site by that ID found in database")),
        Err(e) => Response::fail(format!("Error reading site details from db: {}", e )),
    }
}

#[tauri::command]
pub fn list_sites() -> Response {
    println!("Listing sites");

    // init site repo and load sites
    let site_repo = SiteRepository::new().expect("Failed to init site repository in refresh_sites");
    match site_repo.list_all() {
        Ok(site_details_vec) => {
            let site_json = serde_json::to_value(site_details_vec).expect("Failed to serialized site vector in list_sites");
            let mut response = Response::success(String::from("Refreshed sites"));
            response.body = Some(site_json);
            return response;
        },
        Err(e) => return Response::fail(format!("Failed to retrieve and list sites :{}", e)),
    }
}

/// TODO - we call this to update/create posts, but it does not yet actually update
/// in the DB, just creates new posts over and over again.
#[tauri::command]
pub fn create_post(post_data: String, site_data: String) -> Response {
    println!("Create post, post data: {}", post_data);
    println!("Create post, site data: {}", site_data);

    // init repo to save post in DB
    let post_repo = PostRepository::new().expect("Failed to init post repository in create_post");

    // serialize the post_data into a JSON object for interactivity.
    let post_data: PostData = serde_json::from_str(&post_data).expect("Failed to serialize the post data in create_post");

    // serialize the site_data into a JSON object for interactivity.
    let site_data: SiteDetails = serde_json::from_str(&site_data).expect("Failed to serialize site data in create_post");

    // create a new post
    // date is set automatically
    let mut new_post = Post::new(post_data.post_name);
    // manually set the content
    new_post.content = post_data.post_text;

    // strip bad chars and set post.filename
    let _ = new_post.clean_filename();
    // (replace "-"" with spaces basically) and set post.title
    let _ = new_post.build_post_name();

    // create post in DB
    match post_repo.create(&new_post, &site_data.id.expect("Failed to retrieve site id in create_post")) {
        Ok(()) => {
            println!("Post created in DB");
            Response::success(String::from("success"))
        },
        Err(err) => {
            println!("Failed to create post in DB: {}", err);
            Response::fail(format!("failed to create post: {}", err))
        },
    }
}

/// Retrieves post data so you can edit existing posts
///
/// # Arguments
///
/// * `post_name` a string, the name of the post
/// * `site_id` a string, the ID of the website
///
/// # Returns
///
/// A Drift Reponse struct, the body contains the post data structure
#[tauri::command]
pub fn get_post_details(post_id: u64, site_id: String) -> Response {
    println!(
        "Running get post details for site: {}, post name: {}",
        site_id, post_id
    );

    // init repo to save post in DB
    let post_repo = PostRepository::new().expect("Failed to init post repository in create_post");
    let post = post_repo.read(&site_id, post_id);

    // let post = post.read_post_from_disk(site_id);
    match post {
        Ok(post) => {
            let mut response = Response::success(String::from("Read post from disk"));
            response.body = Some(
                serde_json::to_value(post)
                    .expect("Failed to serialize Post to JSON in get_post_details"),
            );
            response
        }
        Err(e) => Response::fail(format!("Failed to read post from disk: {}", e)),
    }
}

#[tauri::command]
pub fn deploy_site(site_id: String) -> Response {
    match Netlify::new() {
        Ok(netlify) => {
            let site = read_site(site_id)
                .expect("Failed to read site details from DB (result) in deploy_site")
                .expect("Failed to read site details from DB (option) in deploy_site");
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
                return Response::fail(String::from(
                    "Failed to delete site, error in response from Netlify",
                ));
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

            Response::success(String::from("Deployed site successfully! 🚀"))
        }
        Err(e) => Response::fail(format!("Failed to deploy site: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn get_post_list(site_id: String) -> Response {

    let post_repo = PostRepository::new().expect("Failed to init post repository in create_post");
    let posts = post_repo.list_all(&site_id);

    match posts {
        Ok(posts) => {
            let mut response = Response::success(String::from("Retrieved sites"));
            response.body = Some(
                serde_json::to_value(posts)
                    .expect("Attempted to serialize vector of posts in get_post_list"),
            );
            response
        }
        Err(err) => Response::fail(format!("Error retreiving posts: {}", err)),
    }
}

#[tauri::command]
pub fn delete_post(site_id: String, post_name: String) -> Response {
    println!("Deleting post {} for site {}", post_name, site_id);
    let mut post = Post::new(post_name);
    let _ = post.clean_filename();
    println!("Post filename: {}", post.filename);
    match read_site(site_id) {
        Ok(Some(site)) => {
            let site_path = site.build_site_path().expect("Failed to build site path");

            let post_path = site_path
                .join("md_posts")
                .join(format!("{}.md", post.filename));

            match std::fs::remove_file(post_path) {
                Ok(_) => Response::success(String::from("Post deleted successfully")),
                Err(e) => Response::fail(format!("Failed to delete post: {}", e)),
            }
        }
        Ok(None) => Response::fail(String::from("Failed to get site details, nothing was returned from DB")),
        Err(e) => Response::fail(format!("Failed to get site details: {}", e)),
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


fn read_site(site_id: String) -> Result<Option<SiteDetails>, String> {
    let site_repo = SiteRepository::new()
        .map_err(|e| format!("Failed to initialize site repository: {}", e))?;

    site_repo.read(&site_id)
        .map_err(|e| format!("Database error when reading site {}: {}", site_id, e))
}

fn load_posts_from_disk(site_id: String) -> Result<Vec<Post>, std::io::Error> {
    let site = read_site(site_id)
    .expect("failed to get site details (result) in load_posts_from_disk")
    .expect("failed to get site details (option) in load_posts_from_disk");
    let site_path = site.build_site_path().expect("failed to get site path");
    let post_path = site_path.join("md_posts");
    let mut post_vector: Vec<Post> = vec![];
    if !post_path.exists() {
        println!("checking 1.5");
        return Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            "The site does not contain any posts",
        ));
    }

    for md_post in std::fs::read_dir(post_path)? {
        let md_post = md_post?;
        let path = md_post.path();
        let filename = path
            .file_name()
            .expect("Tried to get file name of post")
            .to_string_lossy()
            .into_owned();
        let file = std::fs::read_to_string(path)?;

        let mut title = String::new();
        let mut date = String::new();
        let mut image = None;
        let mut tags: Vec<String> = vec![];
        let mut content = String::new();
        let mut line_counter = 0;

        for line in file.lines() {
            line_counter += 1;
            match line_counter {
                2 => date = line.trim().replace("date:", ""),
                3 => continue,
                4 => image = Some(line.trim().replace("image:", "")),
                5 => {
                    tags = line
                        .replace("tags:", "")
                        .trim()
                        .split(',')
                        .map(|s| s.trim().to_string())
                        .collect()
                }
                1 => title = line.trim().replace("title:", ""),
                // TODO - We don't actually need content for this one, so break here
                // but, for the single post load function, we'll need to do this.
                _ => content += line.trim(),
            }
        }

        let post = Post {
            title,
            date,
            image,
            filename,
            content,
            tags,
            post_id: 0, // post Id and site Id don't matter here, won't be getting this
            site_id: String::new(),  // shit from disk anymore
        };

        println!("Post data: {:?}", post);

        post_vector.push(post);
    }

    Ok(post_vector)
}
