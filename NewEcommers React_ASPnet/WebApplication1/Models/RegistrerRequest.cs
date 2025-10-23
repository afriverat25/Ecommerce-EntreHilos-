namespace WebApplication1.Models
{
    public class RegisterRequest
    {
        // Solo los campos que vienen de React, con PascalCase
        public string Name { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
