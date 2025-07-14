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
      <img src={imageUrl} alt="Imagen" />
      <div className="card-content">
        <h3 className="card-title">Imagen capturada</h3>
        <span className="card-date">{formattedDate}</span>
        <button className="card-button" onClick={onDelete}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Card;
