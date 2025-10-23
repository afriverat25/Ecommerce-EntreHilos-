# 🚀 E-CROCHET SHOP: Product Management Platform (C\# & React)

This project implements an e-commerce platform specializing in crochet products, featuring a robust **ASP.NET Core (C\#)** backend for data management and a comprehensive frontend user and admin interface built with **React.js**.

***

## 💻 Key Technologies

### Backend (API)
* **Language:** C\#
* **Framework:** ASP.NET Core Web API
* **Data Access:** ADO.NET (Direct SQL Server connection via a dedicated `DAL` layer).
* **Database:** SQL Server

### Frontend (SPA)
* **Library:** React.js
* **Routing:** `react-router-dom`
* **Session State Management:** `localStorage`

***

## ⚙️ Setup and Execution

Follow these steps to set up both the backend and frontend on your local environment.

### 1. Backend: ASP.NET Core (C\#)

#### A. Database (SQL Server)
1.  Ensure you have a **SQL Server** instance running.
2.  Create the database named: `Ecrochetshop`.
3.  Create the necessary tables (e.g., `Users`, `Products`, `Orders`).
    * **Crucial Note:** Verify that the column names in your `Products` table (e.g., `UnitPrice`, `Discount`) exactly match the names used in your C\# DAL and DTOs.

#### B. Connection Configuration
1.  Open the file `appsettings.json` in your API project.
2.  Update the connection string under the `"Ecrochetshop"` key:

    ```json
    "ConnectionStrings": {
      "Ecrochetshop": "Server=[Your_SERVER_NAME];Database=Ecrochetshop;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;"
    }
    ```

#### C. API Execution
1.  Open the solution in Visual Studio.
2.  Ensure the API is configured to use **HTTPS** on `https://localhost:7144/`.
3.  Run the API project (Press `F5`).

***

### 2. Frontend: React.js

#### A. Dependency Installation
1.  Navigate to the root folder of your React project:
    ```bash
    cd [Your_Frontend_Folder]
    ```
2.  Install the required dependencies:
    ```bash
    npm install
    ```

#### B. Execution
1.  From the frontend root folder, start the development server:
    ```bash
    npm start
    ```
2.  The application will open in your browser, typically at `http://localhost:3000/`.

***

## 🔑 Key API Endpoints

These are the core endpoints implemented for product and user management.

| Module | Endpoint (Route) | HTTP Verb | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `/api/Admin/addUpdateProductWithFile` | `POST` | Adds or updates a product (handles `[FromForm]` data and file upload). |
| **Admin** | `/api/Admin/deleteProduct/{id}` | `DELETE` | Deletes a product by ID. |
| **Users** | `/api/Users/getUserProfile/{userId}` | `GET` | Retrieves a user's profile details. |
| **Users** | `/api/Users/updateUserProfile` | `PUT` | Updates the user's name, last name, and password. |

***

## 📄 Troubleshooting and Common Issues

* **HTTP 400 (Bad Request) on Product Save:** This almost always means the C\# model validation is failing. Check these fields in your React `FormData`:
    * The file must be sent with the key **`ImageFile`**.
    * The product type/category must be sent with the key **`Type`**.
* **Price/Discount Saving as 0:** If numeric values are saved as 0, there is a **naming mismatch** between your React state (`unityPrice`) and your C\# DTO property (e.g., if you are using `UnitePrice` instead of `UnitPrice`).
* **Logout:** Session closure is handled purely on the React side by removing `loggedInUserId` from `localStorage` and using `Maps('/')` to redirect to the Login page.