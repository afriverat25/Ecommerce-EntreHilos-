import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate para redirigir al Login

export default function Registration() {
    const navigate = useNavigate();
    
    // 🔑 CORRECCIÓN 1: Usamos PascalCase para coincidir con el modelo 'Users' de C#
    const [formData, setFormData] = useState({
        Name: "",        
        LastName: "",    
        Email: "",       
        Password: ""     
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ 
            ...formData, 
            // Esto usa el 'name' del input para actualizar el estado (ej: Name, LastName)
            [e.target.name]: e.target.value 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 🔑 CORRECCIÓN 2: Ajustamos el puerto (7144) y el controlador (/api/Users/registration)
        const API_URL = "https://localhost:7144/api/Users/registration";

        try {
            // El objeto formData ya tiene las propiedades en PascalCase
            const res = await axios.post(API_URL, formData);

            if (res.data.statusCode === 200) {
                setMessage("✅ Usuario registrado exitosamente. Serás redirigido...");
                // Redirigir al login después de un breve retraso
                setTimeout(() => {
                    navigate("/"); 
                }, 2000);
            } else {
                // Muestra un mensaje de error más específico si el servidor lo proporciona
                setMessage("⚠️ Falló el registro: " + (res.data.statusMessage || "Error desconocido"));
            }
        } catch (err) {
            console.error("Error de conexión con el servidor o CORS:", err);
            setMessage("❌ Error de conexión. Asegúrate de que la API de ASP.NET esté corriendo en el puerto 7144.");
        }
    };

    return (
        <div className="container mt-5" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <div style={{ padding: "30px", border: "1px solid #ccc", borderRadius: "8px", width: "400px" }}>
                <h2>Registro de Usuario</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Nombre</label>
                        {/* 🔑 CORRECCIÓN 3: Los 'name' deben coincidir con el estado (PascalCase) */}
                        <input type="text" name="Name" onChange={handleChange} required style={{ width: "100%", padding: "8px" }} />
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Apellido</label>
                        <input type="text" name="LastName" onChange={handleChange} required style={{ width: "100%", padding: "8px" }} />
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Email</label>
                        <input type="email" name="Email" onChange={handleChange} required style={{ width: "100%", padding: "8px" }} />
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                        <label>Contraseña</label>
                        <input type="password" name="Password" onChange={handleChange} required style={{ width: "100%", padding: "8px" }} />
                    </div>
                    <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px" }}>Registrar</button>
                </form>

                {message && <p style={{ marginTop: "15px", color: message.startsWith("❌") ? 'red' : message.startsWith("✅") ? 'green' : 'orange' }}>{message}</p>}
            </div>
        </div>
    );
}