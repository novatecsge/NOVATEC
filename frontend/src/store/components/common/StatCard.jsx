import React from 'react';
export default function StatCard({ title, value }) {
  return (
    <div style={styles.card}>
      <div style={styles.title}>{title}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: 12,
    padding: 16,
    background: '#fff'
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555'
  },
  value: {
    fontSize: 24,
    fontWeight: 700
  }
};
