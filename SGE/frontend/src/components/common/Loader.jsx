import React from 'react';
export default function Loader({ text = 'Cargando...' }) {
  return (
    <div className="loader-screen">
      <div className="loader-card"><span className="loader-spinner" />{text}</div>
    </div>
  );
}
