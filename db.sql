-- SQL Commands for setting up the locators database

-- 1. Create Database (Execute this on your PostgreSQL server first)
-- CREATE DATABASE locators;

-- 2. Create the Table to store locators
CREATE TABLE IF NOT EXISTS locators (
  id SERIAL PRIMARY KEY,

  page_name VARCHAR(200) NOT NULL,

  locators JSONB NOT NULL,

  metadata JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Seed locators for the Home Page tests
INSERT INTO locators (key_name, locator_type, locator_value, page_name, description)
VALUES 
  ('headline', 'css', 'h1.headline', 'home', 'The main page title/headline'),
  ('button', 'css', 'button#regular-btn', 'home', 'A regular button for visibility and click checks'),
  ('toggle_button', 'css', 'button#toggle-btn', 'home', 'A toggle button that changes its state and text on click'),
  ('dropdown', 'css', 'select#my-dropdown', 'home', 'A dropdown element for options selection')
ON CONFLICT (key_name) 
DO UPDATE SET 
  locator_type = EXCLUDED.locator_type,
  locator_value = EXCLUDED.locator_value,
  page_name = EXCLUDED.page_name,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;
