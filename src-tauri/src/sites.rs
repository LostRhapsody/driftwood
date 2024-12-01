/// CRUD operations for the sites table
use crate::{db::DB_PATH, driftwood::SiteDetails};
use rusqlite::{params, Connection, OptionalExtension, Result};
use std::path::Path;

pub struct SiteRepository {
    conn: Connection,
}

impl SiteRepository {
    pub fn new() -> Result<Self> {
        let conn = Connection::open(Path::new(DB_PATH))?;
        Ok(Self { conn })
    }

    pub fn create(&self, site: &SiteDetails) -> Result<()> {
        self.conn.execute(
            "INSERT INTO sites (
               name, domain, id, ssl, url, screenshot_url,
               password, required, favicon
           ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                site.name,
                site.domain,
                site.id,
                site.url,
                site.screenshot_url,
                site.favicon,
            ],
        )?;
        Ok(())
    }

    pub fn read(&self, site_id: &str) -> Result<Option<SiteDetails>> {
        let mut stmt = self.conn.prepare(
            "SELECT name, domain, id, url, screenshot_url, favicon
            FROM sites WHERE id = ?1",
        )?;

        let site = stmt
            .query_row(params![site_id], |row| {
                Ok(SiteDetails {
                    name: row.get(0)?,
                    domain: row.get(1)?,
                    id: row.get(2)?,
                    url: row.get(3)?,
                    screenshot_url: row.get(4)?,
                    favicon: row.get(5)?,
                    favicon_path: None,
                    ssl: None,
                    password: None,
                    required: None,
                })
            })
            .optional()?;

        Ok(site)
    }

    pub fn update(&self, site: &SiteDetails) -> Result<()> {
        self.conn.execute(
            "UPDATE sites SET
               name = ?1, domain = ?2, url = ?3, screenshot_url = ?4, favicon = ?5
            WHERE id = ?6",
            params![
                site.name,
                site.domain,
                site.url,
                site.screenshot_url,
                site.favicon,
                site.id,
            ],
        )?;
        Ok(())
    }

    pub fn delete(&self, site_id: &str) -> Result<()> {
        self.conn
            .execute("DELETE FROM sites WHERE id = ?1", params![site_id])?;
        Ok(())
    }

    pub fn list_all(&self) -> Result<Vec<SiteDetails>> {
        let mut stmt = self.conn.prepare(
            "SELECT name, domain, id, url, screenshot_url, favicon
            FROM sites",
        )?;

        let sites_iter = stmt.query_map([], |row| {
            Ok(SiteDetails {
                name: row.get(0)?,
                domain: row.get(1)?,
                id: row.get(2)?,
                url: row.get(3)?,
                screenshot_url: row.get(4)?,
                ssl: None,
                password: None,
                required: None,
                favicon: row.get(5)?,
                favicon_path: None,
            })
        })?;

        let mut sites = Vec::new();
        for site in sites_iter {
            sites.push(site?);
        }

        Ok(sites)
    }

    pub fn refresh_sites(mut self, netlify_sites: Vec<SiteDetails>) -> Result<()> {
        // Start a transaction for atomicity
        let tx = self.conn.transaction()?;

        for site in netlify_sites {
            let site_id = match &site.id {
                Some(id) => id,
                None => continue, // Skip sites without IDs
            };

            tx.execute(
                "INSERT INTO sites (
                  name, domain, id, url, screenshot_url, favicon
              ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
              ON CONFLICT(id) DO UPDATE SET
                  name = ?1, domain = ?2, url = ?4, screenshot_url = ?5",
                params![
                    site.name,
                    site.domain,
                    site_id,
                    site.url,
                    site.screenshot_url,
                    site.favicon,
                ],
            )?;
        }

        // Commit the transaction
        tx.commit()?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_site() -> SiteDetails {
        SiteDetails {
            name: Some("Test Site".to_string()),
            domain: Some("test.com".to_string()),
            id: Some("test123".to_string()),
            ssl: Some(true),
            url: Some("https://test.com".to_string()),
            screenshot_url: None,
            password: None,
            required: Some(vec!["file1.html".to_string()]),
            favicon: None,
            favicon_path: None,
        }
    }

    #[test]
    fn test_crud_operations() -> Result<()> {
        let repo = SiteRepository::new()?;
        let site = create_test_site();

        // Test Create
        repo.create(&site)?;

        // Test Read
        let read_site = repo.read(site.id.as_ref().unwrap())?.unwrap();
        assert_eq!(read_site.name, site.name);

        // Test Update
        let mut updated_site = site.clone();
        updated_site.name = Some("Updated Site".to_string());
        repo.update(&updated_site)?;

        // Test Delete
        repo.delete(site.id.as_ref().unwrap())?;
        assert!(repo.read(site.id.as_ref().unwrap())?.is_none());

        Ok(())
    }
}
