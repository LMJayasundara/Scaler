-- SQLite
CREATE TABLE Users (
    User_Name varchar(255) NOT NULL,
    User_Password varchar(255) NOT NULL,
    PRIMARY KEY (User_Name)
);

INSERT INTO Users (User_Name, User_Password)
VALUES ('admin', '123');


CREATE TABLE Details (
    PLATE_NO varchar(255) NOT NULL,
    DRIVER varchar(255) default null,
    CUSTOMER varchar(255) default null,
    SUPPLIER varchar(255) default null,
    TRANSPOTER varchar(255) default null,
    PRODUCT varchar(255) default null,
    PRIMARY KEY (PLATE_NO)
);

INSERT INTO Details (PLATE_NO, DRIVER, CUSTOMER, SUPPLIER, TRANSPOTER, PRODUCT)
VALUES ('BCM0001', 'D001', 'C001', 'S001', 'T001', 'P001');

CREATE TABLE Pending (
    PLATE_NO varchar(255) NOT NULL,
    DRIVER varchar(255) default null,
    CUSTOMER varchar(255) default null,
    SUPPLIER varchar(255) default null,
    TRANSPOTER varchar(255) default null,
    PRODUCT varchar(255) default null,
    TICKET_NO varchar(255) default null,
    NOTE varchar(255) default null,
    INDATE datetime default null,
    OUTDATE datetime default null,
    WEIGHT1 double default null,
    WEIGHT2 double default null,
    NETWEIGHT double default null,
    PRIMARY KEY (PLATE_NO)
);

DELETE FROM Pending WHERE PLATE_NO = '';

CREATE TABLE Download (
    PLATE_NO varchar(255) NOT NULL,
    DRIVER varchar(255) default null,
    CUSTOMER varchar(255) default null,
    SUPPLIER varchar(255) default null,
    TRANSPOTER varchar(255) default null,
    PRODUCT varchar(255) default null,
    TICKET_NO varchar(255) default null,
    NOTE varchar(255) default null,
    INDATE datetime default null,
    OUTDATE datetime default null,
    WEIGHT1 double default null,
    WEIGHT2 double default null,
    NETWEIGHT double default null
);

DROP TABLE Download;