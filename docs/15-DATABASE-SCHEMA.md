# Database Schema v1.0

## Core Tables

### 1. profiles

Purpose

Store administrator profile information.

Fields

- id
- full_name
- email
- phone
- avatar_url
- role
- created_at
- updated_at

---

### 2. categories

Fields

- id
- name
- slug
- description
- image_url
- is_active
- sort_order
- seo_title
- seo_description
- created_at
- updated_at

---

### 3. products

Fields

- id
- category_id
- name
- slug
- sku
- short_description
- description
- price
- discount_price
- stock_quantity
- brand
- gender
- fabric
- featured
- new_arrival
- status
- seo_title
- seo_description
- created_at
- updated_at

---

### 4. product_images

Fields

- id
- product_id
- image_url
- display_order
- created_at

---

### 5. banners

Fields

- id
- title
- subtitle
- image_url
- button_text
- button_link
- is_active
- created_at

---

### 6. offers

Fields

- id
- title
- description
- discount_percentage
- banner_image
- start_date
- end_date
- is_active

---

### 7. orders

Fields

- id
- order_number
- customer_name
- customer_phone
- customer_email
- delivery_address
- order_status
- payment_method
- subtotal
- delivery_charge
- total
- notes
- created_at

---

### 8. order_items

Fields

- id
- order_id
- product_id
- quantity
- unit_price
- subtotal

---

Future Tables

customers

wishlist

reviews

payments

couriers

analytics

END
