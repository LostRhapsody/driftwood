// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod netlify;
pub mod crypto;
pub mod commands;
pub mod driftwood;

use dotenv::dotenv;
use crate::commands::{
    list_sites,
    netlify_login,
    netlify_logout,
    check_token,
    create_site,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().ok();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            netlify_login,
            netlify_logout,
            list_sites,
            check_token,
            create_site,
        ])
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
