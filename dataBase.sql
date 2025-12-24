
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  firstname VARCHAR(50),
  lastname VARCHAR(50),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, 
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS wishlists (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  list_title VARCHAR(255) NOT NULL,
  is_private BOOLEAN DEFAULT TRUE, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS wishlist_items (
  id SERIAL PRIMARY KEY,
  wishlist_id INT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  item_title VARCHAR(255) NOT NULL,
  price NUMERIC(10,2),
  product_link TEXT,
  bought BOOLEAN DEFAULT FALSE,
  bought_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


/* Dummy data */ 

-- USERS
INSERT INTO users (username, firstname, lastname, email, pass_hash)
VALUES 
('liam.99', 'Liam', 'Joh', 'jon@example.com', 'hashed_password'),
('isac.i98', 'Isac', 'Bara', 'sam@example.com', 'hashed_password');

-- WISHLISTS
INSERT INTO wishlists (user_id, list_title, is_private)
VALUES 
(1, 'Tech Stuff', FALSE),
(1, 'Home Stuff', FALSE),
(2, 'Birthday', FALSE),
(2, 'Hobby', FALSE);

-- WISHLIST ITEMS
INSERT INTO wishlist_items (wishlist_id, item_title, price, product_link)
VALUES 
(1, 'MacBook Pro', 24999.00, 'https://apple.com/macbook-pro'),
(2, 'Apple Watch', 3999.00, 'https://apple.com/apple-watch'),
(3, 'PC', 24999.00, 'https://elgiganten.com/pc'),
(4, 'Headset', 3399.00, 'https://power.com/headset');


SELECT * FROM wishlists;
SELECT * FROM wishlist_items;
