import React, { useEffect, useCallback, useMemo } from 'react';
import Card from './Card';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import apiService from '../services/apiService';
import useStateOptimized from '../hooks/useStateOptimized';
import '../Card.css';

const AdminDashboard = () => {
  // Estados optimizados
  const { 
    state: images, 
    removeFromArrayByCondition,
    updateArray 
  } = useStateOptimized([]);
  
  const { state: sortOrder, setState: setSortOrder } = useStateOptimized('desc');
  const { state: loading, setState: setLoading } = useStateOptimized(true);
  const { state: error, setState: setError } = useStateOptimized('');
  const { state: deleteLoading, setState: setDeleteLoading } = useStateOptimized(null);

  // Función optimizada para obtener imágenes
  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.getImages();
      const sortedImages = sortImages(response.data, sortOrder);
      updateArray(() => sortedImages);
    } catch (error) {
      console.error('Error al obtener las imágenes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [sortOrder, setLoading, setError, updateArray]);

  // Función optimizada para ordenar imágenes
  const sortImages = useCallback((images, order) => {
    return [...images].sort((a, b) => order === 'desc' 
      ? new Date(b.date) - new Date(a.date) 
      : new Date(a.date) - new Date(a.date));
  }, []);

  // Función optimizada para cambiar orden
  const handleSortOrderChange = useCallback(() => {
    setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
  }, [setSortOrder]);

  // Función optimizada para eliminar imagen
  const handleDelete = useCallback(async (imageId) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la imagen con ID "${imageId}"?`)) {
      return;
    }

    setDeleteLoading(imageId);
    
    try {
      await apiService.deleteImage(imageId);
      removeFromArrayByCondition(image => image.id !== imageId);
      
      // Mostrar mensaje de éxito
      alert('Imagen eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      alert(`Error al eliminar la imagen: ${error.message}`);
    } finally {
      setDeleteLoading(null);
    }
  }, [setDeleteLoading, removeFromArrayByCondition]);

  // Función optimizada para reintentar
  const handleRetry = useCallback(() => {
    fetchImages();
  }, [fetchImages]);

  // Función optimizada para descartar error
  const handleDismissError = useCallback(() => {
    setError('');
  }, [setError]);

  // Efecto optimizado para cargar imágenes
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Efecto optimizado para reordenar cuando cambia el orden
  useEffect(() => {
    if (images.length > 0) {
      const sortedImages = sortImages(images, sortOrder);
      updateArray(() => sortedImages);
    }
  }, [sortOrder, images, sortImages, updateArray]);

  // Estado calculado para el botón de orden
  const sortButtonText = useMemo(() => {
    return `Ordenar por fecha (${sortOrder === 'desc' ? 'Más reciente primero' : 'Más antigua primero'})`;
  }, [sortOrder]);

  // Estado calculado para verificar si hay imágenes
  const hasImages = useMemo(() => {
    return images.length > 0;
  }, [images]);

  if (loading) {
    return <LoadingSpinner message="Cargando imágenes..." />;
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Panel de Administrador</h2>
      
      <button className="sort-button" onClick={handleSortOrderChange}>
        {sortButtonText}
      </button>
      
      <ErrorMessage 
        error={error}
        onRetry={handleRetry}
        onDismiss={handleDismissError}
        showRetry={true}
        showDismiss={true}
      />
      
      <div className="card-container">
        {!hasImages && !error ? (
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
