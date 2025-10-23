using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]


    public class ProductsController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public ProductsController(IConfiguration configuration)
        {
            _configuration = configuration;
        }


        [HttpPost]
        [Route("addToCar")]

        public Response addToCar(Car carshop)
        {
            DAL dal = new DAL();
            SqlConnection connection = new SqlConnection(_configuration.GetConnectionString("Ecrochetshop").ToString());
            Response response = new Response();

            response = dal.addToCar(carshop, connection);

            return response;
        }


        [HttpPost]
        [Route("placeOrder")]

        public Response placeOrder(Users user)
        {
            DAL dal = new DAL();
            // ✅ CORRECTO: Usar la clave individual definida en appsettings.json
            SqlConnection connection = new SqlConnection(_configuration.GetConnectionString("Ecrochetshop").ToString());
            Response response = new Response();

            response = dal.placeOrder(user, connection);

            return response;
        }


        [HttpGet]
        [Route("OrderList")]

        public Response OrderList(Users user)
        {
            DAL dal = new DAL();
            SqlConnection connection = new SqlConnection(_configuration.GetConnectionString("Ecrochetshop").ToString());
            Response response = new Response();

            response = dal.OrderList(user, connection);

            return response;
        }
    }



}
