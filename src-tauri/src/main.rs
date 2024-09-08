// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod netlify;
pub mod crypto;
pub mod commands;

use dotenv::dotenv;
use crate::commands::{
    list_sites,
    netlify_login,
    check_token,
};

fn main() {
    dotenv().ok();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            netlify_login,
            list_sites,
            check_token,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
