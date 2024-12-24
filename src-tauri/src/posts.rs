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

    pub fn read(&self, site_id: &str, post_id: u64) -> Result<Option<Post>> {
        let mut stmt = self.conn.prepare(
            "SELECT title, header_image, date, content, post_id, site_id FROM posts WHERE site_id = ?1 AND post_id = ?2"
        )?;

        stmt.query_row(params![site_id, post_id], |row| {
            Ok(Post {
                title: row.get(0)?,
                image: row.get(1)?,
                date: row.get(2)?,
                content: row.get(3)?,
                tags: vec![],            // Load from tags table in future
                filename: String::new(), // Generate from title when needed
                post_id: row.get(4)?,
                site_id: row.get(5)?,
            })
        })
        .optional()
    }

    pub fn update(&self, post: &Post, site_id: &str) -> Result<()> {
        println!("Updating post: {} for site {}", post.post_id, site_id);
        self.conn.execute(
            "UPDATE posts SET title = ?1, header_image = ?2, content = ?3
             WHERE site_id = ?4 and post_id = ?5",
            params![post.title, post.image, post.content, site_id, post.post_id],
        )?;
        Ok(())
    }

    pub fn delete(&self, site_id: &str, post_id: u64) -> Result<()> {
        self.conn.execute(
            "DELETE FROM posts WHERE site_id = ?1 and post_id = ?2",
            params![site_id, post_id],
        )?;
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
                tags: vec![],            // Load from tags table in future
                filename: String::new(), // Generate from title when needed
                post_id: row.get(4)?, // post Id and site Id don't matter here, won't be getting this
                site_id: row.get(5)?, // shit from disk anymore
            })
        })?;

        let mut posts = Vec::new();
        for post in posts_iter {
            posts.push(post?);
        }

        Ok(posts)
    }

    pub fn get_recent_posts(&self, site_id: &str, limit: i32) -> Result<Vec<Post>> {
        let mut stmt = self.conn.prepare(
            "SELECT title, date, content, header_image, post_id, site_id
             FROM posts
             WHERE site_id = ?1
             ORDER BY date DESC
             LIMIT ?2",
        )?;

        let posts = stmt.query_map(params![site_id, limit], |row| {
            Ok(Post {
                title: row.get(0)?,
                date: row.get(1)?,
                content: row.get(2)?,
                image: row.get(3)?,
                tags: vec![], // Tags would need a separate table/query
                filename: String::new(),
                post_id: row.get(4)?, // post Id and site Id don't matter here, won't be getting this
                site_id: row.get(5)?, // shit from disk anymore
            })
        })?;

        let mut results = Vec::new();
        for post in posts {
            results.push(post?);
        }

        Ok(results)
    }

    pub fn get_post_count(&self, site_id: &str) -> Result<i64> {

        let mut stmt = self.conn.prepare(
         "SELECT COUNT(*) FROM posts WHERE site_id = ?"
        )?;

        let counts = stmt.query_map(params![site_id], |row| {
            Ok(row.get(0)?)
        })?;

        let mut result: i64 = 0;
        for count in counts {
            result = count?;
        }

        Ok(result)
    }
}
