import React, { useEffect, useState } from 'react';
import Card from './Card';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import apiService from '../services/apiService';
import '../Card.css';

const AdminDashboard = () => {
  const [images, setImages] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchImages();
  }, [sortOrder]);

  const fetchImages = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.getImages();
      const sortedImages = sortImages(response.data, sortOrder);
      setImages(sortedImages);
    } catch (error) {
      console.error('Error al obtener las imágenes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sortImages = (images, order) => {
    return images.sort((a, b) => order === 'desc' 
      ? new Date(b.date) - new Date(a.date) 
      : new Date(a.date) - new Date(b.date));
  };

  const handleSortOrderChange = () => {
    setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la imagen con ID "${imageId}"?`)) {
      return;
    }

    setDeleteLoading(imageId);
    
    try {
      await apiService.deleteImage(imageId);
      setImages(images.filter(image => image.id !== imageId));
      
      // Mostrar mensaje de éxito
      alert('Imagen eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      alert(`Error al eliminar la imagen: ${error.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleRetry = () => {
    fetchImages();
  };

  const handleDismissError = () => {
    setError('');
  };

  if (loading) {
    return <LoadingSpinner message="Cargando imágenes..." />;
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Panel de Administrador</h2>
      
      <button className="sort-button" onClick={handleSortOrderChange}>
        Ordenar por fecha ({sortOrder === 'desc' ? 'Más reciente primero' : 'Más antigua primero'})
      </button>
      
      <ErrorMessage 
        error={error}
        onRetry={handleRetry}
        onDismiss={handleDismissError}
        showRetry={true}
        showDismiss={true}
      />
      
      <div className="card-container">
        {images.length === 0 && !error ? (
          <div className="no-images-message">
            <p>No hay imágenes disponibles</p>
          </div>
        ) : (
          images.map((image) => (
            <Card 
              key={image.id} 
              date={image.date} 
              imageUrl={image.url} 
              buttonText="Eliminar" 
              onDelete={() => handleDelete(image.id)}
              isLoading={deleteLoading === image.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
