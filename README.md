# 🧶 EntreHilosCrochet - E-commerce System

## 📋 Descripción
Este proyecto es una aplicación web desarrollada en **.NET 8 (Web API)** y **React**, que permite la gestión completa de una tienda en línea enfocada en productos artesanales de crochet.  
Cuenta con dos paneles de control (dashboards): uno para **usuarios** y otro para **administradores**, cada uno con diferentes permisos y funcionalidades.

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

## 🧭 Dashboards del Sistema

### 👤 Dashboard de Usuario

El **dashboard de usuario** permite a los clientes registrarse, iniciar sesión y realizar compras de manera sencilla.

**Funciones principales:**
- Registro e inicio de sesión.  
- Edición del perfil de usuario.  
- Visualización y exploración de productos.  
- Agregar productos al carrito de compras.  
- Realizar pedidos y consultar su historial.  

**APIs relacionadas:**
| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| POST | `/api/Users/registration` | Registro de usuario |
| POST | `/api/Users/login` | Inicio de sesión |
| POST | `/api/Users/updateProfile` | Actualizar perfil |
| GET | `/api/Users/getUserProfile/{userId}` | Obtener perfil de usuario |
| POST | `/api/Products/addToCar` | Agregar producto al carrito |
| POST | `/api/Products/placeOrder` | Realizar pedido |
| GET | `/api/Users/getOrdersByUserId/{userId}` | Consultar órdenes del usuario |

---

### 🛠️ Dashboard de Administrador

El **dashboard de administrador** está diseñado para gestionar todo el sistema, incluyendo usuarios, productos y pedidos.

**Funciones principales:**
- Crear, editar o eliminar productos.  
- Subir imágenes de productos.  
- Consultar usuarios registrados.  
- Asignar roles y administrar fondos.  
- Visualizar, actualizar o eliminar pedidos.  

**APIs relacionadas:**
| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| POST | `/api/Admin/addUpdateProduct` | Crear o actualizar producto |
| POST | `/api/Admin/addUpdateProductWithFile` | Crear/editar producto con imagen |
| GET | `/api/Admin/getAllProducts` | Listar todos los productos |
| DELETE | `/api/Admin/deleteProduct/{id}` | Eliminar producto |
| GET | `/api/Admin/userList` | Listar usuarios |
| PUT | `/api/Admin/updateRole` | Cambiar rol de usuario |
| PUT | `/api/Admin/addFunds` | Agregar fondos a usuario |
| GET | `/api/Admin/getAllOrders` | Listar todas las órdenes |
| PUT | `/api/Admin/updateStatus/{orderId}/{newStatus}` | Actualizar estado de orden |
| DELETE | `/api/Admin/deleteUser/{id}` | Eliminar usuario |
| DELETE | `/api/Admin/deleteOrder/{orderId}` | Eliminar orden |

---

## 🌐 Documentación de la API

La documentación completa de la API se encuentra disponible mediante **Swagger UI** en:

🔗 [https://localhost:7144/swagger/index.html](https://localhost:7144/swagger/index.html)

Archivo JSON del esquema OAS3:

## 📄 Troubleshooting and Common Issues

* **HTTP 400 (Bad Request) on Product Save:** This almost always means the C\# model validation is failing. Check these fields in your React `FormData`:
    * The file must be sent with the key **`ImageFile`**.
    * The product type/category must be sent with the key **`Type`**.
* **Price/Discount Saving as 0:** If numeric values are saved as 0, there is a **naming mismatch** between your React state (`unityPrice`) and your C\# DTO property (e.g., if you are using `UnitePrice` instead of `UnitPrice`).
* **Logout:** Session closure is handled purely on the React side by removing `loggedInUserId` from `localStorage` and using `Maps('/')` to redirect to the Login page.