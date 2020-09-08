DROP DATABASE IF EXISTS auth_ms_db;
CREATE DATABASE auth_ms_db; 

CREATE USER 'auth_ms_user'@localhost IDENTIFIED BY 'UJB8BK3d6keLPMrwMQq9ezPG8VjBR4dZb7qxEb5BQRCzug2gMQCPEwMZ2nWYNzEg3V9rYJUMYKrY5vwfAyHw9p4ne69JjwEDt4FzWMQwHedH39K4u7E48rjY6fQGH4bypgfERa7j4NVZVThZBgYSzDSp6sGBmWSpVpPb2vnzXwkVyYWbStSxS5ewgE2eX7yzMG8eCgnZ6kJQ4pGFLjbFsjTLxEKMJCtjXKhBna33YpwDVjvURVfMZ2P6Rd5TL4u8bTLYaaK75bE3PqmSqG3ZTBKUXMP6xMTFFHuGMSUzhzegSbSUw8PuMJ8NhM3ghfNtWEge8sVRx9QMZM2JmZY2G4XuyTvBMb4EG5kzpT8zscQcDh683Mpxz54a2YSBAEVWNuMeH5QEZwp6zANTf6B8r5RGxexERfSBDmQ9L4YncvkRdWSBCY3NnE3u5DdpBjKSfGnLgUHwAmxRSbtR3DVNdKUwFttGRJj4UQvGnShs6Uymw4M6neASWThkHDQm3T6qVW5Q77wfwq336aLQB6WLE4jGZDDueMmRrG7V4sJTHGpXaHmPQPqMRnkAmnuhQ2WqRy7skXMBwgSpdMbZg57AjbFwcx4F25AduxrSYtEmDtLVrES4TLuSnrtSRTHqu968G9JxJdTQWWEhYqKNbpzC3xLyj7pv9MDzQ33pGYgrERpHMtmM9RzxXB7jsxQvk8u5npyGDCQjXJQ2HhDjTCyxuNGTXEyY38LDuDVFjCSedhYGajF6Hb8kzKL6Pb3Az8ZabsNQJRA5v2hfKSTgzHgAEMw2XWqVrqmdkLaZPuyZ4Ct9Pzhkz2BkDExnGgDwuvh2nUHKMD6XCTjZhBxAz2FFUA6cVXzJuBWt7f835bdMDxkybzZegyVgcfyP32w4JrrYjUaYSJ2PFyjSca9KVSfUTDzaXFrmXeCNkChjf2fWgtgsKaLytcsvGY9vFu4jhgJk6BHZLgXY65VauGH6qSkL6QXjtu4af9aSb7tECBKTWQbZaVkq7q8EAxEYBQswecN5';
GRANT ALL PRIVILEGES ON auth_ms_db.* TO 'auth_ms_user'@localhost;

DROP TABLE IF EXISTS ms_recorded;
CREATE TABLE ms_recorded (
    DB_TYPE ENUM('mysql') not null,
    JWT_ACCESS_TTL INT UNSIGNED,
    JWT_SECRET_ACCESSTOKEN char(64) not null, 
    JWT_SECRET_REFRESHTOKEN char(64) not null, 
    JWT_SECRET_FORGOTPASSWORDTOKEN char(64) not null, 
    MS_UUID char(36) primary key,
    COOKIE_JWT_ACCESS_NAME char(64) not null, 
    COOKIE_JWT_REFRESH_NAME char(64) not null,
    SALT char(16)
);

INSERT INTO ms_recorded (
    DB_TYPE,
    JWT_ACCESS_TTL,
    JWT_SECRET_ACCESSTOKEN, 
    JWT_SECRET_REFRESHTOKEN, 
    JWT_SECRET_FORGOTPASSWORDTOKEN, 
    MS_UUID,
    COOKIE_JWT_ACCESS_NAME, 
    COOKIE_JWT_REFRESH_NAME,
    SALT
) VALUES (
    'mysql',
    300000,
    '9591b8436b39f5651d6b3f035c7aab98354107c6881211530a41a56941dd504a', 
    '536b89f94a5b6f25f52bccb7ec22664e29a47e9e31977243c43d98593802ce9d', 
    '9b43e6ebb124b900edaa16d2a55364eb24833ecfde5cbcbe22a9d12bbb585957', 
    '46487d3b-0d30-5161-9792-ca9eb1558b9d',
    'dee22d44fadff528bc528430fad9fe594ccbac639b4c726c24914dd710f02ace', 
    'ee4baa99e6dad21105906bc947015c7cdbdcb5922fd8f3f3c323f6d251260ef3' 
);

DROP TABLE IF EXISTS ms_public_data;
CREATE TABLE ms_public_data ( 
    MS_UUID char(36) primary key,
    title varchar(64) not null, 
    icon_src varchar(256)
);

INSERT INTO ms_public_data (
    MS_UUID,
    title,
    icon_src
) VALUES (
    '46487d3b-0d30-5161-9792-ca9eb1558b9d',
    'Authenticator Micro-Service',
    'https://auth-ms.s3.eu-west-3.amazonaws.com/icon_src/lock.svg'
);

DROP TABLE IF EXISTS auth_ms;
CREATE TABLE auth_ms (
    email char(64) not null unique, 
    password char(64) not null, 
    role varchar(10) not null, 
    uuid char(36) primary key
);

/* quentin.philippot@gmail.com/admin */
INSERT INTO auth_ms (
    email, 
    password, 
    role, 
    uuid
) VALUES (
    '9a0d35b92d917436a4829d29fbd1288933fb4db89dacb84d3b46fdfe81bdc7e9', 
    '4b727986646008727bdb2a7e903da96cfba71ed189fa3691b70909dd9948ca74', 
    'admin', 
    '6b36abe2-833e-5f5e-b273-f7ec1d1c7ffb'
);

DROP TABLE IF EXISTS admin_auth_ms;
CREATE TABLE admin_auth_ms (
    role ENUM('admin', 'user') not null, 
    user_uuid char(36) not null,
    ms_uuid char(36) not null,
    CONSTRAINT admin_auth_ms_pk PRIMARY KEY (user_uuid, ms_uuid)
);

DROP TABLE IF EXISTS ms_data;
CREATE TABLE ms_data (
    ms_uuid char(36) not null primary key,
    name varchar(32) not null, 
    img_src varchar(256)
);


