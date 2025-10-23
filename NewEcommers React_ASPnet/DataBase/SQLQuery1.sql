CREATE DATABASE Ecrochetshop;

USE Ecrochetshop;


CREATE TABLE Users(ID INT IDENTITY(1,1) PRIMARY KEY, 
					FirstName Varchar(20),LastName Varchar(20), Password varchar(20), Email varchar(100),
					fund Decimal(18,2), Type varchar(100), Status INT, CreatedOn Datetime);


CREATE TABLE Products(ID INT IDENTITY(1,1) PRIMARY KEY, Name varchar(100), UnitPrice Decimal(18,2), Discount Decimal(18,2), Stoke INT, ImgUrl varchar(100), Status INT);

CREATE TABLE Cart(ID INT IDENTITY(1,1) PRIMARY KEY, UserId INT, ProductId INT , UnitPrice Decimal(18,2), Discount DECIMAL(18,2), Quantity INT, TotalPrice DECIMAL(18,2));

CREATE TABLE Orders(ID INT IDENTITY(1,1) PRIMARY KEY, UserId INT, OrderNo Varchar(100), OrderTotal DECIMAL(18,2), OrderStatus varchar(100));

CREATE TABLE OrderItems(ID INT IDENTITY(1,1) PRIMARY KEY, OrderId INT, ProductId INT, UnityPrice Decimal(18,2), Discount Decimal(18,2), Quatity Int, TotalPrice Decimal(18,2));


SELECT * FROM Users;
SELECT * FROM Products;
SELECT * FROM Cart;
SELECT * FROM Orders;
SELECT * FROM OrderItems;
