import React from 'react';

export default function DonorCard({ pledge, user, onViewReceipt }) {
  if (!pledge) return null;

  const organsHtml = pledge.organs.map((o, idx) => (
    <span key={idx} className="organ-badge">{o}</span>
  ));
  
  const dateStr = new Date(pledge.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Create a nice looking unique serial number from pledge ID
  const serialNum = `HL-DN-${pledge._id ? pledge._id.toString().substring(18).toUpperCase() : '000000'}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div className="donor-id-card">
        <div className="id-glow"></div>
        <div className="id-header">
          <div className="id-header-title">
            <i className="fa-solid fa-shield-heart"></i>
            <span>HEALING LEGACY</span>
          </div>
          <div className="id-header-badge">CERTIFIED</div>
        </div>
        <div className="id-body">
          <div className="id-avatar">
            <i className="fa-solid fa-ribbon"></i>
          </div>
          <div className="id-details">
            <div className="id-field">
              <span className="label">Donor Name</span>
              <span className="val">{user ? user.name : 'Unknown User'}</span>
            </div>
            <div className="id-field">
              <span className="label">Pledged Organs</span>
              <div className="organs-badges-row">
                {organsHtml}
              </div>
            </div>
            <div className="id-field">
              <span className="label">Emergency Contact</span>
              <span className="val">{pledge.emergencyContactName}</span>
            </div>
          </div>
        </div>
        <div className="id-footer">
          <span className="id-serial">{serialNum}</span>
          <span className="id-serial">{dateStr}</span>
        </div>
      </div>
      <div className="id-actions">
        <button className="btn btn-secondary btn-sm" onClick={onViewReceipt}>
          <i className="fa-solid fa-file-invoice"></i> View Pledge Receipt
        </button>
        <button className="btn btn-teal btn-sm" onClick={onViewReceipt}>
          <i className="fa-solid fa-download"></i> Save Donor Card
        </button>
      </div>
    </div>
  );
}
