/// Handles all communication between front and backend
use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Stores the response from the server
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Response {
    pub result: Option<bool>,
    pub status: Option<u32>,
    pub message: Option<String>,
    pub body: Option<Value>,
}

/// Stores response data for the create site operation
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CreateSiteResponse {
    pub name: Option<String>,
    pub title: Option<String>,
}

impl Response {
    /// Returns a standard, successful response for an operation
    ///
    /// # Arguments
    ///
    /// * `message` - A string holding a relevant response message
    ///
    /// # Returns
    ///
    /// A new Response struct containing a true, 200 status, and a message
    pub fn success(message: String) -> Response {
        Response {
            result: Some(true),
            status: Some(200),
            message: Some(message),
            body: None,
        }
    }

    /// Returns a standard, failed response for an operation
    ///
    /// # Arguments
    ///
    /// * `message` - A string holding a relevant response message
    ///
    /// # Returns
    ///
    /// A new Response struct containing a false, 500 status, and a message
    pub fn fail(message: String) -> Response {
        Response {
            result: Some(false),
            status: Some(500),
            message: Some(message),
            body: None,
        }
    }
}
