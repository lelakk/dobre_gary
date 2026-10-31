-- Wyekportowane z mariadb i dodane komentarze.
-- Można pominąć create database i użyć innej db, wyszukaj i zamień wszystkie wystąpienia "projekt"

CREATE DATABASE IF NOT EXISTS `projekt`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_520_ci;

USE `projekt`;

-- 1. Tabela użytkowników
CREATE TABLE `users` (
    `user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uq_users_email` (`email`),
    CONSTRAINT `chk_users_email` CHECK (`email` = TRIM(`email`) AND `email` REGEXP '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
    CONSTRAINT `chk_users_password` CHECK (CHAR_LENGTH(TRIM(`password_hash`)) >= 20),
    CONSTRAINT `chk_users_names` CHECK (CHAR_LENGTH(TRIM(`first_name`)) > 0 AND CHAR_LENGTH(TRIM(`last_name`)) > 0),
    CONSTRAINT `chk_users_phone` CHECK (`phone` IS NULL OR (`phone` REGEXP '^[+]?[0-9 ()-]+$' AND CHAR_LENGTH(REGEXP_REPLACE(`phone`, '[^0-9]', '')) BETWEEN 7 AND 15))
) ENGINE=InnoDB;

-- 2. Tabela adresów
CREATE TABLE `addresses` (
    `address_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `recipient_name` VARCHAR(150) NOT NULL,
    `street_line1` VARCHAR(255) NOT NULL,
    `street_line2` VARCHAR(255) NULL,
    `city` VARCHAR(100) NOT NULL,
    `state_province` VARCHAR(100) NOT NULL,
    `postal_code` VARCHAR(20) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`address_id`),
    UNIQUE KEY `uq_addresses_user_address` (`user_id`, `address_id`),
    CONSTRAINT `chk_addresses_required` CHECK (CHAR_LENGTH(TRIM(`recipient_name`)) > 0 AND CHAR_LENGTH(TRIM(`street_line1`)) > 0 AND CHAR_LENGTH(TRIM(`city`)) > 0 AND CHAR_LENGTH(TRIM(`state_province`)) > 0),
    CONSTRAINT `chk_addresses_line2` CHECK (`street_line2` IS NULL OR CHAR_LENGTH(TRIM(`street_line2`)) > 0),
    CONSTRAINT `chk_addresses_postal` CHECK (`postal_code` REGEXP '^[0-9]{2}-[0-9]{3}$'),
    CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Tabela kategorii (hierarchiczna)
CREATE TABLE `categories` (
    `category_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `parent_id` INT UNSIGNED NULL,
    `name` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`category_id`),
    KEY `idx_categories_parent` (`parent_id`),
    CONSTRAINT `chk_categories_name` CHECK (CHAR_LENGTH(TRIM(`name`)) > 0),
    CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) 
        REFERENCES `categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Tabela produktów (zasoby i akcesoria kuchenne)
CREATE TABLE `products` (
    `product_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `brand` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `base_price` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`product_id`),
    UNIQUE KEY `uq_products_sku` (`sku`),
    KEY `idx_products_name` (`name`),
    KEY `idx_products_brand_price` (`brand`, `base_price`),
    KEY `idx_products_price` (`base_price`),
    CONSTRAINT `chk_products_sku` CHECK (`sku` REGEXP '^[A-Za-z0-9][A-Za-z0-9_-]*$'),
    CONSTRAINT `chk_products_names` CHECK (CHAR_LENGTH(TRIM(`name`)) > 0 AND CHAR_LENGTH(TRIM(`brand`)) > 0),
    CONSTRAINT `chk_products_description` CHECK (`description` IS NULL OR CHAR_LENGTH(TRIM(`description`)) > 0),
    CONSTRAINT `chk_products_price` CHECK (`base_price` > 0)
) ENGINE=InnoDB;

-- 5. Tabela łącząca produkty z kategoriami (N:M)
CREATE TABLE `product_categories` (
    `product_id` BIGINT UNSIGNED NOT NULL,
    `category_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`product_id`, `category_id`),
    KEY `idx_pc_category_product` (`category_id`, `product_id`),
    CONSTRAINT `fk_pc_product` FOREIGN KEY (`product_id`) 
        REFERENCES `products` (`product_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pc_category` FOREIGN KEY (`category_id`) 
        REFERENCES `categories` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Tabela stanów magazynowych (jeden stan na produkt)
CREATE TABLE `inventory` (
    `product_id` BIGINT UNSIGNED NOT NULL,
    `quantity` INT NOT NULL DEFAULT 0,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`product_id`),
    KEY `idx_inventory_quantity` (`quantity`),
    CONSTRAINT `chk_inventory_quantity` CHECK (`quantity` >= 0),
    CONSTRAINT `fk_inv_product` FOREIGN KEY (`product_id`) 
        REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Tabela zamówień
CREATE TABLE `orders` (
    `order_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `shipping_address_id` BIGINT UNSIGNED NOT NULL,
    `billing_address_id` BIGINT UNSIGNED NOT NULL,
    `order_status` ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    `total_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`order_id`),
    KEY `idx_orders_user_created` (`user_id`, `created_at`),
    KEY `idx_orders_status_created` (`order_status`, `created_at`),
    KEY `idx_orders_created_at` (`created_at`),
    KEY `idx_orders_shipping_user` (`user_id`, `shipping_address_id`),
    KEY `idx_orders_billing_user` (`user_id`, `billing_address_id`),
    CONSTRAINT `chk_orders_status` CHECK (`order_status` IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
    CONSTRAINT `chk_orders_total` CHECK (`total_amount` >= 0),
    CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
    -- Adres dostawy i rozliczenia musi należeć do kupującego.
    CONSTRAINT `fk_orders_shipping_addr` FOREIGN KEY (`user_id`, `shipping_address_id`)
        REFERENCES `addresses` (`user_id`, `address_id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_orders_billing_addr` FOREIGN KEY (`user_id`, `billing_address_id`)
        REFERENCES `addresses` (`user_id`, `address_id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 8. Tabela pozycji zamówienia
CREATE TABLE `order_items` (
    `order_item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `quantity` INT UNSIGNED NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (`order_item_id`),
    UNIQUE KEY `uq_order_product` (`order_id`, `product_id`),
    KEY `idx_items_product_order` (`product_id`, `order_id`),
    CONSTRAINT `chk_items_quantity` CHECK (`quantity` > 0),
    CONSTRAINT `chk_items_unit_price` CHECK (`unit_price` > 0),
    CONSTRAINT `fk_items_order` FOREIGN KEY (`order_id`) 
        REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_items_product` FOREIGN KEY (`product_id`) 
        REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB; -- temporary cascade until a better fix is implemented

-- 9. Tabela płatności
CREATE TABLE `payments` (
    `payment_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `payment_method` ENUM('credit_card', 'paypal', 'bank_transfer', 'stripe', 'blik') NOT NULL,
    `transaction_reference` VARCHAR(255) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_status` ENUM('initiated', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'initiated',
    `paid_at` TIMESTAMP NULL,
    PRIMARY KEY (`payment_id`),
    UNIQUE KEY `uq_transaction_ref` (`transaction_reference`),
    KEY `idx_payments_order_status` (`order_id`, `payment_status`),
    KEY `idx_payments_status_order` (`payment_status`, `order_id`),
    CONSTRAINT `chk_payments_amount` CHECK (`amount` > 0),
    CONSTRAINT `chk_payments_reference` CHECK (CHAR_LENGTH(TRIM(`transaction_reference`)) > 0),
    CONSTRAINT `chk_payments_method` CHECK (`payment_method` IN ('credit_card', 'paypal', 'bank_transfer', 'stripe', 'blik')),
    CONSTRAINT `chk_payments_status` CHECK (`payment_status` IN ('initiated', 'completed', 'failed', 'refunded')),
    CONSTRAINT `chk_payments_paid_at` CHECK ((`payment_status` IN ('completed', 'refunded') AND `paid_at` IS NOT NULL) OR (`payment_status` IN ('initiated', 'failed') AND `paid_at` IS NULL)),
    CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) 
        REFERENCES `orders` (`order_id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 10. Tabela przesyłek
CREATE TABLE `shipments` (
    `shipment_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `carrier` VARCHAR(100) NOT NULL,
    `tracking_number` VARCHAR(150) NULL,
    `shipment_status` ENUM('label_created', 'in_transit', 'out_for_delivery', 'delivered') NOT NULL DEFAULT 'label_created',
    `shipped_at` TIMESTAMP NULL,
    `delivered_at` TIMESTAMP NULL,
    PRIMARY KEY (`shipment_id`),
    UNIQUE KEY `uq_shipments_tracking` (`tracking_number`),
    KEY `idx_shipments_order` (`order_id`),
    KEY `idx_shipments_status_shipped` (`shipment_status`, `shipped_at`),
    CONSTRAINT `chk_shipments_carrier` CHECK (CHAR_LENGTH(TRIM(`carrier`)) > 0),
    CONSTRAINT `chk_shipments_tracking` CHECK (`tracking_number` IS NULL OR CHAR_LENGTH(TRIM(`tracking_number`)) > 0),
    CONSTRAINT `chk_shipments_status` CHECK (`shipment_status` IN ('label_created', 'in_transit', 'out_for_delivery', 'delivered')),
    CONSTRAINT `chk_shipments_dates` CHECK (
        (`shipment_status` = 'label_created' AND `shipped_at` IS NULL AND `delivered_at` IS NULL)
        OR (`shipment_status` IN ('in_transit', 'out_for_delivery') AND `shipped_at` IS NOT NULL AND `delivered_at` IS NULL)
        OR (`shipment_status` = 'delivered' AND `shipped_at` IS NOT NULL AND `delivered_at` IS NOT NULL AND `delivered_at` >= `shipped_at`)
    ),
    CONSTRAINT `fk_shipments_order` FOREIGN KEY (`order_id`) 
        REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Widok raportowy prezentujący pełny stan magazynowy produktów kuchennych
CREATE OR REPLACE VIEW `v_product_stock_summary` AS
SELECT `p`.`product_id`            AS `product_id`,
       `p`.`sku`                   AS `sku`,
       `p`.`name`                  AS `product_name`,
       `p`.`brand`                 AS `brand`,
       `p`.`base_price`            AS `base_price`,
       coalesce(`i`.`quantity`, 0) AS `total_stock`,
       (`p`.`base_price` * coalesce(`i`.`quantity`, 0)) AS `total_price`
FROM `projekt`.`products` `p` 
LEFT JOIN `projekt`.`inventory` `i` ON `p`.`product_id` = `i`.`product_id`;
