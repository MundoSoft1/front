import React from 'react';
import '../Card.css';

const Card = ({ date, imageUrl, buttonText, onDelete }) => {
  // Formatear la fecha
  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="card">
      <img src={imageUrl} alt="Imagen" className="card-image" />
      <div className="card-info">
        <p className="card-date">{formattedDate}</p>
        <button className="delete-button" onClick={onDelete}>{buttonText}</button>
      </div>
    </div>
  );
};

export default Card;
