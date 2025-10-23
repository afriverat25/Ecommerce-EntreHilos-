namespace WebApplication1.Models
{
    public class LoginRequest
    {
        // Solo las propiedades que React va a enviar
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
