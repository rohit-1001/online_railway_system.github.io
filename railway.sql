CREATE DATABASE railway;

CREATE TABLE register(
	user_name varchar(50) NOT NULL,
    user_id varchar(50) NOT NULL UNIQUE,
    email varchar(50),
    contact int NOT NULL,
    dob date,
    gender varchar(6) NOT NULL,
    pass varchar(50) NOT NULL
);

CREATE TABLE contact(
	user_name varchar(50) NOT NULL,
    email varchar(50) NOT NULL,
    contact int(10) NOT NULL,
    address varchar(50),
    description varchar(50)
);

CREATE TABLE train(
	train_no int UNIQUE,
	train_name varchar(50),
    total_seats int,
    available_seats int,
    source_station varchar(50),
    destination_station varchar(50),
    train_date varchar(10),
    train_time varchar(20),
    
    PRIMARY KEY (train_no)
);
INSERT INTO train
VALUES (121, 'train1', 600, 560, 'mumbai', 'jalgaon', '2022-12-10',' 12:21:30');
INSERT INTO train
VALUES (122, 'train2', 500, 300, 'jalgaon', 'mumbai', '2022-12-11',' 20:11:30');
INSERT INTO train
VALUES (123, 'train3', 700, 600, 'nashik', 'akola', '2022-12-12',' 18:51:30');
INSERT INTO train
VALUES (124, 'train4', 550, 500, 'indore', 'ratnagiri', '2022-12-13',' 02:31:30');
INSERT INTO train
VALUES (125, 'train5', 450, 350, 'pune', 'nagpur', '2022-12-14',' 17:41:30');
INSERT INTO train
VALUES (126, 'train6', 900, 400, 'varanasi', 'jaipur', '2022-12-17',' 01:50:30');

CREATE TABLE ticket(
	pnr int,
	train_no int,
    user_name varchar(50),
    user_id varchar(50) NOT NULL,
    seat_no int,
    passengers int,
    
    FOREIGN KEY (train_no) references train(train_no)
);

CREATE TABLE admin_data (
	admin_id varchar(50) NOT NULL UNIQUE,
    admin_pass varchar(8) NOT NULL
);
INSERT INTO admin_data
VALUES('admin', 'admin123');

drop table train;
drop table ticket;
drop table admin_data;
drop table register;
drop table contact;
select * from register;
select * from train;
select * from contact;
select * from ticket;
select * from admin_data;

select * from register where contact='456';


UPDATE train SET available_seats=(available_seats+1) WHERE train_no=124;

UPDATE register SET user_id='sanjay' WHERE user_id='san';