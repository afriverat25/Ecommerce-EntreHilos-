import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://localhost:7144';

// Componente que maneja la adición y edición de productos
export default function AddProductForm({ initialData, closeModal, refreshList }) {
    
    const isEditing = initialData && initialData.id > 0; 
    const modalTitle = isEditing ? "✏️ Editar Producto" : "➕ Agregar Nuevo Producto";
    
    const productTypes = ['Crochet', 'Amigurumi', 'Patrones', 'Herramientas'];
    
    const [product, setProduct] = useState({
        id: initialData?.id || 0,
        name: initialData?.name || '',
        description: initialData?.description || '',
        unitePrice: initialData?.unitePrice || 0,
        discount: initialData?.discount || 0,
        stoke: initialData?.stoke || 0, 
        type: initialData?.type || productTypes[0],
        imgUrl: initialData?.imgUrl || '',
    });
    const [selectedFile, setSelectedFile] = useState(null);
    // 🔑 NUEVO ESTADO: Para guardar la URL de la imagen seleccionada localmente
    const [previewImage, setPreviewImage] = useState(null); 
    const [message, setMessage] = useState('');

    // Sincronizar el estado al abrir el modal
    useEffect(() => {
        if (initialData) {
            setProduct({
                id: initialData.id,
                name: initialData.name,
                description: initialData.description,
                unitePrice: initialData.unitePrice,
                discount: initialData.discount,
                stoke: initialData.stoke,
                type: initialData.type || productTypes[0],
                imgUrl: initialData.imgUrl,
            });
            setSelectedFile(null);
            setPreviewImage(null); // Limpiar la previsualización al cambiar de modo
            setMessage('');
        }
    }, [initialData]);


    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setProduct(prev => ({
            ...prev,
            // 🔑 CORRECCIÓN: Manejar el input como string para evitar errores de NaN en el estado,
            // pero convertir a número para lógica interna si es necesario (el envío lo hará toString())
            [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        
        // 🔑 CORRECCIÓN 1: VISTA PREVIA DE LA IMAGEN
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        } else {
            setPreviewImage(null);
        }
    };
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!isEditing && !selectedFile) {
            setMessage("Debe seleccionar un archivo de imagen para un producto nuevo.");
            return;
        }

        const formData = new FormData();
        
        // 🚨 CRÍTICO: Asegurarse que todos los valores numéricos se envíen como cadenas.
        
        formData.append('ID', product.id.toString()); 
        formData.append('Name', product.name);
        formData.append('Description', product.description);
        
        // 🔑 CORRECCIÓN 2: Asegurar la conversión a string para los números antes de enviarlos.
        // Aunque parseFloat ya lo hizo en handleChange, toString() es más explícito para FormData.
        formData.append('UnitePrice', product.unitePrice.toString()); 
        formData.append('Discount', product.discount.toString()); 
        
        formData.append('Stoke', product.stoke.toString());
        formData.append('Type', product.type); 

        // Archivo
        if (selectedFile) {
            formData.append('ImageFile', selectedFile); 
        } 

        const apiURL = `${API_BASE_URL}/api/Admin/addUpdateProductWithFile`; 

        try {
            const response = await fetch(apiURL, {
                method: 'POST', 
                body: formData, 
            });

            if (!response.ok) {
                const errorText = await response.text(); 
                let errorMessage = `Error HTTP ${response.status}: ${errorText || 'Error desconocido.'}`;
                
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.errors) {
                        errorMessage = "Fallo en la validación: " + Object.values(errorJson.errors).flat().join(' | ');
                    }
                } catch (e) {}

                throw new Error(errorMessage);
            }
            
            const data = await response.json();

            if (data.statusCode === 200) {
                alert(data.statusMessage);
                refreshList();
            } else {
                setMessage(`Error del Backend: ${data.statusMessage}`);
            }

        } catch (error) {
            console.error("Error al intentar guardar el producto:", error);
            setMessage(`Error al intentar guardar el producto: ${error.message}`);
        }
    };


    // 🔑 Determinar qué imagen mostrar
    const currentImageSource = previewImage 
        ? previewImage // Muestra el archivo local seleccionado
        : (isEditing && product.imgUrl) 
            ? `${API_BASE_URL}${product.imgUrl}` // Muestra la URL existente
            : null; // No muestra nada

    return (
        <div style={styles.formContainer}>
            <h2>{modalTitle}</h2>
            {message && <p style={styles.message}>{message}</p>}
            
            <form onSubmit={handleSubmit} style={styles.form}>
                
                <input type="hidden" name="id" value={product.id} />
                
                <label>Nombre:</label>
                <input type="text" name="name" value={product.name} onChange={handleChange} required style={styles.input} />

                <label>Tipo/Categoría:</label>
                <select name="type" value={product.type} onChange={handleChange} required style={styles.input}>
                    {productTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                <label>Descripción:</label>
                <textarea name="description" value={product.description} onChange={handleChange} required style={styles.textarea} />
                
                {/* 🔑 INPUTS NUMÉRICOS: Usar value.toString() o asegurar que el valor sea numérico */}
                <label>Precio Unitario:</label>
                <input 
                    type="number" 
                    name="unitePrice" 
                    value={product.unityPrice} // Ya es numérico/float en el estado
                    onChange={handleChange} 
                    required 
                    min="0" 
                    step="0.01" 
                    style={styles.input} 
                />

                <label>Descuento (%):</label>
                <input 
                    type="number" 
                    name="discount" 
                    value={product.discount} // Ya es numérico/float en el estado
                    onChange={handleChange} 
                    min="0" 
                    max="100" 
                    style={styles.input} 
                />
                
                <label>Stock (Unidades):</label>
                <input type="number" name="stoke" value={product.stoke} onChange={handleChange} required min="0" style={styles.input} />

                {/* 🔑 CORRECCIÓN 1: Mostrar Previsualización */}
                {(currentImageSource) && (
                    <div style={styles.imagePreview}>
                        <p>{previewImage ? "Vista Previa:" : "Imagen Actual:"}</p>
                        <img src={currentImageSource} alt="Imagen del Producto" style={styles.img} />
                    </div>
                )}
                
                <label>Subir Imagen {isEditing ? "(Opcional para cambiar)" : ""}:</label>
                <input type="file" onChange={handleFileChange} style={styles.fileInput} />

                <div style={styles.buttonGroup}>
                    <button type="submit" style={styles.submitButton}>
                        💾 {isEditing ? "Guardar Cambios" : "Agregar Producto"}
                    </button>
                    <button type="button" onClick={closeModal} style={styles.cancelButton}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

// Estilos (mantener los mismos, solo ajustando el mensaje de error para mejor visibilidad)
const styles = {
    formContainer: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px' },
    input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' },
    textarea: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' },
    buttonGroup: { display: 'flex', justifyContent: 'space-between', marginTop: '15px' },
    submitButton: { padding: '10px 15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    cancelButton: { padding: '10px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    message: { padding: '10px', backgroundColor: '#f39c12', color: 'white', borderRadius: '4px', fontWeight: 'bold' },
    imagePreview: { marginBottom: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' },
    img: { width: '100px', height: '100px', objectFit: 'cover' },
};