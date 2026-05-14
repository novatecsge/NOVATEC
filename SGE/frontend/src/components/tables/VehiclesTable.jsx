import React from 'react';
import EmptyState from '../common/EmptyState';

export default function VehiclesTable({ vehicles = [] }) {
  if (vehicles.length === 0) {
    return (
      <EmptyState
        title="Sin vehículos"
        description="Todavía no has registrado ningún vehículo."
      />
    );
  }

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th>Placa</th>
          <th>Tipo</th>
          <th>Marca</th>
          <th>Modelo</th>
          <th>Color</th>
          <th>Año</th>
        </tr>
      </thead>
      <tbody>
        {vehicles.map((vehicle) => (
          <tr key={vehicle.id}>
            <td>{vehicle.plate}</td>
            <td>{vehicle.vehicleType}</td>
            <td>{vehicle.brand}</td>
            <td>{vehicle.model}</td>
            <td>{vehicle.color}</td>
            <td>{vehicle.year}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff'
  }
};
