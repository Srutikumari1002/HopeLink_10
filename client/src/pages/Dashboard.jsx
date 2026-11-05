import React, { useState, useEffect } from 'react';
import DonorCard from '../components/DonorCard';
import { API_BASE } from '../config';

export default function Dashboard({ user, token, addToast, onViewReceipt, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'overview');
  const [hospitals, setHospitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pledge, setPledge] = useState(null);
  
  // Location coordinates (defaults to Bengaluru central)
  const [userLat, setUserLat] = useState(12.9716);
  const [userLng, setUserLng] = useState(77.5946);
  const [locationSelect, setLocationSelect] = useState('12.9716,77.5946');
  
  // Finder filters
  const [organFilter, setOrganFilter] = useState('ALL');
  
  // Pledge form fields
  const [pledgedOrgans, setPledgedOrgans] = useState([]);
  const [pledgeEmergencyName, setPledgeEmergencyName] = useState('');
  const [pledgeEmergencyPhone, setPledgeEmergencyPhone] = useState('');
  const [pledgeAgreement, setPledgeAgreement] = useState(false);

  // Appointment form fields
  const [apptHospital, setApptHospital] = useState('');
  const [apptDoctor, setApptDoctor] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [apptReason, setApptReason] = useState('Donor Suitability Diagnostic');

  // Emergency form fields
  const [emergOrgan, setEmergOrgan] = useState('');
  const [emergBlood, setEmergBlood] = useState('');
  const [emergHospital, setEmergHospital] = useState('');
  const [emergUrgency, setEmergUrgency] = useState('CRITICAL_LIFE_SUPPORT');
  const [emergPhone, setEmergPhone] = useState('');
  const [emergAgreement, setEmergAgreement] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState(false);

  // Load dashboard data on mount or token change
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, userLat, userLng]);

  // Sync activeTab if defaultTab changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const fetchDashboardData = async () => {
    await Promise.all([
      fetchHospitals(),
      fetchAppointments(),
      fetchPledge()
    ]);
  };

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/hospitals?lat=${userLat}&lng=${userLng}`);
      if (!res.ok) throw new Error('Failed to load hospitals');
      const data = await res.json();
      setHospitals(data);
    } catch (err) {
      console.error(err);
      addToast('Could not fetch hospitals.', 'error');
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/appointments/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load appointments');
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPledge = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/pledges/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 404) {
        setPledge(null);
        return;
      }
      if (!res.ok) throw new Error('Failed to load pledge');
      const data = await res.json();
      setPledge(data);

      // Pre-fill fields if pledge exists
      setPledgedOrgans(data.organs || []);
      setPledgeEmergencyName(data.emergencyContactName || '');
      setPledgeEmergencyPhone(data.emergencyContactPhone || '');
    } catch (err) {
      console.error(err);
    }
  };

  // Location selector change handler
  const handleLocationChange = (e) => {
    const val = e.target.value;
    setLocationSelect(val);
    const coords = val.split(',');
    setUserLat(parseFloat(coords[0]));
    setUserLng(parseFloat(coords[1]));
    addToast('Recalculating proximity distances from new position.', 'success');
  };

  // Organ checklist toggle
  const handleOrganCheckChange = (organName) => {
    if (pledgedOrgans.includes(organName)) {
      setPledgedOrgans(pledgedOrgans.filter(o => o !== organName));
    } else {
      setPledgedOrgans([...pledgedOrgans, organName]);
    }
  };

  // Pledge form submission
  const handlePledgeSubmit = async (e) => {
    e.preventDefault();
    if (pledgedOrgans.length === 0) {
      addToast('Please select at least one organ to pledge.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/pledges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          organs: pledgedOrgans,
          emergencyContactName: pledgeEmergencyName,
          emergencyContactPhone: pledgeEmergencyPhone
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to submit pledge');

      addToast(data.message, 'success');
      await fetchPledge();
      setActiveTab('overview');
      
      // Auto open receipt modal after brief delay
      setTimeout(() => {
        onViewReceipt('pledge', data.pledge || {
          createdAt: new Date(),
          organs: pledgedOrgans,
          emergencyContactName: pledgeEmergencyName,
          emergencyContactPhone: pledgeEmergencyPhone
        });
      }, 600);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Appointment form submission
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!apptHospital || !apptDoctor || !apptDate || !apptTime) {
      addToast('Please fill out all checkup fields.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hospital_id: apptHospital,
          doctor_name: apptDoctor,
          appointment_date: apptDate,
          appointment_time: apptTime,
          reason: apptReason
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Appointment booking failed');

      addToast(data.message, 'success');
      await fetchAppointments();
      setActiveTab('overview');
      
      // Fetch details of selected hospital to pass to modal
      const selectedHosp = hospitals.find(h => h._id === apptHospital) || {};

      setTimeout(() => {
        onViewReceipt('appointment', {
          appointmentId: data.appointmentId,
          hospital_name: data.hospitalName,
          hospital_address: selectedHosp.address || 'Registered Address',
          hospital_phone: selectedHosp.phone || 'Registered Phone',
          doctorName: apptDoctor,
          appointmentDate: apptDate,
          appointmentTime: apptTime,
          reason: apptReason
        });
      }, 600);

      // Reset fields
      setApptHospital('');
      setApptDoctor('');
      setApptDate('');
      setApptTime('');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Emergency form submission
  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    if (!emergOrgan || !emergBlood || !emergHospital || !emergPhone) {
      addToast('Please provide all emergency dispatch fields.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/emergencies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          organ_needed: emergOrgan,
          blood_type: emergBlood,
          hospital_id: emergHospital,
          urgency_level: emergUrgency
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to dispatch request');

      addToast(`CRITICAL PROTOCOL ACTIVATED: ${data.message}`, 'error');
      addToast(`Broadcasting matching request to local networks...`, 'info');

      // Reset emergency form fields
      setEmergOrgan('');
      setEmergBlood('');
      setEmergHospital('');
      setEmergPhone('');
      setEmergAgreement(false);

      setTimeout(() => {
        setActiveEmergency(true);
        setActiveTab('overview');
      }, 1200);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Filtered hospital list
  const filteredHospitals = organFilter === 'ALL'
    ? hospitals
    : hospitals.filter(h => h.availableOrgans.includes(organFilter));

  // Minimum date for checkups
  const getMinDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <main id="dashboard-view" className="view-section active">
      <div className="dashboard-wrapper">
        {/* Sidebar Navigation */}
        <aside className="dash-sidebar">
          <div className="dash-user-card">
            <div className="dash-avatar"><i className="fa-solid fa-house-medical"></i></div>
            <div>
              <h3>Welcome back</h3>
              <span className="user-tag">
                <i className="fa-solid fa-shield-heart text-teal"></i> Portal Active
              </span>
            </div>
          </div>
          <nav className="dash-nav">
            <button 
              className={`dash-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fa-solid fa-table-columns"></i> Dashboard Overview
            </button>
            <button 
              className={`dash-nav-btn ${activeTab === 'pledge' ? 'active' : ''}`}
              onClick={() => setActiveTab('pledge')}
            >
              <i className="fa-solid fa-heart-circle-check"></i> Organ Pledge Form
            </button>
            <button 
              className={`dash-nav-btn ${activeTab === 'hospitals' ? 'active' : ''}`}
              onClick={() => setActiveTab('hospitals')}
            >
              <i className="fa-solid fa-magnifying-glass-location"></i> Hospital & Donor Finder
            </button>
            <button 
              className={`dash-nav-btn ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              <i className="fa-solid fa-calendar-check"></i> Book Appointment
            </button>
            <button 
              className={`dash-nav-btn btn-danger-sidebar ${activeTab === 'emergency' ? 'active' : ''}`}
              onClick={() => setActiveTab('emergency')}
            >
              <i className="fa-solid fa-triangle-exclamation"></i> Emergency Request
            </button>
          </nav>
        </aside>

        {/* Dashboard Main Content Area */}
        <section className="dash-content">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="dash-tab-content active">
              <div className="dash-header">
                <div>
                  <h2>Control Center Overview</h2>
                  <p>Monitor your active medical profiles, upcoming healthcare appointments, and organ pledges.</p>
                </div>
                <div className="live-clock">
                  <i className="fa-solid fa-clock-rotate-left"></i> MongoDB Cloud interlink active
                </div>
              </div>

              {/* Stats Summary row */}
              <div className="stats-row">
                <div className="stat-card glass">
                  <div className="stat-header">
                    <span>Pledge Status</span>
                    <i className="fa-solid fa-heart-circle-check text-teal"></i>
                  </div>
                  <h3 style={{ color: pledge ? '#2dd4bf' : 'var(--text-secondary)' }}>
                    {pledge ? 'Active Legacy' : 'Not Registered'}
                  </h3>
                  <p className="sub">{pledge ? 'Digital ID card generated' : 'Support the community'}</p>
                </div>
                <div className="stat-card glass">
                  <div className="stat-header">
                    <span>Appointments Scheduled</span>
                    <i className="fa-solid fa-calendar text-emerald"></i>
                  </div>
                  <h3>{appointments.length} Booking{appointments.length === 1 ? '' : 's'}</h3>
                  <p className="sub">Active checkups list</p>
                </div>
                <div className="stat-card glass">
                  <div className="stat-header">
                    <span>Emergency Broadcasts</span>
                    <i className="fa-solid fa-truck-medical text-red"></i>
                  </div>
                  <h3 style={{ color: activeEmergency ? 'var(--color-red)' : 'inherit' }}>
                    {activeEmergency ? 'Active Critical' : 'No Alerts'}
                  </h3>
                  <p className="sub">{activeEmergency ? 'Searching match for patient' : 'Active urgent requests'}</p>
                </div>
              </div>

              {/* Dynamic Overview Cards Grid */}
              <div className="overview-grid">
                {/* Pledge ID card */}
                <div className="grid-card glass">
                  <h3>Your Certified Donation Card</h3>
                  <p className="card-desc">Upon complete pledge registration, your legal donor ID is live-rendered here.</p>
                  
                  {pledge ? (
                    <DonorCard 
                      pledge={pledge} 
                      user={user} 
                      onViewReceipt={() => onViewReceipt('pledge', pledge)}
                    />
                  ) : (
                    <div className="card-empty-state">
                      <i className="fa-solid fa-heart-circle-plus"></i>
                      <p>You haven't pledged your organs yet.</p>
                      <button className="btn btn-teal btn-sm" onClick={() => setActiveTab('pledge')}>
                        Register Donation Pledge Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Appointments list */}
                <div className="grid-card glass">
                  <h3>Upcoming Clinic Checkups</h3>
                  <p className="card-desc">Show this dynamic booking card at the hospital check-in counter.</p>
                  
                  <div className="appointments-list-wrapper">
                    {appointments.length > 0 ? (
                      appointments.map((a, idx) => {
                        const dateForm = new Date(a.appointmentDate).toLocaleDateString('en-US', {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        });
                        return (
                          <div key={idx} className="appt-card-wrapper">
                            <div className="appt-item-header">
                              <h4>{a.hospital_name}</h4>
                              <span className="appt-status-tag">{a.status}</span>
                            </div>
                            <div className="appt-body-info">
                              <div><i className="fa-solid fa-user-doctor"></i> {a.doctorName}</div>
                              <div><i className="fa-solid fa-calendar"></i> {dateForm}</div>
                              <div><i className="fa-solid fa-clock"></i> {a.appointmentTime}</div>
                              <div><i className="fa-solid fa-circle-question"></i> {a.reason}</div>
                            </div>
                            <div className="appt-actions">
                              <button className="btn btn-secondary btn-sm" onClick={() => onViewReceipt('appointment', a)}>
                                <i className="fa-solid fa-print"></i> Get Ticket
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="list-empty-state">
                        <i className="fa-solid fa-calendar-plus"></i>
                        <p>No appointments booked.</p>
                        <button className="btn btn-teal btn-sm" onClick={() => setActiveTab('appointments')}>
                          Schedule Clinic Checkup
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PLEDGE FORM */}
          {activeTab === 'pledge' && (
            <div className="dash-tab-content active">
              <div className="dash-header">
                <div>
                  <h2>Organ Donation Pledge Registration</h2>
                  <p>Consent securely to become an organ donor after your death. Save lives and leave a legacy of healing.</p>
                </div>
              </div>

              <div className="form-container-card glass">
                <div className="form-banner">
                  <i className="fa-solid fa-circle-info"></i>
                  <span>
                    <strong>Medical Fact:</strong> One organ donor can save up to eight lives and heal over seventy-five more through tissue donation.
                  </span>
                </div>
                <form id="pledge-form" onSubmit={handlePledgeSubmit}>
                  <div className="form-section-title">1. Choose Organs to Pledge</div>
                  <div className="organ-selector-grid">
                    {['Heart', 'Kidney', 'Liver', 'Cornea', 'Lungs', 'Pancreas'].map((o, idx) => {
                      let iconClass = 'fa-heart text-red';
                      if (o === 'Kidney') iconClass = 'fa-lungs text-teal';
                      if (o === 'Liver') iconClass = 'fa-dna text-emerald';
                      if (o === 'Cornea') iconClass = 'fa-eye text-indigo';
                      if (o === 'Lungs') iconClass = 'fa-wind text-light-blue';
                      if (o === 'Pancreas') iconClass = 'fa-flask text-purple';
                      
                      return (
                        <label key={idx} className="organ-checkbox-card">
                          <input 
                            type="checkbox" 
                            name="organs" 
                            value={o}
                            checked={pledgedOrgans.includes(o)}
                            onChange={() => handleOrganCheckChange(o)}
                          />
                          <span className="checkbox-inner">
                            <i className={`fa-solid ${iconClass}`}></i>
                            <span>{o === 'Cornea' ? 'Cornea (Eyes)' : o}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="form-section-title">2. Legal Emergency Contact Details</div>
                  <p className="section-desc" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Providing a close relative or guardian is required for consent registration authorization.
                  </p>
                  
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="pledge-emergency-name">Emergency Contact Representative Full Name</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-user-shield"></i>
                        <input 
                          type="text" 
                          id="pledge-emergency-name" 
                          required 
                          placeholder="Guardian Name" 
                          value={pledgeEmergencyName}
                          onChange={(e) => setPledgeEmergencyName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="pledge-emergency-phone">Contact Phone Number</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-phone"></i>
                        <input 
                          type="tel" 
                          id="pledge-emergency-phone" 
                          required 
                          placeholder="e.g. +91 98765 43210" 
                          value={pledgeEmergencyPhone}
                          onChange={(e) => setPledgeEmergencyPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="consent-agreement">
                    <label className="agreement-checkbox">
                      <input 
                        type="checkbox" 
                        required 
                        checked={pledgeAgreement}
                        onChange={(e) => setPledgeAgreement(e.target.checked)}
                      />
                      <span>I hereby authorize and request that after my death, my consented organs be donated for transplant or therapeutic purposes. I certify that my family has been informed of this wish.</span>
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg" id="btn-submit-pledge">
                    Register My Legacy Pledge <i className="fa-solid fa-signature"></i>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: HOSPITAL LOCATOR & SEARCH */}
          {activeTab === 'hospitals' && (
            <div className="dash-tab-content active">
              <div className="dash-header">
                <div>
                  <h2>Intelligent Nearest Hospital & Organ Search</h2>
                  <p>Locate available transplant services, check organ banks, and calculate precise distance proximity.</p>
                </div>
              </div>

              {/* Filter bar */}
              <div className="filter-bar glass">
                <div className="filter-row">
                  <div className="filter-group">
                    <label htmlFor="search-organ-type">Organ Stock Search</label>
                    <select 
                      id="search-organ-type" 
                      value={organFilter}
                      onChange={(e) => setOrganFilter(e.target.value)}
                    >
                      <option value="ALL">Show All Stock</option>
                      <option value="Kidney">Kidney Bank</option>
                      <option value="Cornea">Cornea Bank</option>
                      <option value="Liver">Liver Bank</option>
                      <option value="Heart">Heart Bank</option>
                      <option value="Lungs">Lungs Bank</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="simulated-location">Your Simulated Coordinates</label>
                    <select 
                      id="simulated-location" 
                      value={locationSelect}
                      onChange={handleLocationChange}
                    >
                      <option value="12.9716,77.5946">Central Bengaluru (MG Road - 12.9716, 77.5946)</option>
                      <option value="12.9304,77.6784">Bellandur Tech Zone (East - 12.9304, 77.6784)</option>
                      <option value="12.8399,77.6770">Electronic City Phase 1 (South - 12.8399, 77.6770)</option>
                      <option value="13.0285,77.5896">Hebbal Lake Residency (North - 13.0285, 77.5896)</option>
                    </select>
                  </div>

                  <div className="filter-group button-group-filter">
                    <button className="btn btn-teal" onClick={fetchHospitals}>
                      <i className="fa-solid fa-location-crosshairs"></i> Recalculate Distances
                    </button>
                  </div>
                </div>
              </div>

              {/* Listing grid */}
              <div className="hospital-listings-grid" id="hospitals-list-container">
                {filteredHospitals.length > 0 ? (
                  filteredHospitals.map((h, idx) => (
                    <div key={idx} className="hospital-card glass">
                      <div>
                        <div className="hosp-header">
                          <div className="hosp-title-box">
                            <h3>{h.name}</h3>
                            <span className="hosp-rating">
                              <i className="fa-solid fa-star"></i> {h.rating ? h.rating.toFixed(1) : '4.5'}
                            </span>
                          </div>
                          <span className="hosp-distance">
                            <i className="fa-solid fa-location-arrow"></i> {h.distance || '0'} km
                          </span>
                        </div>
                        
                        <div className="hosp-details" style={{ marginTop: '16px' }}>
                          <div><i className="fa-solid fa-map-pin"></i> {h.address}</div>
                          <div><i className="fa-solid fa-phone"></i> {h.phone}</div>
                        </div>
                      </div>

                      <div className="hosp-organs">
                        <span>Available Organs</span>
                        <div className="organs-badges-row">
                          {h.availableOrgans.map((o, oIdx) => (
                            <span key={oIdx} className="organ-badge">{o}</span>
                          ))}
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ flex: 1 }}
                            onClick={() => {
                              setApptHospital(h._id);
                              setActiveTab('appointments');
                            }}
                          >
                            <i className="fa-solid fa-calendar"></i> Book Clinic
                          </button>
                          <button 
                            className="btn btn-primary btn-sm" 
                            style={{ flex: 1 }}
                            onClick={() => {
                              setEmergHospital(h._id);
                              setActiveTab('emergency');
                            }}
                          >
                            <i className="fa-solid fa-phone-volume"></i> Urgent Request
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card-empty-state" style={{ gridColumn: '1 / -1' }}>
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <p>No hospitals currently stock matching donors.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: BOOK APPOINTMENT */}
          {activeTab === 'appointments' && (
            <div className="dash-tab-content active">
              <div className="dash-header">
                <div>
                  <h2>Schedule Hospital Checkup & Suitability Appointment</h2>
                  <p>Book checkups, compatibility diagnostics, or consultations directly with interlinked healthcare centers.</p>
                </div>
              </div>

              <div className="form-container-card glass">
                <form id="appointment-form" onSubmit={handleAppointmentSubmit}>
                  <div className="form-section-title">Select Hospital & Consultation Details</div>
                  
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="appointment-hospital">Select Healthcare Center</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-hospital"></i>
                        <select 
                          id="appointment-hospital" 
                          required
                          value={apptHospital}
                          onChange={(e) => setApptHospital(e.target.value)}
                        >
                          <option value="" disabled selected>Select nearest clinic...</option>
                          {hospitals.map((h, idx) => (
                            <option key={idx} value={h._id}>{h.name} ({h.distance || '0'} km away)</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="appointment-doctor">Specialty Doctor & Clinic</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-user-doctor"></i>
                        <select 
                          id="appointment-doctor" 
                          required
                          value={apptDoctor}
                          onChange={(e) => setApptDoctor(e.target.value)}
                        >
                          <option value="" disabled selected>Select specialty...</option>
                          <option value="Dr. Anil Deshpande (Organ Transplant Specialist)">Dr. Anil Deshpande (Organ Transplant Specialist)</option>
                          <option value="Dr. Meera Iyer (Senior Cardiologist)">Dr. Meera Iyer (Senior Cardiologist)</option>
                          <option value="Dr. Rohan Malhotra (Consultant Nephrologist)">Dr. Rohan Malhotra (Consultant Nephrologist)</option>
                          <option value="Dr. Sarah D'Souza (Ophthalmic Surgeon)">Dr. Sarah D'Souza (Ophthalmic Surgeon)</option>
                          <option value="Dr. Vikram Sen (Hepatobiliary Specialist)">Dr. Vikram Sen (Hepatobiliary Specialist)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-row-3">
                    <div className="form-group">
                      <label htmlFor="appointment-date">Date of Appointment</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-calendar-days"></i>
                        <input 
                          type="date" 
                          id="appointment-date" 
                          required
                          min={getMinDateString()}
                          value={apptDate}
                          onChange={(e) => setApptDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="appointment-time">Preferred Time Slot</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-clock"></i>
                        <select 
                          id="appointment-time" 
                          required
                          value={apptTime}
                          onChange={(e) => setApptTime(e.target.value)}
                        >
                          <option value="" disabled selected>Select time...</option>
                          <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                          <option value="10:30 AM - 11:30 AM">10:30 AM - 11:30 AM</option>
                          <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                          <option value="02:30 PM - 03:30 PM">02:30 PM - 03:30 PM</option>
                          <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="appointment-reason">Reason for Checkup</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-notes-medical"></i>
                        <select 
                          id="appointment-reason" 
                          required
                          value={apptReason}
                          onChange={(e) => setApptReason(e.target.value)}
                        >
                          <option value="Donor Suitability Diagnostic">Donor Suitability Diagnostic</option>
                          <option value="Organ Compatibility Testing">Organ Compatibility Testing</option>
                          <option value="General Health Consultation">General Health Consultation</option>
                          <option value="Medical Certificate Verification">Medical Certificate Verification</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg">
                    Book Confirmed Appointment <i className="fa-solid fa-calendar-check"></i>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: EMERGENCY PROTOCOL */}
          {activeTab === 'emergency' && (
            <div className="dash-tab-content active">
              <div className="dash-header">
                <div className="emergency-headline">
                  <span className="emergency-badge">CRITICAL SYSTEM</span>
                  <h2>Urgent Organ Request Dispatch</h2>
                </div>
                <p style={{ textAlign: 'left', marginTop: '8px' }}>Authorized coordinators can initiate immediate, real-time matchmaking lists for severe emergency transplants.</p>
              </div>

              <div className="form-container-card emergency-alert-card glass">
                <div className="emergency-alert-banner">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <div>
                    <h4>Life-Saving Emergency Protocol</h4>
                    <p>This action broadcasts an active notification to the organ banks and coordinating units of all local linked centers. Do not use this section for routine requests.</p>
                  </div>
                </div>

                <form id="emergency-form" onSubmit={handleEmergencySubmit}>
                  <div className="form-row-3">
                    <div className="form-group">
                      <label htmlFor="emergency-organ">Organ Needed Urgently</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-heart-pulse"></i>
                        <select 
                          id="emergency-organ" 
                          required
                          value={emergOrgan}
                          onChange={(e) => setEmergOrgan(e.target.value)}
                        >
                          <option value="" disabled selected>Select organ...</option>
                          <option value="Heart">Heart</option>
                          <option value="Kidney">Kidney</option>
                          <option value="Liver">Liver</option>
                          <option value="Lungs">Lungs</option>
                          <option value="Pancreas">Pancreas</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="emergency-blood">Patient Blood Group</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-droplet text-red"></i>
                        <select 
                          id="emergency-blood" 
                          required
                          value={emergBlood}
                          onChange={(e) => setEmergBlood(e.target.value)}
                        >
                          <option value="" disabled selected>Select blood type...</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="emergency-hospital">Current Treating Hospital</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-hospital"></i>
                        <select 
                          id="emergency-hospital" 
                          required
                          value={emergHospital}
                          onChange={(e) => setEmergHospital(e.target.value)}
                        >
                          <option value="" disabled selected>Select hospital...</option>
                          {hospitals.map((h, idx) => (
                            <option key={idx} value={h._id}>{h.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="emergency-urgency">Urgency Status</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-gauge-high"></i>
                        <select 
                          id="emergency-urgency" 
                          required 
                          className="critical-select"
                          value={emergUrgency}
                          onChange={(e) => setEmergUrgency(e.target.value)}
                        >
                          <option value="CRITICAL_LIFE_SUPPORT">Critical: Life Support / Ventilator Status (ASAP)</option>
                          <option value="HIGH_PRIORITY">High Priority: Patient in ICU under stable monitoring</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="emergency-phone">Duty Doctor/Coordinator Phone Number</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-phone"></i>
                        <input 
                          type="tel" 
                          id="emergency-phone" 
                          required 
                          placeholder="Coordinator's direct number" 
                          value={emergPhone}
                          onChange={(e) => setEmergPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="consent-agreement">
                    <label className="agreement-checkbox label-red">
                      <input 
                        type="checkbox" 
                        required 
                        checked={emergAgreement}
                        onChange={(e) => setEmergAgreement(e.target.checked)}
                      />
                      <span>I authorize that this is an authentic medical emergency matching procedure and all patient credentials and hospital dispatch details provided are true and accurate.</span>
                    </label>
                  </div>

                  <button type="submit" className="btn btn-red btn-lg btn-block">
                    Broadcast Critical Request <i className="fa-solid fa-satellite-dish"></i>
                  </button>
                </form>
              </div>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}
