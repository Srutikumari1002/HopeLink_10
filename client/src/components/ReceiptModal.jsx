import React from 'react';

export default function ReceiptModal({ isOpen, onClose, type, data, user }) {
  if (!isOpen || !data) return null;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'show' : ''}`}>
      <div className="modal-card glass">
        <div className="modal-header">
          <h3><i className="fa-solid fa-print"></i> Document Verification Receipt</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body-printable" id="printable-document-content">
          {type === 'pledge' ? (
            <div className="receipt-box">
              <div className="receipt-header">
                <div className="receipt-logo"><i className="fa-solid fa-heart-pulse"></i> HopeLink</div>
                <p>Certified Organ Donation Registry of India</p>
                <p>Project interlink: National Transplant Commission</p>
              </div>
              <h2 className="receipt-title">Official Legacy Pledge Card & Receipt</h2>

              <div className="receipt-row">
                <span className="lbl">Unique Registry ID</span>
                <span className="val" style={{ fontFamily: 'monospace' }}>
                  HL-DN-{data._id ? data._id.toString().substring(18).toUpperCase() : '000000'}
                </span>
              </div>
              <div className="receipt-row">
                <span className="lbl">Date of Registration</span>
                <span className="val">
                  {data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  }) : new Date().toLocaleDateString('en-US')}
                </span>
              </div>
              <div className="receipt-row">
                <span className="lbl">Pledging Donor Full Name</span>
                <span className="val">{user ? user.name : 'Donor Name'}</span>
              </div>
              <div className="receipt-row">
                <span className="lbl">Donor Email Contact</span>
                <span className="val">{user ? user.email : 'Donor Email'}</span>
              </div>
              <div className="receipt-row">
                <span className="lbl">Consented Organs</span>
                <span className="val" style={{ color: '#0d9488' }}>
                  {data.organs ? data.organs.join(', ') : 'None'}
                </span>
              </div>
              <div className="receipt-row">
                <span className="lbl">Emergency Representative</span>
                <span className="val">{data.emergencyContactName}</span>
              </div>
              <div className="receipt-row">
                <span className="lbl">Representative Direct Contact</span>
                <span className="val">{data.emergencyContactPhone}</span>
              </div>
              <div className="receipt-row">
                <span className="lbl">Legal Status</span>
                <span className="val" style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '4px' }}>
                  ACTIVE DECLARED
                </span>
              </div>

              <div className="receipt-footer-stamp">
                <div className="receipt-uid">Generated: {dateFormatted}</div>
                <div style={{ textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#4b5563' }}>
                  <i className="fa-solid fa-signature"></i> National Registry Seal
                </div>
              </div>
              <div className="receipt-watermark">
                <i className="fa-solid fa-shield-halved"></i> Save this PDF/Slip. Present to medical authority if requested.
              </div>
            </div>
          ) : (
            <div className="receipt-box">
              <div className="receipt-header">
                <div className="receipt-logo"><i className="fa-solid fa-heart-pulse"></i> HopeLink</div>
                <p>Interlinked Hospital Appointment Booking Voucher</p>
              </div>
              <h2 className="receipt-title">Clinic Access Consultation Ticket</h2>

              <div className="receipt-row">
                <span className="lbl">Access Booking Reference</span>
                <span className="val" style={{ fontFamily: 'monospace' }}>
                  HL-AP-{data.appointmentId ? data.appointmentId.substring(18).toUpperCase() : (data._id ? data._id.toString().substring(18).toUpperCase() : '000000')}
                </span>
              </div>
              <div className="receipt-row">
                <span className="lbl">Assigned Health Center</span>
                <span className="val">{data.hospital_name || (data.hospital ? data.hospital.name : 'Selected Hospital')}</span>
              </div>
              <div className="receipt-row">
                <span className="lbl">Hospital Location Address</span>
                <span className="val">{data.hospital_address || (data.hospital ? data.hospital.address : 'Registered Address')}</span>
              </div>
              <div className="receipt-row">
                <span className="lbl">Assigned Doctor Specialty</span>
                <span className="val" style={{ color: '#0d9488' }}>
                  {data.doctorName}
                </span>
              </div>
              <div className="receipt-row">
                <span className="lbl">Scheduled Appointment Date</span>
                <span className="val" style={{ fontWeight: 800 }}>
                  {data.appointmentDate ? new Date(data.appointmentDate).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
                  }) : ''}
                </span>
              </div>
              <div className="receipt-row">
                <span className="lbl">Scheduled Time Slot</span>
                <span className="val" style={{ fontWeight: 800 }}>{data.appointmentTime}</span>
              </div>
              <div className="receipt-row">
                <span className="lbl">Appointment Diagnostic Purpose</span>
                <span className="val">{data.reason}</span>
              </div>
              <div className="receipt-row">
                <span className="lbl">Check-In Queue Ticket Status</span>
                <span className="val" style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '4px' }}>
                  CONFIRMED SEAT
                </span>
              </div>

              <div className="receipt-footer-stamp">
                <div className="receipt-uid">Issued: {dateFormatted}</div>
                <div style={{ textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#4b5563' }}>
                  <i className="fa-solid fa-calendar-check"></i> Clinic Dispatch stamp
                </div>
              </div>
              <div className="receipt-watermark">
                <i className="fa-solid fa-qrcode"></i> Present this coupon code slip at the counter 15 mins prior.
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close Window</button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <i className="fa-solid fa-download"></i> Print / Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
