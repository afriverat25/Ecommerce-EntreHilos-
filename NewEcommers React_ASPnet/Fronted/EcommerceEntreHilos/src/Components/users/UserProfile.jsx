import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://localhost:7144';

// Estilos simples
const styles = {
    container: { padding: '25px', maxWidth: '600px', margin: '20px auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' },
    button: { padding: '12px 15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    balance: { color: '#27ae60', fontSize: '1.2em', fontWeight: 'bold' },
    infoBox: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px', borderLeft: '5px solid #3498db' }
};

export default function UserProfile() {
    // 🔑 LEER EL ID DEL LOCAL STORAGE
    const loggedInUserId = parseInt(localStorage.getItem('loggedInUserId')) || 0;
    
    const [user, setUser] = useState({
        id: loggedInUserId,
        firstName: '',
        lastName: '',
        email: '',
        fund: 0,
        type: '',
        status: '',
        newPassword: '' // Campo separado para la nueva clave
    });
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!loggedInUserId) {
            setMessage("Error: Usuario no autenticado.");
            setIsLoading(false);
            return;
        }
        
        const fetchProfile = async () => {
            try {
                // Usamos el endpoint del GET
                const response = await fetch(`${API_BASE_URL}/api/Users/getUserProfile/${loggedInUserId}`);
                const data = await response.json();

                if (data.statusCode === 200 && data.data) {
                    // Mapear los datos de la respuesta al estado
                    setUser(prev => ({
                        ...prev,
                        firstName: data.data.firstName,
                        lastName: data.data.lastName,
                        email: data.data.email,
                        fund: data.data.fund,
                        type: data.data.type,
                        status: data.data.status,
                    }));
                } else {
                    setMessage(data.statusMessage || "Fallo al cargar perfil.");
                }
            } catch (err) {
                setMessage("Error de conexión con el servidor.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [loggedInUserId]);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        
        // Crear el DTO que coincide con UserUpdateDTO.cs
        const updatePayload = {
            UserId: user.id,
            FirstName: user.firstName,
            LastName: user.lastName,
            NewPassword: user.newPassword // Se envía solo si se digitó
        };
        
        try {
            // Usamos el endpoint del PUT
            const response = await fetch(`${API_BASE_URL}/api/Users/updateUserProfile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
            });
            const data = await response.json();

            if (data.statusCode === 200) {
                setMessage("✅ ¡Perfil actualizado con éxito!");
                setUser(prev => ({ ...prev, newPassword: '' })); // Limpiar el campo de contraseña
            } else {
                setMessage(`❌ Error al actualizar: ${data.statusMessage}`);
            }
        } catch (error) {
            setMessage("Error de conexión al guardar.");
        }
    };

    if (isLoading) return <div style={styles.container}>Cargando perfil...</div>;

    return (
        <div style={styles.container}>
            <h2>👤 Mi Perfil de Usuario</h2>
            
            {message && <p style={{ color: message.startsWith('✅') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>}

            <div style={styles.infoBox}>
                <p><strong>Saldo Actual (Fund):</strong> <span style={styles.balance}>COP {user.fund.toFixed(2)}</span></p>
                <p><strong>Email:</strong> {user.email} (No editable)</p>
                <p><strong>Tipo de Usuario:</strong> {user.type} | <strong>Estado:</strong> {user.status}</p>
            </div>

            <h3 style={{ marginTop: '20px' }}>Datos Editables</h3>
            
            <form onSubmit={handleSubmit} style={styles.form}>
                
                <label>Nombre:</label>
                <input
                    type="text"
                    name="firstName"
                    value={user.firstName}
                    onChange={handleChange}
                    style={styles.input}
                    required
                />

                <label>Apellido:</label>
                <input
                    type="text"
                    name="lastName"
                    value={user.lastName}
                    onChange={handleChange}
                    style={styles.input}
                    required
                />

                <label>Nueva Contraseña (Dejar vacío si no quieres cambiarla):</label>
                <input
                    type="password"
                    name="newPassword"
                    value={user.newPassword}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Mínimo 6 caracteres"
                />

                <button type="submit" style={styles.button}>Guardar Cambios</button>
            </form>
        </div>
    );
}