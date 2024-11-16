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
          favicon_file TEXT
      )",
      [],
  )?;

  conn.execute(
    "CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        site_id TEXT NOT NULL,
        header_image BLOB,
        date TEXT,
        content TEXT
    )",
    [],
  )?;

  Ok(())
}