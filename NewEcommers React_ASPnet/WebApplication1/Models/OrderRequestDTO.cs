using System.Collections.Generic;

namespace WebApplication1.Models
{
    // DTO principal que encapsula la solicitud del carrito.
    public class OrderRequestDTO
    {
        // 1. Necesitas saber qué usuario está comprando.
        public int UserId { get; set; }

        // 2. Necesitas la lista de productos que vienen del localStorage (carrito).
        public List<CartItemDTO> CartItems { get; set; }
    }

    // DTO para cada ítem dentro del carrito.
    public class CartItemDTO
    {
        public int ProductId { get; set; }

        // El precio unitario y el descuento se envían desde el frontend
        // para que el backend pueda verificar y recalcular.
        public decimal UnityPrice { get; set; }
        public decimal Discount { get; set; }

        // La cantidad que el usuario quiere comprar.
        public int Quantity { get; set; }
    }

    public class OrderItemDetailDTO
    {
        public int OrderItemId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } // Necesitas obtener el nombre del producto
        public decimal UnityPrice { get; set; }
        public decimal Discount { get; set; }
        public int Quatity { get; set; }
        public decimal TotalPrice { get; set; }

        public string ImgUrl { get; set; }
    }

    // DTO principal para la lista de órdenes de un usuario
    public class UserOrderDTO
    {
        public int OrderId { get; set; }
        public string OrderNo { get; set; }
        public decimal OrderTotal { get; set; }
        public string OrderStatus { get; set; }

        public string UserName { get; set; }
        public List<OrderItemDetailDTO> Items { get; set; } // Para el modal
    }
}