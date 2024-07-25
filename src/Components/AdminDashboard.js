import React, { useEffect, useState } from 'react';
import Card from './Card';
import Swal from 'sweetalert2';
import '../Card.css';
import axios from 'axios';

const AdminDashboard = () => {
  const [images, setImages] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' para descendente, 'asc' para ascendente

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('https://54.173.247.52/images'); // Ajusta la URL según tu configuración
        const sortedImages = sortImages(response.data.data, sortOrder);
        setImages(sortedImages); // Ajusta la ruta a los datos según la respuesta de tu API
      } catch (error) {
        console.error('Error al obtener las imágenes:', error);
      }
    };

    fetchImages();
  }, [sortOrder]); // Vuelve a ejecutar si sortOrder cambia

  const sortImages = (images, order) => {
    return images.sort((a, b) => order === 'desc' 
      ? new Date(b.date) - new Date(a.date) 
      : new Date(a.date) - new Date(b.date));
  };

  const handleSortOrderChange = () => {
    setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
  };

  const handleDelete = (imageId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar la tarjeta con ID "${imageId}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://54.173.247.52/image/${imageId}`); // Ajusta la URL según tu configuración
          setImages(images.filter(image => image.id !== imageId)); // Actualiza el estado eliminando la imagen
          Swal.fire(
            'Eliminada!',
            `La tarjeta con ID "${imageId}" ha sido eliminada.`,
            'success'
          );
        } catch (error) {
          console.error('Error al eliminar la imagen:', error);
          Swal.fire(
            'Error!',
            'No se pudo eliminar la tarjeta.',
            'error'
          );
        }
      }
    });
  };

  return (
    <div>
      <h2 className="dashboard-title">Panel de Administrador</h2>
      <button className="sort-button" onClick={handleSortOrderChange}>
        Ordenar por fecha ({sortOrder === 'desc' ? 'Más reciente primero' : 'Más antigua primero'})
      </button>
      <div className="card-container">
        {images.map((image) => (
          <Card 
            key={image.id} 
            date={image.date} 
            imageUrl={image.url} 
            buttonText="Eliminar" 
            onDelete={() => handleDelete(image.id)} 
          />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
