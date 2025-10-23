namespace WebApplication1.Models
{
    public class Response
    {
        public int StatusCode { get; set; }

        public string StatusMessage { get; set; }

        public List<Users> ListUsers { get; set; }

        public Users User { get; set; }


        public List<Products> ListProducts { get; set; }

        public Products Product { get; set; }

        public List<Car> ListCar { get; set; }

        public Car Car { get; set; }

        public List<Orders> ListOrders { get; set; }

        public Orders Order { get; set; }

        public List<OrderItems> ListOrdersItems { get; set; }

        public OrderItems OrderItem { get; set; }


        public List<UserOrderDTO> Data { get; set; }

    }


}
