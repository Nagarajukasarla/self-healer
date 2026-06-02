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


INSERT INTO locators (
    key_name,
    primary_locator,
    html_snippet,
    metadata
)
VALUES

(
    'products.list.first_product_item',

    '{
        "type": "id",
        "value": "product-card-1"
    }'::jsonb,

    '<a id=''product-card-1'' data-testid=''product-card-1'' class=''group flex flex-col w-full bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg'' href=''/product/1'' data-discover=''true''><div class=''relative aspect-square w-full rounded-2xl overflow-hidden bg-brand-gray flex items-center justify-center''><img alt=''T-Shirt with Tape Details'' data-testid=''product-image-1'' src=''...''/></div><div class=''flex flex-col mt-4 px-1 pb-2''><h3 class=''text-base md:text-lg font-bold text-brand-black truncate group-hover:text-brand-darkGray transition-colors duration-200'' data-testid=''product-title-1''>T-Shirt with Tape Details</h3><div class=''flex items-center gap-2.5 mt-2.5'' data-testid=''product-price-1''><span class=''text-xl md:text-2xl font-bold text-brand-black''>$120</span></div></div></a>',

    '{
        "tag": "a",
        "text": "T-Shirt with Tape Details",
        "attributes": {
            "id": "product-card-1",
            "data-testid": "product-card-1",
            "href": "/product/1"
        },
        "parent": {
            "tag": "div",
            "id": "products-grid",
            "data-testid": "products-grid"
        },
        "children": [
            {
                "tag": "img",
                "data-testid": "product-image-1",
                "alt": "T-Shirt with Tape Details"
            },
            {
                "tag": "h3",
                "data-testid": "product-title-1",
                "text": "T-Shirt with Tape Details"
            },
            {
                "tag": "div",
                "data-testid": "product-rating-1"
            },
            {
                "tag": "div",
                "data-testid": "product-price-1"
            }
        ]
    }'::jsonb
),

(
    'product.details.add_to_cart_button',

    '{
        "type": "id",
        "value": "add-to-cart-btn"
    }'::jsonb,

    '<button id=''add-to-cart-btn'' data-testid=''add-to-cart-btn'' class=''flex-1 py-4 bg-brand-black text-white hover:bg-brand-black/90 font-bold rounded-full transition-colors text-center text-sm''>Add to Cart</button>',

    '{
        "tag": "button",
        "text": "Add to Cart",
        "attributes": {
            "id": "add-to-cart-btn",
            "data-testid": "add-to-cart-btn"
        },
        "parent": {
            "tag": "div",
            "class": "flex items-stretch gap-5 mt-2"
        },
        "siblings": [
            {
                "tag": "div",
                "data-testid": "quantity-counter"
            }
        ],
        "relatedElements": [
            {
                "tag": "button",
                "id": "quantity-decrement",
                "data-testid": "quantity-decrement",
                "aria-label": "Decrease quantity"
            },
            {
                "tag": "button",
                "id": "quantity-increment",
                "data-testid": "quantity-increment",
                "aria-label": "Increase quantity"
            },
            {
                "tag": "span",
                "data-testid": "quantity-value",
                "text": "1"
            }
        ]
    }'::jsonb
),

(
    'product.details.feedback_message',

    '{
        "type": "id",
        "value": "cart-feedback-message"
    }'::jsonb,

    '<div id=''cart-feedback-message'' data-testid=''cart-feedback-message'' class=''mt-3 text-xs font-bold text-center bg-emerald-50 text-emerald-600 p-3.5 rounded-xl border border-emerald-200''>Added 1 item(s) to cart successfully!</div>',

    '{
        "tag": "div",
        "text": "Added 1 item(s) to cart successfully!",
        "attributes": {
            "id": "cart-feedback-message",
            "data-testid": "cart-feedback-message"
        },
        "parent": {
            "tag": "div",
            "class": "flex flex-col gap-5 md:gap-6"
        },
        "siblings": [
            {
                "tag": "button",
                "id": "add-to-cart-btn",
                "data-testid": "add-to-cart-btn",
                "text": "Add to Cart"
            },
            {
                "tag": "div",
                "data-testid": "quantity-counter"
            }
        ],
        "relatedElements": [
            {
                "tag": "h1",
                "data-testid": "product-details-title",
                "text": "T-Shirt with Tape Details"
            },
            {
                "tag": "span",
                "data-testid": "quantity-value",
                "text": "1"
            }
        ]
    }'::jsonb
),

(
    'navbar.cart_button_link',

    '{
        "type": "id",
        "value": "navbar-cart-link"
    }'::jsonb,

    '<a id=''navbar-cart-link'' data-testid=''navbar-cart-link'' class=''relative text-brand-black hover:opacity-80 transition-opacity'' aria-label=''View Cart'' href=''/cart'' data-discover=''true''><svg>...</svg><span id=''cart-badge-count'' data-testid=''cart-badge-count'' class=''absolute -top-1.5 -right-1.5 bg-brand-red text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse''></span></a>',

    '{
        "tag": "a",
        "text": "35",
        "attributes": {
            "id": "navbar-cart-link",
            "data-testid": "navbar-cart-link",
            "href": "/cart",
            "aria-label": "View Cart"
        },
        "parent": {
            "tag": "div",
            "class": "flex items-center gap-3.5 md:gap-4.5"
        },
        "children": [
            {
                "tag": "svg"
            },
            {
                "tag": "span",
                "id": "cart-badge-count",
                "data-testid": "cart-badge-count"
            }
        ]
    }'::jsonb
),

(
    'cart.order-summary.go_to_checkout',

    '{
        "type": "id",
        "value": "checkout-btn"
    }'::jsonb,

    '<button id=''checkout-btn'' data-testid=''checkout-btn'' class=''w-full py-4 bg-brand-black text-white hover:bg-brand-black/90 font-bold rounded-full text-center text-sm transition-colors mt-2''>Go to Checkout</button>',

    '{
        "tag": "button",
        "text": "Go to Checkout",
        "attributes": {
            "id": "checkout-btn",
            "data-testid": "checkout-btn",
            "class": "w-full py-4 bg-brand-black text-white hover:bg-brand-black/90 font-bold rounded-full text-center text-sm transition-colors mt-2"
        },
        "parent": {
            "tag": "aside",
            "id": "order-summary-panel",
            "data-testid": "order-summary-panel"
        },
        "siblings": [
            {
                "tag": "form",
                "id": "promo-form",
                "data-testid": "promo-form"
            }
        ]
    }'::jsonb
);