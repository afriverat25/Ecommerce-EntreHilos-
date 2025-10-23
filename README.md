# 🧶 EntreHilosCrochet - E-commerce System

## 📋 Description
This project is a web application developed with **.NET 8 (Web API)** and **React**, designed to manage a complete online store focused on handcrafted crochet products.  
It includes two main dashboards: one for **users** and one for **administrators**, each with distinct permissions and functionalities.

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
## 🧭 System Dashboards

### 👤 User Dashboard

The **User Dashboard** allows customers to register, log in, and make purchases easily.

**Main Features:**
- User registration and login.  
- Profile management and updates.  
- Product browsing and viewing.  
- Add products to the shopping cart.  
- Place orders and view order history.  

**Related APIs:**
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/Users/registration` | Register a new user |
| POST | `/api/Users/login` | User login |
| POST | `/api/Users/updateProfile` | Update user profile |
| GET | `/api/Users/getUserProfile/{userId}` | Get user profile |
| POST | `/api/Products/addToCar` | Add product to cart |
| POST | `/api/Products/placeOrder` | Place an order |
| GET | `/api/Users/getOrdersByUserId/{userId}` | Get user’s order history |

---

### 🛠️ Admin Dashboard

The **Admin Dashboard** is designed for system management, including products, users, and orders.

**Main Features:**
- Create, edit, or delete products.  
- Upload product images.  
- View and manage registered users.  
- Assign roles and add user funds.  
- View, update, or delete orders.  

**Related APIs:**
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/Admin/addUpdateProduct` | Create or update product |
| POST | `/api/Admin/addUpdateProductWithFile` | Create/update product with image |
| GET | `/api/Admin/getAllProducts` | List all products |
| DELETE | `/api/Admin/deleteProduct/{id}` | Delete product |
| GET | `/api/Admin/userList` | Get all users |
| PUT | `/api/Admin/updateRole` | Update user role |
| PUT | `/api/Admin/addFunds` | Add user funds |
| GET | `/api/Admin/getAllOrders` | Get all orders |
| PUT | `/api/Admin/updateStatus/{orderId}/{newStatus}` | Update order status |
| DELETE | `/api/Admin/deleteUser/{id}` | Delete user |
| DELETE | `/api/Admin/deleteOrder/{orderId}` | Delete order |

---

## 🌐 API Documentation

Full API documentation is available through **Swagger UI**:

🔗 [https://localhost:7144/swagger/index.html](https://localhost:7144/swagger/index.html)


## 📄 Troubleshooting and Common Issues

* **HTTP 400 (Bad Request) on Product Save:** This almost always means the C\# model validation is failing. Check these fields in your React `FormData`:
    * The file must be sent with the key **`ImageFile`**.
    * The product type/category must be sent with the key **`Type`**.
* **Price/Discount Saving as 0:** If numeric values are saved as 0, there is a **naming mismatch** between your React state (`unityPrice`) and your C\# DTO property (e.g., if you are using `UnitePrice` instead of `UnitPrice`).
* **Logout:** Session closure is handled purely on the React side by removing `loggedInUserId` from `localStorage` and using `Maps('/')` to redirect to the Login page.