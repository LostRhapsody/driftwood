/// db.rs, responsible for building and interacting with the local sqlite3 database
use rusqlite::{Connection, Result};

pub const DB_PATH: &str = "drift.db";

pub fn initialize_database() -> Result<()> {
    let conn = Connection::open(DB_PATH)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT,
      ssl BOOLEAN DEFAULT FALSE,
      url TEXT,
      screenshot_url TEXT,
      password TEXT,
      required TEXT,
      favicon TEXT
    )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS posts (
      site_id TEXT NOT NULL,
      post_id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      header_image BLOB,
      date TEXT,
      content TEXT,
      excerpt TEXT,
      FOREIGN KEY(site_id) REFERENCES sites(id)
    )",
        [],
    )?;

    // Note used yet
    // token_issued_at, expires_at, last_login, and created_at are all UNIX timestamps
    // settings blob is a JSON blob/string, username is optional
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      netlify_token TEXT NOT NULL,
      token_issued_at INTEGER,
      token_expires_at INTEGER,
      last_login INTEGER,
      created_at INTEGER NOT NULL,
      settings BLOB
    );",
        [],
    )?;

    // rename_field()?;

    Ok(())
}