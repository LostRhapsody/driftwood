use crate::netlify::Netlify;
use serde::Serialize;
use tinytemplate::{format_unescaped, TinyTemplate};
use driftwood::SiteDetails;
use std::path::Path;

#[derive(Serialize)]
struct SiteCardContext {
    title: String,
    image: String,
    sitename: String,
    siteid: String,
}

struct NewSite {
    site_name: String,
    custom_domain: String,
    favicon_file: String,
    template: String,
    password_enabled: bool,
    rss_enabled: bool,
    github_enabled: bool,
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
pub fn create_site() -> String {
    println!("Creating a site");
    String::new()
}

#[tauri::command]
pub fn list_sites() -> String {

    println!("Listing sites");

    static SITE_CARD_TEMPLATE: &'static str =
        include_str!("templates/default/site-card-template.html");
    let mut tt_site_card = TinyTemplate::new();
    tt_site_card.set_default_formatter(&format_unescaped);

    match tt_site_card.add_template("site", SITE_CARD_TEMPLATE) {
        Ok(()) => (),
        Err(_) => return String::from("Failed to add template"),
    }

    println!("Added template");

    let mut rendered_site_cards = String::new();

    match Netlify::new() {
        Ok(netlify) => {
            println!("Netlify instance created");
            let site_details: Vec<SiteDetails> = get_sites(netlify);
            for site in site_details {
                let site_name = site.name.unwrap_or_else(|| "".to_string());
                let site_img = site.screenshot_url.unwrap_or_else(|| "https://images.unsplash.com/photo-1615147342761-9238e15d8b96?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1001&q=80".to_string());
                let site_id: String = site.id.unwrap_or_else(|| "".to_string());
                let site_card_context: SiteCardContext = SiteCardContext {
                    title: site_name.clone(),
                    image: site_img,
                    sitename: site_name,
                    siteid: site_id,
                };
                rendered_site_cards.push_str(
                    &tt_site_card
                        .render("site", &site_card_context)
                        .expect("Failed templating the site card links"),
                );
            }
            rendered_site_cards
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
