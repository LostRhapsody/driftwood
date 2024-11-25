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
        post_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        header_image BLOB,
        date TEXT,
        content TEXT,
        FOREIGN KEY(site_id) REFERENCES sites(id),
        PRIMARY KEY (site_id, post_id)
    )",
    [],
  )?;

  rename_field()?;

  Ok(())
}

// renames a field, retain as support for older dbs, but can remove it later
pub fn rename_field() -> Result<()> {
  let conn = Connection::open(DB_PATH)?;

  conn.execute(
      "ALTER TABLE sites RENAME COLUMN favicon_file TO favicon",
      [],
  )?;

  Ok(())
}