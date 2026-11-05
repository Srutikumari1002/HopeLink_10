import React from 'react';

export default function Toast({ message, type }) {
  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-triangle-exclamation';

  return (
    <div className={`toast ${type}`}>
      <i className={`fa-solid ${icon}`}></i>
      <span>{message}</span>
    </div>
  );
}
