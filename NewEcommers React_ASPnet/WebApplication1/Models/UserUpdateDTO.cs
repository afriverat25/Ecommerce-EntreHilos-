namespace WebApplication1.Models
{
    // WebApplication1.Models/UserUpdateDTO.cs
    public class UserUpdateDTO
    {
        public int UserId { get; set; }
        public string FirstName { get; set; } // Nombre que puede cambiar
        public string LastName { get; set; }  // Apellido que puede cambiar
        public string NewPassword { get; set; } // Nueva Contraseña (opcional)
    }
}
