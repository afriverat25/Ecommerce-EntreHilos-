import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 🔑 AÑADIR ESTA IMPORTACIÓN

// 🔑 URL de tu API base para las acciones administrativas
const API_BASE_URL = "https://localhost:7144/api/Admin";
const USER_LIST_URL = `${API_BASE_URL}/userList`; 

// =======================================================
// ESTILOS
// =======================================================

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif'
    }
};

const tableStyles = {
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden'
    },
    th: {
        backgroundColor: '#34495e',
        color: 'white',
        padding: '15px 12px',
        textAlign: 'left',
        fontSize: '1em'
    },
    td: {
        padding: '12px',
        borderBottom: '1px solid #ecf0f1',
        verticalAlign: 'middle',
        color: '#333'
    },
    actionCell: { 
        display: 'flex',
        gap: '10px', 
        alignItems: 'center'
    },
    button: { 
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9em',
        border: 'none',
        transition: 'background-color 0.2s',
    },
    roleButton: { 
        backgroundColor: '#f1c40f', 
        color: '#333',
        fontWeight: 'bold',
        
    },
    fundButton: { 
        backgroundColor: '#2ecc71', 
        color: 'white'
    }
};


// =======================================================
// COMPONENTE DE LA TABLA (CustomerTable)
// =======================================================

const CustomerTable = ({ customers, refreshList }) => {
    
    // --- LÓGICA DE ADMINISTRACIÓN: INTEGRACIÓN CON C# ---

    // 1. CAMBIAR ROL
   // Versión Corregida de handleRoleChange

const handleRoleChange = async (user) => {
    // 1. Casing del nombre para la confirmación: usar user.Name (PascalCase)
    const newRole = user.type === 'Admin' ? 'User' : 'Admin';
    if (!window.confirm(`¿Seguro que deseas cambiar el rol de ${user.name} a ${newRole}?`)) return;

    try {
        const response = await fetch(`${API_BASE_URL}/updateRole`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                // 🛑 CORRECCIÓN CLAVE: Usar user.Id (PascalCase) en el body
                Id: user.id, 
                // 'Type' ya estaba correcto (PascalCase)
                Type: newRole 
            }),
        });
        const data = await response.json();

        if (data.statusCode === 200) {
            alert(data.statusMessage);
            refreshList();
        } else {
            alert(`Error: ${data.statusMessage}`);
        }
    } catch (error) {
        console.error("Error al actualizar el rol:", error);
        alert("Fallo la conexión con el servidor.");
    }
};
    // 2. AÑADIR FONDOS
    const handleAddFunds = async (user) => {
        const amountStr = window.prompt(`Ingresa la cantidad a agregar al saldo de ${user.name}:`);
        if (!amountStr) return; 

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            alert("Por favor, ingresa una cantidad válida.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/addFunds`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    Id: user.id, 
                    Amount: amount 
                }),
            });
            const data = await response.json();
            
            if (data.statusCode === 200) {
                alert(data.statusMessage);
                refreshList();
            } else {
                alert(`Error: ${data.statusMessage}`);
            }
        } catch (error) {
            console.error("Error al agregar fondos:", error);
            alert("Fallo la conexión con el servidor.");
        }
    };
    
    // 3. ELIMINAR USUARIO
    const handleDeleteUser = async (user) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario? Esta acción es irreversible.")) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/deleteUser/${user.id}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.statusCode === 200) {
                alert(data.statusMessage);
                refreshList();
            } else {
                alert(`Error: ${data.statusMessage}`);
            }
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            alert("Fallo la conexión con el servidor.");
        }
    };
    
    // --- FIN LÓGICA DE ADMINISTRACIÓN ---
    
    if (!customers || customers.length === 0) {
        return (
            <p style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '5px' }}>
                No se encontraron usuarios.
            </p>
        );
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={tableStyles.table}>
                <thead>
                    <tr>
                        <th style={tableStyles.th}>ID</th>
                        <th style={tableStyles.th}>Nombre Completo</th>
                        <th style={tableStyles.th}>Email</th>
                        <th style={tableStyles.th}>Rol Actual</th>
                        <th style={tableStyles.th}>Billetera (Saldo)</th>
                        <th style={tableStyles.th}>Acciones de Admin</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map(customer => (
                        // 🔑 CORRECCIÓN 1: Asegura la key única (customer.Id)
                        <tr key={customer.id}> 
                            {/* 🔑 CORRECCIÓN 2: Usar PascalCase (Id, Name, LastName, Email, Type, Fund) */}
                            <td style={tableStyles.td}>{customer.id}</td>
                            <td style={tableStyles.td}>{customer.name} {customer.lastName}</td> 
                            <td style={tableStyles.td}>{customer.email}</td>
                            <td style={tableStyles.td}>
                                <strong>{customer.type || 'Cliente'}</strong>
                            </td>
                            <td style={tableStyles.td}>
                                COP {(customer.fund ?? 0).toFixed(2)}
                            </td>
                            <td style={{...tableStyles.td, ...tableStyles.actionCell}}>
                                {/* Botón Cambiar Rol */}
                                <button onClick={() => handleRoleChange(customer)} style={{...tableStyles.button, ...tableStyles.roleButton}}>
                                    {customer.type === 'Admin' ? 'A User' : 'A Admin'}
                                </button>
                                
                                {/* Botón Añadir Fondos */}
                                <button onClick={() => handleAddFunds(customer)} style={{...tableStyles.button, ...tableStyles.fundButton}}>
                                    Añadir Fondos
                                </button>
                                
                                {/* Botón Eliminar Usuario */}
                                <button onClick={() => handleDeleteUser(customer)} style={{...tableStyles.button, backgroundColor: '#dc3545', color: 'white'}}>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


// =======================================================
// COMPONENTE PRINCIPAL (CustomerList)
// =======================================================

export default function CustomerList() {
    
    const [customerList, setCustomerList] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);     
    const [error, setError] = useState(null);           
    const navigate = useNavigate();

    const handleGoBack = () => {
        // 🔑 Navegar a la ruta raíz (dashboard o home)
        navigate('/admin/dashboard'); 
    };
    
   const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
        const response = await fetch(USER_LIST_URL);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json(); 

        if (data.statusCode === 200) {
            // 🔑 CORRECCIÓN CLAVE: Usar data.listUsers (camelCase) como confirmaste
            setCustomerList(data.listUsers || []); 
        } else {
            throw new Error(data.statusMessage || "Fallo en la lógica de negocio del servidor.");
        }
        
    } catch (err) {
        console.error("Error al cargar usuarios:", err);
        setError(err.message || "Fallo al conectar con el servidor.");
    } finally {
        setIsLoading(false);
    }
};
    
    useEffect(() => {
        fetchCustomers();
    }, []); 
    
    return (
        <div style={styles.container}>

            <button 
                onClick={handleGoBack}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginBottom: '20px' 
                }}
            >
                ← Regresar al Dashboard
            </button>
            
            <h1>Gestión de Clientes y Usuarios 👤</h1>
            
            {isLoading && <p>Cargando lista de usuarios...</p>}
            
            {error && <p style={{ color: 'red' }}>Error al cargar: {error}</p>}
            
            {!isLoading && !error && (
                <CustomerTable 
                    customers={customerList} 
                    refreshList={fetchCustomers}
                />
            )}
        </div>
    );
}