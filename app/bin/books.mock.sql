DROP TABLE IF EXISTS books;
CREATE TABLE books (email char(64) not null unique, password char(64) not null, role varchar(10) not null, uuid char(36) primary key);

/* john/password123admin/admin */
INSERT INTO books (email, password, role, uuid) VALUES ('96d9632f363564cc3032521409cf22a852f2032eec099ed5967c0d000cec607a', 'd4884dce592524861099696e1627921238d3a2a272440c00144f4069fb846e4c', 'admin', uuid());

/* anna/password123member/member */
INSERT INTO books (email, password, role, uuid) VALUES ('55579b557896d0ce1764c47fed644f9b35f58bad620674af23f356d80ed0c503', '28b1ed8b4704afae441e1076180237d88431349d252505df40395531b2156f60', 'member', uuid());
