drop database if exists Bulgar_io;
CREATE DATABASE if not exists Bulgar_io;
use Bulgar_io;

create table Users(
	Id INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL,
    Password VARCHAR(50) NOT NULL,
    Rank INT NOT NULL
);

create table Positions(
	Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(30) NOT NULL,
    User_ID INT,
    
    foreign key (User_ID) references Users(Id) on update cascade
    
);

create table Ranking(
	Id INT AUTO_INCREMENT PRIMARY KEY,
    User_ID INT,
    Point INT NOT NULL
    
    foreign key (User_ID) references Users(Id) on update cascade
);




 