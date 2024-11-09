/// Handles all communication between front and backend
use serde::{Deserialize, Serialize};

/// Stores the response from the server
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Response {
  pub result: Option<bool>,
  pub status: Option<u32>,
  pub message: Option<String>,
}

/// Stores a request from the client
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Request {
  pub action: String,
  pub args: String,
}