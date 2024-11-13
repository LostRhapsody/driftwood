// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod commands;
pub mod crypto;
pub mod driftwood;
pub mod netlify;
pub mod response;

use crate::commands::{
    check_token, create_site, get_site_details, list_sites, netlify_login, netlify_logout,
    refresh_sites, update_site,create_post, deploy_site, get_post_list, delete_site, get_post_details,
};
use dotenv::dotenv;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().ok();

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
        ])
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
