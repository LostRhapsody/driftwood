use crate::{db::DB_PATH, driftwood::Post};
use rusqlite::{params, Connection, OptionalExtension, Result};
use std::path::Path;

pub struct PostRepository {
    conn: Connection,
}

impl PostRepository {
    pub fn new() -> Result<Self> {
        let conn = Connection::open(Path::new(DB_PATH))?;
        Ok(Self { conn })
    }

    pub fn create(&self, post: &Post, site_id: &str) -> Result<()> {
        self.conn.execute(
            "INSERT INTO posts (title, site_id, header_image, date, content)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![post.title, site_id, post.image, post.date, post.content],
        )?;
        Ok(())
    }

    pub fn read(&self, post_id: &str) -> Result<Option<Post>> {
        let mut stmt = self.conn.prepare(
            "SELECT title, header_image, date, content, post_id, site_id FROM posts WHERE id = ?1"
        )?;

        stmt.query_row(params![post_id], |row| {
            Ok(Post {
                title: row.get(0)?,
                image: row.get(1)?,
                date: row.get(2)?,
                content: row.get(3)?,
                tags: vec![], // Load from tags table in future
                filename: String::new(), // Generate from title when needed
                post_id: row.get(4)?, // post Id and site Id don't matter here, won't be getting this
                site_id: row.get(5)?,  // shit from disk anymore
            })
        }).optional()
    }

    pub fn update(&self, post: &Post, post_id: &str) -> Result<()> {
        self.conn.execute(
            "UPDATE posts SET title = ?1, header_image = ?2, content = ?3
             WHERE id = ?4",
            params![post.title, post.image, post.content, post_id],
        )?;
        Ok(())
    }

    pub fn delete(&self, post_id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM posts WHERE id = ?1", params![post_id])?;
        Ok(())
    }

    pub fn list_all(&self, site_id: &str) -> Result<Vec<Post>> {
        let mut stmt = self.conn.prepare(
            "SELECT title, header_image, date, content, post_id, site_id FROM posts WHERE site_id = ?1"
        )?;

        let posts_iter = stmt.query_map(params![site_id], |row| {
            Ok(Post {
                title: row.get(0)?,
                image: row.get(1)?,
                date: row.get(2)?,
                content: row.get(3)?,
                tags: vec![], // Load from tags table in future
                filename: String::new(), // Generate from title when needed
                post_id: row.get(4)?, // post Id and site Id don't matter here, won't be getting this
                site_id: row.get(5)?,  // shit from disk anymore
            })
        })?;

        let mut posts = Vec::new();
        for post in posts_iter {
            posts.push(post?);
        }

        Ok(posts)
    }
}