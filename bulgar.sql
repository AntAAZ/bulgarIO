drop database if exists Bulgar_io;
CREATE DATABASE if not exists Bulgar_io;
use Bulgar_io;

create table users(
	id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    rank INT NOT NULL
);

create table Positions(
	id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    user_ID INT,
    
    foreign key (user_ID) references Users(id) on update cascade
    
);

create table Ranking(
	id INT AUTO_INCREMENT PRIMARY KEY,
    user_ID INT,
    point INT NOT NULL
    
    foreign key (user_ID) references users(id) on update cascade
);




 