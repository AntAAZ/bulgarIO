# Run this from MySql Workbench!
ALTER USER root IDENTIFIED WITH mysql_native_password BY 'password';

drop database if exists bulgar_io;
CREATE DATABASE if not exists bulgar_io;
use bulgar_io;

create table users(
	id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL
);




 