using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly  IConfiguration _configuration;

        public UsersController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost]
        [Route("registration")]
        public Response registre(RegisterRequest request)
        {
            // Mapeamos los datos del DTO al objeto Users antes de pasarlo al DAL
            Users user = new Users();

            // Mapeo de datos
            user.Name = request.Name;
            user.LastName = request.LastName;
            user.Email = request.Email;
            user.Password = request.Password;

            // Inicializar los campos requeridos que React NO envía:
            user.Fund = 0;
            user.Type = "Pending"; // O el valor que necesites
            user.Status = 1; // O el valor que necesites
            user.CreatedOn = DateTime.Now;
            user.OrderType = "Default"; // O el valor que necesites

            // Ahora, el objeto 'user' está completo y listo para el DAL
            Response response = new Response();
            DAL l = new DAL();
            SqlConnection connection = new SqlConnection(_configuration.GetConnectionString("Ecrochetshop").ToString());

            // Llamamos al DAL con el objeto 'user' completo
            response = l.registre(user, connection);

            return response;
        }

        // UsersController.cs

        [HttpPost]
        [Route("login")]
        // 🔑 CAMBIO CLAVE: Esperamos el DTO simple 'LoginRequest'
        public Response Login(LoginRequest request)
        {
            string connectionString = _configuration.GetConnectionString("Ecrochetshop");

            if (string.IsNullOrEmpty(connectionString))
            {
                return new Response { StatusCode = 500, StatusMessage = "Error de configuración: Cadena de conexión no encontrada." };
            }

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                // 🔑 ADAPTACIÓN: Creamos un objeto Users temporal para enviarlo al DAL
                // El DAL.Login requiere un objeto Users, así que lo creamos solo con los datos necesarios.
                Users userForLogin = new Users
                {
                    Email = request.Email,
                    Password = request.Password
                    // Los otros campos (Name, Fund, etc.) se quedan nulos/por defecto, y eso está bien, 
                    // ya que el DAL.Login solo usa Email y Password.
                };

                DAL dal = new DAL();
                // Le pasamos el objeto Users temporal al DAL
                Response response = dal.Login(userForLogin, connection);

                return response;
            }
        }

        [HttpPost]
        [Route("ViewUser")]

        public Response viewUser(Users user)
        {
            DAL dal = new DAL();
            SqlConnection connection = new SqlConnection(_configuration.GetConnectionString("Ecrochetshop").ToString());
            Response response = new Response();

            response = dal.ViewUser(user, connection);

            return response;
        }


        [HttpPost]
        [Route("updateProfile")]

        public Response updateProfile(Users user)
        {
            DAL dal = new DAL();
            SqlConnection connection = new SqlConnection(_configuration.GetConnectionString("Ecrochetshop").ToString());
            Response response = new Response();

            response = dal.updateProfile(user, connection);

            return response;
        }


        [HttpPost]
        [Route("createOrderFromCart")]
        public Response CreateOrderFromCart([FromBody] OrderRequestDTO orderRequest)
        {
            // 1. Validación básica del Request
            if (orderRequest == null || orderRequest.UserId <= 0 || orderRequest.CartItems == null || orderRequest.CartItems.Count == 0)
            {
                return new Response { StatusCode = 400, StatusMessage = "Solicitud inválida. Faltan datos del usuario o del carrito." };
            }

            // 2. Obtener la cadena de conexión
            string connectionString = _configuration.GetConnectionString("Ecrochetshop");

            // 3. Abrir la conexión y llamar a la capa DAL
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                // Instanciar tu Data Access Layer (DAL)
                DAL dal = new DAL();

                // La función en DAL contiene toda la lógica de negocio:
                // - Cálculo de total.
                // - Verificación de fondos.
                // - Inserción en Orders y OrderItems (transaccional).
                // - Actualización de stock.
                // - Actualización de saldo de usuario.
                Response response = dal.createOrderFromCart(connection, orderRequest);

                return response;
            }
        }


        [HttpGet]
        [Route("getOrdersByUserId/{userId}")]
        public Response GetOrdersByUserId(int userId)
        {
            // 1. Validación básica
            if (userId <= 0)
            {
                return new Response { StatusCode = 400, StatusMessage = "ID de Usuario inválido." };
            }

            // 2. Obtener la cadena de conexión
            string connectionString = _configuration.GetConnectionString("Ecrochetshop");

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                DAL dal = new DAL();

                // 3. Llamar a la función DAL
                List<UserOrderDTO> orders = dal.GetOrdersByUserId(connection, userId);

                if (orders != null && orders.Count > 0)
                {
                    return new Response
                    {
                        StatusCode = 200,
                        StatusMessage = "Órdenes encontradas.",
                        // ⚠️ Necesitas que tu clase Response tenga una propiedad para DATA
                        Data = orders
                    };
                }
                else
                {
                    return new Response { StatusCode = 404, StatusMessage = "No se encontraron órdenes para este usuario." };
                }
            }
        }

        [HttpGet]
        [Route("getUserProfile/{userId}")] // Ruta: /api/Users/getUserProfile/12
        public Response GetUserProfile(int userId)
        {
            DAL dal = new DAL();

            // Validación básica de ID
            if (userId <= 0)
            {
                return new Response { StatusCode = 400, StatusMessage = "ID de Usuario inválido." };
            }

            string connectionString = _configuration.GetConnectionString("Ecrochetshop");

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                // Llama a la función del DAL para obtener los detalles del usuario
                // Nota: Aquí se asume que GetUserDetails devuelve un objeto User, el cual es mapeado a Data
                Users user = dal.GetUserDetails(connection, userId);

                if (user != null)
                {
                    return new Response
                    {
                        StatusCode = 200,
                        StatusMessage = "Éxito al cargar perfil.",
                        User = user // El frontend leerá data.data
                    };
                }
                return new Response { StatusCode = 404, StatusMessage = "Usuario no encontrado." };
            }
        }

        // 🔑 2. PUT: Actualizar datos de perfil (Usado por UserProfile.jsx para guardar cambios)
        [HttpPut]
        [Route("updateUserProfile")] // Ruta: /api/Users/updateUserProfile
        public Response UpdateUserProfile([FromBody] UserUpdateDTO request)
        {
            DAL dal = new DAL();

            // Validación básica de la solicitud
            if (request == null || request.UserId <= 0)
            {
                return new Response { StatusCode = 400, StatusMessage = "Datos de solicitud incompletos o inválidos." };
            }

            string connectionString = _configuration.GetConnectionString("Ecrochetshop");

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                // Llama a la función del DAL para realizar la actualización
                return dal.UpdateUser(connection, request);
            }
        }

    }
}
