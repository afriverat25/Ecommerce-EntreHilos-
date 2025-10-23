using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data.SqlClient;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {

        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment; // Para obtener la ruta wwwroot

        public AdminController(IConfiguration configuration, IWebHostEnvironment environment)
        {
            _configuration = configuration;
            _environment = environment;
        }


        // ProductsController.cs

        [HttpPost]
        [Route("addUpdateProduct")]
        public Response addUpdateProduct(Products product) // Usamos 'product' como nombre de variable
        {
            string connectionString = _configuration.GetConnectionString("Ecrochetshop");

            if (string.IsNullOrEmpty(connectionString))
            {
                return new Response { StatusCode = 500, StatusMessage = "Error de configuración: Cadena de conexión no encontrada." };
            }

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                DAL dal = new DAL();
                Response response = dal.addUpdateProduct(product, connection);
                return response;
            }
        }


        [HttpPost]
        [Route("addUpdateProductWithFile")]
        // Usamos Task<Response> porque la subida de archivo es asíncrona
        public async Task<Response> addUpdateProductWithFile([FromForm] ProductUploadRequest request)
        {
            string connectionString = _configuration.GetConnectionString("Ecrochetshop");
            string imgUrl = string.Empty;

            // 1. MANEJO Y GUARDADO DE LA IMAGEN
            if (request.ImageFile != null)
            {
                try
                {
                    // Ruta: [Ruta del proyecto]/wwwroot/Images
                    string uploadsFolder = Path.Combine(_environment.WebRootPath, "Images");
                    if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                    // Generar nombre de archivo único para evitar colisiones
                    string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(request.ImageFile.FileName);
                    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    // Guardar el archivo en el servidor de forma asíncrona
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await request.ImageFile.CopyToAsync(fileStream);
                    }

                    // URL que se guardará en la base de datos y se usará en React
                    imgUrl = $"/Images/{uniqueFileName}";
                }
                catch (Exception ex)
                {
                    // Error al subir la imagen
                    return new Response { StatusCode = 500, StatusMessage = "Error al guardar la imagen en el servidor: " + ex.Message };
                }
            }

            // 2. MAPEAR Y LLAMAR AL DAL
            Products product = new Products
            {
                Id = request.Id,
                Name = request.Name,
                UnitePrice = request.UnitePrice,
                Discount = request.Discount,
                Stoke = request.Stoke,
                Status = request.Status,
                ImgUrl = imgUrl // 🔑 Aquí va la URL generada
            };

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                DAL dal = new DAL();
                Response response = dal.addUpdateProduct(product, connection);
                return response;
            }
        }


        [HttpGet]
        [Route("userList")]
        public Response userList()
        {
            string connectionString = _configuration.GetConnectionString("Ecrochetshop");

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                DAL dal = new DAL();
                Response response = dal.userList(connection);
                return response;
            }
        }


        // AdminController.cs - dentro de la clase AdminController

        [HttpGet]
        [Route("getAllProducts")]
        public Response getAllProducts()
        {
            // Obtener la cadena de conexión
            string connectionString = _configuration.GetConnectionString("Ecrochetshop");

            // Llamar al DAL para obtener la lista
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                DAL dal = new DAL();
                Response response = dal.getAllProducts(connection);
                return response;
            }
        }


        // AdminController.cs - dentro de la clase AdminController

        [HttpDelete]
        [Route("deleteProduct/{id}")] // Recibe el ID directamente en la URL
        public Response DeleteProduct(int id)
        {
            string connectionString = _configuration.GetConnectionString("Ecrochetshop");

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                DAL dal = new DAL();
                // Llama al nuevo método en la capa DAL
                Response response = dal.DeleteProduct(id, connection);
                return response;
            }
        }


        // En tu AdminController.cs

        public class ChangeRoleRequest
        {
            public int Id { get; set; }
            public string Type { get; set; }
        }

        [HttpPut] // Usamos PUT para modificar datos existentes
        [Route("updateRole")]
        public Response UpdateRole([FromBody] ChangeRoleRequest request)
        {
            string connectionString = _configuration.GetConnectionString("Ecrochetshop");
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                DAL dal = new DAL();
                // Nota: Le pasamos el objeto 'user' completo.
                Users user = new Users { Id = request.Id };
                Response response = dal.updateRole(connection, user, request.Type);
                return response;
            }
        }

        // Para Añadir Fondos, necesitamos el ID y el monto
        public class AddFundsRequest
        {
            public int Id { get; set; }
            public decimal Amount { get; set; }
        }

        [HttpPut]
        [Route("addFunds")]
        public Response AddFunds([FromBody] AddFundsRequest request)
        {
            string connectionString = _configuration.GetConnectionString("Ecrochetshop");
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                DAL dal = new DAL();
                // Pasamos un objeto Users parcial solo para el ID, y el monto
                Users user = new Users { Id = request.Id };
                Response response = dal.addFunds(connection, user, request.Amount);
                return response;
            }
        }


        [HttpDelete] // Usamos DELETE para eliminar datos
        [Route("deleteUser/{id}")]
        public Response DeleteUser(int id)
        {
            string connectionString = _configuration.GetConnectionString("Ecrochetshop");
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                DAL dal = new DAL();
                Response response = dal.deleteUser(connection, id);
                return response;
            }
        }



        // En tu clase OrdersController.cs

        // 🔑 NUEVO: Endpoint para el Admin (Obtener TODAS las órdenes)
        [HttpGet]
        [Route("getAllOrders")]
        public Response GetAllOrders()
        {
            string connectionString = _configuration.GetConnectionString("Ecrochetshop");

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                DAL dal = new DAL();
                List<UserOrderDTO> orders = dal.GetAllOrders(connection);

                if (orders != null && orders.Count > 0)
                {
                    return new Response
                    {
                        StatusCode = 200,
                        StatusMessage = "Órdenes encontradas.",
                        Data = orders
                    };
                }
                else
                {
                    return new Response { StatusCode = 404, StatusMessage = "No se encontraron órdenes." };
                }
            }
        }

        // 🔑 NUEVO: Endpoint para actualizar el estado
        [HttpPut]
        [Route("updateStatus/{orderId}/{newStatus}")]
        public Response UpdateOrderStatus(int orderId, string newStatus)
        {
            string connectionString = _configuration.GetConnectionString("Ecrochetshop");
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                DAL dal = new DAL();
                return dal.UpdateOrderStatus(connection, orderId, newStatus);
            }
        }

        // 🔑 NUEVO: Endpoint para eliminar la orden
        [HttpDelete]
        [Route("deleteOrder/{orderId}")]
        public Response DeleteOrder(int orderId)
        {
            string connectionString = _configuration.GetConnectionString("Ecrochetshop");
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                DAL dal = new DAL();
                return dal.DeleteOrder(connection, orderId);
            }
        }


    }
}
