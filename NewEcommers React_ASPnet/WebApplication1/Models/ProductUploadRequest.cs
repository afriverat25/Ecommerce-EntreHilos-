using Microsoft.AspNetCore.Http;

namespace WebApplication1.Models
{
    public class ProductUploadRequest
    {
        // Datos del producto (vienen como texto/números en el FormData)
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal UnitePrice { get; set; }
        public decimal Discount { get; set; }
        public int Stoke { get; set; }
        public int Status { get; set; }
        public string Type { get; set; }

        // 🔑 Campo para el archivo (lo envía React)
        public IFormFile ImageFile { get; set; }
    }
}
