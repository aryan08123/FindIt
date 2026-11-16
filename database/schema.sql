-- =====================================================
-- FindIt - Campus Lost and Found Management Portal
-- File: database/schema.sql
-- Run once to create the database and tables.
-- WARNING: drops existing FindIt tables (clean reset).
-- =====================================================

CREATE DATABASE IF NOT EXISTS findit_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE findit_db;

DROP TABLE IF EXISTS claims;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;

-- ---------- USERS ----------
CREATE TABLE users (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    student_id  VARCHAR(30)  NOT NULL,
    department  VARCHAR(100) NOT NULL,
    password    VARCHAR(255) NOT NULL,              -- BCrypt hash, never plain text
    role        VARCHAR(20)  NOT NULL DEFAULT 'STUDENT',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_users_email      UNIQUE (email),
    CONSTRAINT uq_users_student_id UNIQUE (student_id),
    CONSTRAINT chk_users_role      CHECK (role IN ('STUDENT', 'ADMIN'))
) ENGINE=InnoDB;

-- ---------- ITEMS ----------
CREATE TABLE items (
    id                 BIGINT       NOT NULL AUTO_INCREMENT,
    item_name          VARCHAR(120) NOT NULL,
    category           VARCHAR(50)  NOT NULL,
    description        TEXT         NOT NULL,
    item_type          VARCHAR(10)  NOT NULL,        -- LOST / FOUND
    location           VARCHAR(150) NOT NULL,
    reported_date      DATE         NOT NULL,        -- date the item was lost / found
    image_url          VARCHAR(255) NULL,            -- path only, e.g. /uploads/abc.jpg
    contact_info       VARCHAR(150) NULL,
    additional_details TEXT         NULL,            -- identifying details (found items)
    status             VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    user_id            BIGINT       NOT NULL,
    created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_items_user  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_items_type   CHECK (item_type IN ('LOST', 'FOUND')),
    CONSTRAINT chk_items_status CHECK (status IN ('ACTIVE', 'CLAIMED', 'RECOVERED')),
    INDEX idx_items_type_status (item_type, status),
    INDEX idx_items_category (category),
    INDEX idx_items_location (location),
    INDEX idx_items_user (user_id)
) ENGINE=InnoDB;

-- ---------- CLAIMS ----------
CREATE TABLE claims (
    id           BIGINT      NOT NULL AUTO_INCREMENT,
    item_id      BIGINT      NOT NULL,
    claimant_id  BIGINT      NOT NULL,
    description  TEXT        NOT NULL,               -- why the claimant says it is theirs
    proof_details TEXT       NULL,                   -- identifying marks, receipts, etc.
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    admin_remarks VARCHAR(500) NULL,
    created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_claims_item     FOREIGN KEY (item_id)     REFERENCES items (id) ON DELETE CASCADE,
    CONSTRAINT fk_claims_claimant FOREIGN KEY (claimant_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_claims_status  CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    -- A student can claim a given item only once
    CONSTRAINT uq_claim_once UNIQUE (item_id, claimant_id),
    INDEX idx_claims_status (status),
    INDEX idx_claims_claimant (claimant_id)
) ENGINE=InnoDB;