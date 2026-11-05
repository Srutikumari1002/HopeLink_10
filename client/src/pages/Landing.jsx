import React from 'react';

export default function Landing({ onStartPledge, onStartSearch }) {
  return (
    <main id="landing-view" className="view-section active">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-glow"></div>
        <div className="container hero-grid">
          <div className="hero-text">
            <div className="badge">
              <i className="fa-solid fa-shield-heart"></i> Save Lives, Leave a Legacy
            </div>
            <h1>Be the Hope. <br />Pledge to <span>Donate Organs</span> Today.</h1>
            <p>HopeLink is India's premium digital gateway connecting donors, hospitals, and transplant seekers. Secure your digital pledge card, lookup live organ banks, and make checkup appointments in under 3 minutes.</p>
            <div class="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={onStartPledge}>
                Pledge Your Organs <i className="fa-solid fa-arrow-right"></i>
              </button>
              <button className="btn btn-secondary btn-lg" onClick={onStartSearch}>
                Find Hospitals <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-card glass">
              <div className="card-pulse"></div>
              <i className="fa-solid fa-heart-pulse visual-icon"></i>
              <div className="visual-stats">
                <div className="stat-item">
                  <span className="num">12,450+</span>
                  <span className="label">Pledges Registered</span>
                </div>
                <div className="stat-item">
                  <span className="num">4,810+</span>
                  <span className="label">Lives Reborn</span>
                </div>
              </div>
            </div>
            <div className="visual-card-mini card-left glass">
              <i className="fa-solid fa-truck-medical text-teal"></i>
              <div>
                <h4>Emergency Response</h4>
                <p>Active Dispatch Channels</p>
              </div>
            </div>
            <div className="visual-card-mini card-right glass">
              <i className="fa-solid fa-hospital text-emerald"></i>
              <div>
                <h4>5 Major Centers</h4>
                <p>Live Interlinked Data</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Blocks */}
      <section className="info-section">
        <div className="container text-center">
          <h2>How HopeLink Transforms Healthcare Coordination</h2>
          <p className="section-subtitle">Real-time matching, certified hospital appointments, and secure legal pledge management.</p>
          <div className="info-grid">
            <div className="info-card">
              <div className="icon-box color-teal"><i class="fa-solid fa-file-contract"></i></div>
              <h3>Legal Pledge Registration</h3>
              <p>Fill out the pre-death organ consent securely. Generate a certified digital Pledge Card and legal donation receipts instantly.</p>
            </div>
            <div className="info-card">
              <div className="icon-box color-emerald"><i class="fa-solid fa-map-location-dot"></i></div>
              <h3>Intelligent Proximity Search</h3>
              <p>Search using coordinate-distance calculations. Locate the nearest interlinked medical center stocking organs or matching profiles.</p>
            </div>
            <div className="info-card">
              <div className="icon-box color-red"><i class="fa-solid fa-triangle-exclamation"></i></div>
              <h3>Urgent Dispatch Line</h3>
              <p>In critical emergencies, trigger immediate, high-priority notifications across local hospitals to locate matching organ reserves.</p>
            </div>
            <div className="info-card">
              <div className="icon-box color-indigo"><i class="fa-solid fa-calendar-check"></i></div>
              <h3>Pre-Checkup Appointments</h3>
              <p>Book checkups and suitability tests easily. Get verified booking confirmation slips in PDF to skip hospital queues.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
