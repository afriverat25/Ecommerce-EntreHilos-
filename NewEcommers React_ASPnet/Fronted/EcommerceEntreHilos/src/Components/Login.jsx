import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const apiURL = "https://localhost:7144/api/Users/login";

    try {
      const response = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Las propiedades aquí deben coincidir con tu DTO 'LoginRequest' en C#
          Email: email, 
          Password: password,
        }),
      });

      if (!response.ok) {
        // Maneja errores HTTP como 404, 500, etc.
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.statusCode === 200) {
        // 🔑 1. ACCEDER AL ROL DEL USUARIO
        // El backend devuelve el rol en data.User.Type, que se serializa a data.user.type
        const loggedInUserId = data.user.id; // <-- Asumiendo que el backend devuelve { user: { id: X, type: 'User', ... } }
        const userType = data.user.type;
        
        // 🚨 ACCIÓN CRÍTICA: Guardar el ID en localStorage
        if (loggedInUserId) {
            localStorage.setItem('loggedInUserId', loggedInUserId);
            // Opcional: También puedes guardar el nombre o el rol si es útil
            localStorage.setItem('userType', userType); 
        }

        // 🔑 2. LÓGICA DE REDIRECCIÓN CONDICIONAL
        if (userType === 'Admin') {
          alert("Login correcto. ¡Bienvenido, Administrador!");
          // Redirigir a la pantalla de gestión de Admin
          navigate("/admin/dashboard"); 
        } else if (userType === 'User' || userType === 'Pending') {
          alert("Login correcto. Accediendo a la tienda.");
          // Redirigir a la pantalla de compra de Usuario
          navigate("/user/dashboard"); 
        } else {
          // Manejar otros estados como 'Pending' o 'Blocked'
          alert(`Tu cuenta tiene el estado: ${userType}. No puedes acceder aún.`);
        }
      } else {
        // Manejar credenciales inválidas (StatusCode 100)
        alert(data.statusMessage || "Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error al intentar iniciar sesión:", error);
      alert("Error de conexión. Asegúrate de que la API de ASP.NET esté corriendo y que la dirección sea correcta.");
    }
  };

  // --- HTML del formulario (Sin cambios) ---
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <form
        onSubmit={handleLogin}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          border: "1px solid #ccc",
          padding: "30px",
          borderRadius: "10px",
          width: "300px",
        }}
      >
        <h2>Iniciar Sesión</h2>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Ingresar</button>
        <p
          style={{ color: "blue", cursor: "pointer", textAlign: "center" }}
          onClick={() => navigate("/registration")}
        >
          ¿No tienes cuenta? Regístrate aquí
        </p>
      </form>
    </div>
  );
}
