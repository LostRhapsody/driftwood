use crate::db::DB_PATH;
use crate::netlify::TOKEN_EXPIRATION_DAYS;
use chrono::Utc;
use rusqlite::{params, Connection, OptionalExtension, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub username: Option<String>,
    pub netlify_token: String,
    pub token_issued_at: i64,
    pub token_expires_at: i64,
    pub last_login: i64,
    pub created_at: i64,
    pub settings: Option<String>, // JSON string
}

pub struct UserRepository {
    conn: Connection,
}

impl UserRepository {
    pub fn new() -> Result<Self> {
        let conn = Connection::open(Path::new(DB_PATH))?;
        Ok(Self { conn })
    }

    pub fn create(&self, user: &User) -> Result<()> {
        self.conn.execute(
            "INSERT INTO users (
                id, username, netlify_token, token_issued_at,
                token_expires_at, last_login, created_at, settings
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                user.id,
                user.username,
                user.netlify_token,
                user.token_issued_at,
                user.token_expires_at,
                user.last_login,
                user.created_at,
                user.settings,
            ],
        )?;
        Ok(())
    }

    pub fn read(&self, user_id: &str) -> Result<Option<User>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, username, netlify_token, token_issued_at,
                    token_expires_at, last_login, created_at, settings
             FROM users WHERE id = ?1",
        )?;

        stmt.query_row(params![user_id], |row| {
            Ok(User {
                id: row.get(0)?,
                username: row.get(1)?,
                netlify_token: row.get(2)?,
                token_issued_at: row.get(3)?,
                token_expires_at: row.get(4)?,
                last_login: row.get(5)?,
                created_at: row.get(6)?,
                settings: row.get(7)?,
            })
        })
        .optional()
    }

    /// updates the user's token
    /// Handles updating timestamps automatically
    pub fn update_token(&self, user_id: &str, token: &str) -> Result<()> {
        let issued_at = Utc::now().timestamp();
        let expires_at = issued_at + TOKEN_EXPIRATION_DAYS;
        self.conn.execute(
            "UPDATE users SET
                netlify_token = ?1,
                token_issued_at = ?2,
                token_expires_at = ?3,
                last_login = strftime('%s', 'now')
             WHERE id = ?4",
            params![token, issued_at, expires_at, user_id],
        )?;
        Ok(())
    }

    pub fn update_settings(&self, user_id: &str, settings: &str) -> Result<()> {
        self.conn.execute(
            "UPDATE users SET settings = ?1 WHERE id = ?2",
            params![settings, user_id],
        )?;
        Ok(())
    }

    pub fn delete(&self, user_id: &str) -> Result<()> {
        self.conn
            .execute("DELETE FROM users WHERE id = ?1", params![user_id])?;
        Ok(())
    }

    pub fn get_token(&self, user_id: &str) -> Result<Option<String>> {
        let mut stmt = self.conn.prepare(
            "SELECT netlify_token FROM users WHERE id = ?1
             AND token_expires_at > strftime('%s', 'now')",
        )?;

        stmt.query_row(params![user_id], |row| row.get(0))
            .optional()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    fn create_test_user() -> User {
        User {
            id: String::from("id"),
            username: Some("test_user".to_string()),
            netlify_token: "encrypted_token".to_string(),
            token_issued_at: Utc::now().timestamp(),
            token_expires_at: Utc::now().timestamp() + 3600,
            last_login: Utc::now().timestamp(),
            created_at: Utc::now().timestamp(),
            settings: Some(r#"{"theme":"dark"}"#.to_string()),
        }
    }

    #[test]
    fn test_crud_operations() -> Result<()> {
        let repo = UserRepository::new()?;
        let user = create_test_user();

        // Test Create
        repo.create(&user)?;

        // Test Read
        let read_user = repo.read(&user.id)?.unwrap();
        assert_eq!(read_user.username, user.username);

        // Test Update Token
        let new_token = "new_encrypted_token";
        repo.update_token(&user.id, new_token)?;

        // Test Get Token
        let token = repo.get_token(&user.id)?.unwrap();
        assert_eq!(token, new_token);

        // Test Delete
        repo.delete(&user.id)?;
        assert!(repo.read(&user.id)?.is_none());

        Ok(())
    }
}
