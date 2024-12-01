// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod commands;
pub mod crypto;
pub mod db;
pub mod driftwood;
pub mod netlify;
pub mod posts;
pub mod response;
pub mod sites;
pub mod users;

use crate::commands::{
    check_token, create_post, create_site, delete_post, delete_site, deploy_site, get_post_details,
    get_post_list, get_site_details, list_sites, netlify_login, netlify_logout, refresh_sites,
    update_post, update_site,
};

use dotenv::dotenv;

use crate::db::initialize_database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().ok();

    if let Err(e) = initialize_database() {
        eprintln!("Database initialization failed: {}", e);
        std::process::exit(1);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            netlify_login,
            netlify_logout,
            list_sites,
            check_token,
            create_site,
            refresh_sites,
            get_site_details,
            update_site,
            create_post,
            deploy_site,
            get_post_list,
            delete_site,
            get_post_details,
            delete_post,
            update_post,
        ])
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
