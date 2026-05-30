-- SQL Commands for setting up the locators database

-- 1. Create Database (Execute this on your PostgreSQL server first)
-- CREATE DATABASE locators;

-- 2. Create the Table to store locators
CREATE TABLE IF NOT EXISTS locators (
  id SERIAL PRIMARY KEY,

  key_name VARCHAR(200) NOT NULL,

  primary_locator JSONB NOT NULL,

--  fallbacks JSONB,
  
  html_snippet TEXT NOT NULL,

  metadata JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO locators (
    key_name,
    primary_locator,
    html_snippet,
    metadata
)
VALUES
(
    'home.hero.shop_now_button',

    '{
        "type": "xpath",
        "value": "//a[@id=''hero-cta'']"
    }'::jsonb,

    '<a id=''hero-cta'' data-testid=''hero-cta'' class=''w-full sm:w-fit px-12 py-4 bg-brand-black text-white hover:bg-brand-black/90 font-bold rounded-full text-center text-base transition-colors'' href=''/shop'' data-discover=''true''>Shop Now</a>',

    '{
        "text": "Shop Now",
        "attributes": {
            "id": "hero-cta",
            "class": "w-full sm:w-fit px-12 py-4 bg-brand-black text-white hover:bg-brand-black/90 font-bold rounded-full text-center text-base transition-colors",
            "dataTestId": "hero-cta"
        },
        "hierarchy": {
            "parent": "div.flex.flex-col.gap-6.md:gap-8.max-w-xl",
            "grandParent": "section"
        },
        "siblings": {
            "left": [
                "Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style."
            ],
            "right": [
                "200+",
                "2,000+",
                "30,000+"
            ]
        }
    }'::jsonb
),

(
    'products.list',

    '{
        "type": "xpath",
        "value": "//div[@id=''products-grid'']"
    }'::jsonb,

    '<div id=''products-grid'' data-testid=''products-grid'' class=''grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10''></div>',

    '{
        "attributes": {
            "id": "products-grid",
            "class": "grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10",
            "dataTestId": "products-grid"
        },
        "hierarchy": {
            "parent": "main.flex-1.w-full",
            "grandParent": "body"
        },
        "siblings": {
            "left": [
                "All Products",
                "Showing 1-6 of 10 Products",
                "Filters",
                "Sort by:"
            ],
            "right": [
                "pagination-container",
                "Previous",
                "Next"
            ]
        }
    }'::jsonb
);