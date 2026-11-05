/**
 * HopeLink - Premium Organ Donation & Healthcare Portal
 * Core Client Logic
 */

class HopeLinkApp {
  constructor() {
    this.token = localStorage.getItem('hl_token') || null;
    this.user = null;
    this.hospitals = [];
    this.appointments = [];
    this.pledge = null;
    
    // Default simulated coordinates (Bengaluru central)
    this.userLat = 12.9716;
    this.userLng = 77.5946;

    // Toast configuration
    this.toastContainer = document.getElementById('toast-container');
    
    this.init();
  }

  // ----------------------------------------------------
  // INITIALIZATION & SESSIONS
  // ----------------------------------------------------
  async init() {
    this.setupListeners();
    
    if (this.token) {
      const verified = await this.checkSession();
      if (verified) {
        this.updateAuthUI(true);
        await this.loadAllDashboardData();
        this.navigateTo('dashboard');
      } else {
        this.logout(false);
      }
    } else {
      this.updateAuthUI(false);
      this.navigateTo('landing');
    }
  }

  async checkSession() {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (!res.ok) throw new Error('Session invalid');
      this.user = await res.json();
      return true;
    } catch (err) {
      console.warn('Session verification failed:', err.message);
      return false;
    }
  }

  async loadAllDashboardData() {
    if (!this.token) return;
    
    document.getElementById('dash-user-name').innerText = `Hello, ${this.user.name}`;
    
    // Fetch dashboard components in parallel
    await Promise.all([
      this.fetchHospitals(),
      this.fetchAppointments(),
      this.fetchActivePledge()
    ]);
    
    this.updateOverviewStats();
  }

  setupListeners() {
    // Sync dates - set appointment min date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('appointment-date');
    if (dateInput) {
      dateInput.min = tomorrow.toISOString().split('T')[0];
    }
  }

  // ----------------------------------------------------
  // NAVIGATION ROUTER
  // ----------------------------------------------------
  navigateTo(viewId) {
    // Hide all view-sections
    document.querySelectorAll('.view-section').forEach(view => {
      view.classList.remove('active');
    });

    // Show selected view-section
    const targetView = document.getElementById(`${viewId}-view`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Handle header active status
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Make sure correct header item is highlighted
    if (viewId === 'landing') {
      const activeLink = document.querySelector('.nav-link[data-target="landing"]');
      if (activeLink) activeLink.classList.add('active');
    }

    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateToDashboard(tabId) {
    if (!this.token) {
      this.showToast('Please log in or register to access this section.', 'info');
      this.navigateTo('auth');
      this.switchAuthTab('login');
      return;
    }

    this.navigateTo('dashboard');
    this.switchDashTab(tabId);
  }

  switchDashTab(tabId) {
    // Update sidebar button states
    document.querySelectorAll('.dash-nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      }
    });

    // Toggle tab panels
    document.querySelectorAll('.dash-tab-content').forEach(tab => {
      tab.classList.remove('active');
    });

    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
      targetTab.classList.add('active');
    }

    // Special loader actions per tab
    if (tabId === 'hospitals') {
      this.refreshHospitalList();
    }
  }

  switchAuthTab(mode) {
    const loginBox = document.getElementById('login-form-box');
    const regBox = document.getElementById('register-form-box');
    const tabs = document.querySelectorAll('.auth-tab-btn');

    if (mode === 'login') {
      loginBox.classList.add('active');
      regBox.classList.remove('active');
      tabs[0].classList.add('active');
      tabs[1].classList.remove('active');
    } else {
      loginBox.classList.remove('active');
      regBox.classList.add('active');
      tabs[0].classList.remove('active');
      tabs[1].classList.add('active');
    }
  }

  // ----------------------------------------------------
  // AUTHENTICATION CONTROLLER
  // ----------------------------------------------------
  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    if (password.length < 6) {
      this.showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('hl_token', this.token);

      this.showToast('Registration successful! Welcome to HopeLink.', 'success');
      this.updateAuthUI(true);
      await this.loadAllDashboardData();
      this.navigateTo('dashboard');
      this.switchDashTab('overview');

      // Clear form
      document.getElementById('register-form').reset();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('hl_token', this.token);

      this.showToast('Login successful! Dashboard loaded.', 'success');
      this.updateAuthUI(true);
      await this.loadAllDashboardData();
      this.navigateTo('dashboard');
      this.switchDashTab('overview');

      // Clear form
      document.getElementById('login-form').reset();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  logout(showToast = true) {
    this.token = null;
    this.user = null;
    this.hospitals = [];
    this.appointments = [];
    this.pledge = null;
    localStorage.removeItem('hl_token');
    
    this.updateAuthUI(false);
    this.navigateTo('landing');

    if (showToast) {
      this.showToast('Logged out successfully.', 'info');
    }
  }

  updateAuthUI(isLoggedIn) {
    const authBtn = document.getElementById('header-auth-btn');
    const profileMenu = document.getElementById('user-profile-menu');
    
    if (isLoggedIn) {
      authBtn.style.display = 'none';
      profileMenu.style.display = 'block';
      document.getElementById('profile-name').innerText = this.user.name;
      document.getElementById('profile-email').innerText = this.user.email;
      
      // Update header links
      document.getElementById('nav-hospitals-link').setAttribute('onclick', "app.navigateToDashboard('hospitals')");
      document.getElementById('nav-pledge-link').setAttribute('onclick', "app.navigateToDashboard('pledge')");
    } else {
      authBtn.style.display = 'inline-flex';
      profileMenu.style.display = 'none';
      
      // Update header links redirect to login
      document.getElementById('nav-hospitals-link').setAttribute('onclick', "app.navigateToDashboard('hospitals')");
      document.getElementById('nav-pledge-link').setAttribute('onclick', "app.navigateToDashboard('pledge')");
    }
  }

  toggleDropdown() {
    const dropdown = document.getElementById('dropdown-menu');
    dropdown.classList.toggle('show');

    // Close on clicking outside
    const closeMenu = (e) => {
      if (!e.target.closest('.user-dropdown')) {
        dropdown.classList.remove('show');
        document.removeEventListener('click', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
  }


  // ----------------------------------------------------
  // HOSPITAL FINDER & LIVE SEARCH
  // ----------------------------------------------------
  async fetchHospitals() {
    try {
      const res = await fetch(`/api/hospitals?lat=${this.userLat}&lng=${this.userLng}`);
      if (!res.ok) throw new Error('Failed to load hospitals');
      this.hospitals = await res.json();
      
      this.populateHospitalSelects();
    } catch (err) {
      console.error(err);
      this.showToast('Could not fetch hospitals.', 'error');
    }
  }

  populateHospitalSelects() {
    // Populate select options in booking and emergency forms
    const bookSelect = document.getElementById('appointment-hospital');
    const emergSelect = document.getElementById('emergency-hospital');
    
    const optionsHtml = this.hospitals.map(h => 
      `<option value="${h.id}">${h.name} (${h.distance || '0'} km away)</option>`
    ).join('');

    if (bookSelect) {
      bookSelect.innerHTML = `<option value="" disabled selected>Select nearest clinic...</option>${optionsHtml}`;
    }
    if (emergSelect) {
      emergSelect.innerHTML = `<option value="" disabled selected>Select hospital...</option>${optionsHtml}`;
    }
  }

  async updateLocationCoordinates() {
    const dropdown = document.getElementById('simulated-location');
    const coordinates = dropdown.value.split(',');
    
    this.userLat = parseFloat(coordinates[0]);
    this.userLng = parseFloat(coordinates[1]);
    
    await this.refreshHospitalList();
    this.showToast('Recalculated coordinate distances from your new position.', 'success');
  }

  async refreshHospitalList() {
    await this.fetchHospitals();
    this.filterHospitals();
  }

  filterHospitals() {
    const organFilter = document.getElementById('search-organ-type').value;
    const container = document.getElementById('hospitals-list-container');
    
    let filtered = this.hospitals;
    if (organFilter !== 'ALL') {
      filtered = this.hospitals.filter(h => h.available_organs.includes(organFilter));
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="card-empty-state" style="grid-column: 1 / -1;">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p>No hospitals currently stock ${organFilter} in their donor bank.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(h => {
      const organsHtml = h.available_organs.map(o => `<span class="organ-badge">${o}</span>`).join('');
      return `
        <div class="hospital-card glass">
          <div>
            <div class="hosp-header">
              <div class="hosp-title-box">
                <h3>${h.name}</h3>
                <span class="hosp-rating"><i class="fa-solid fa-star"></i> ${h.rating.toFixed(1)}</span>
              </div>
              <span class="hosp-distance"><i class="fa-solid fa-location-arrow"></i> ${h.distance || '0'} km</span>
            </div>
            
            <div class="hosp-details" style="margin-top: 16px;">
              <div><i class="fa-solid fa-map-pin"></i> ${h.address}</div>
              <div><i class="fa-solid fa-phone"></i> ${h.phone}</div>
            </div>
          </div>

          <div class="hosp-organs">
            <span>Available Organs</span>
            <div class="organs-badges-row">
              ${organsHtml}
            </div>
            <div style="margin-top: 20px; display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="app.switchDashTab('appointments'); document.getElementById('appointment-hospital').value='${h.id}';"><i class="fa-solid fa-calendar"></i> Book Clinic</button>
              <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="app.switchDashTab('emergency'); document.getElementById('emergency-hospital').value='${h.id}';"><i class="fa-solid fa-phone-volume"></i> Urgent Request</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  startSearchFlow() {
    this.navigateToDashboard('hospitals');
  }

  // ----------------------------------------------------
  // ORGAN PLEDGE & DIGITAL DONOR CARD
  // ----------------------------------------------------
  async fetchActivePledge() {
    try {
      const res = await fetch('/api/pledges/my', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (res.status === 404) {
        this.pledge = null;
        this.renderPledgeUI();
        return;
      }
      if (!res.ok) throw new Error('Failed to load pledge');
      this.pledge = await res.json();
      this.renderPledgeUI();
    } catch (err) {
      console.error(err);
    }
  }

  renderPledgeUI() {
    const wrapper = document.getElementById('pledge-card-wrapper');
    const overviewStatus = document.getElementById('overview-pledge-status');
    const overviewSub = document.getElementById('overview-pledge-sub');
    
    // Fill values in form if pledge exists (pre-population)
    if (this.pledge) {
      overviewStatus.innerText = 'Active Legacy';
      overviewStatus.style.color = '#2dd4bf';
      overviewSub.innerText = 'Digital ID card generated';

      // Pre-fill Emergency Contact
      document.getElementById('pledge-emergency-name').value = this.pledge.emergency_contact_name;
      document.getElementById('pledge-emergency-phone').value = this.pledge.emergency_contact_phone;
      
      // Pre-check checkboxes
      document.querySelectorAll('#pledge-form input[type="checkbox"][name="organs"]').forEach(cb => {
        cb.checked = this.pledge.organs.includes(cb.value);
      });

      const organsHtml = this.pledge.organs.map(o => `<span class="organ-badge">${o}</span>`).join('');
      const dateStr = new Date(this.pledge.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      const serialNum = `HL-DN-${this.pledge.id.toString().padStart(6, '0')}`;

      wrapper.innerHTML = `
        <div class="donor-id-card">
          <div class="id-glow"></div>
          <div class="id-header">
            <div class="id-header-title">
              <i class="fa-solid fa-shield-heart"></i>
              <span>HEALING LEGACY</span>
            </div>
            <div class="id-header-badge">CERTIFIED</div>
          </div>
          <div class="id-body">
            <div class="id-avatar">
              <i class="fa-solid fa-ribbon"></i>
            </div>
            <div class="id-details">
              <div class="id-field">
                <span class="label">Donor Name</span>
                <span class="val">${this.user.name}</span>
              </div>
              <div class="id-field">
                <span class="label">Pledged Organs</span>
                <div class="organs-badges-row">
                  ${organsHtml}
                </div>
              </div>
              <div class="id-field">
                <span class="label">Emergency Contact</span>
                <span class="val">${this.pledge.emergency_contact_name}</span>
              </div>
            </div>
          </div>
          <div class="id-footer">
            <span class="id-serial">${serialNum}</span>
            <span class="id-serial">${dateStr}</span>
          </div>
        </div>
        <div class="id-actions">
          <button class="btn btn-secondary btn-sm" onclick="app.openPrintModal('pledge')"><i class="fa-solid fa-file-invoice"></i> View Pledge Receipt</button>
          <button class="btn btn-teal btn-sm" onclick="app.openPrintModal('pledge')"><i class="fa-solid fa-download"></i> Save Donor Card</button>
        </div>
      `;
    } else {
      overviewStatus.innerText = 'Not Registered';
      overviewStatus.style.color = 'var(--text-secondary)';
      overviewSub.innerText = 'Support the community';
      
      wrapper.innerHTML = `
        <div class="card-empty-state">
          <i class="fa-solid fa-heart-circle-plus"></i>
          <p>You haven't pledged your organs yet. Make a legal declaration to save lives.</p>
          <button class="btn btn-teal btn-sm" onclick="app.switchDashTab('pledge')">Register Donation Pledge Now</button>
        </div>
      `;
    }
  }

  async handlePledgeSubmission(e) {
    e.preventDefault();
    const checkedBoxes = document.querySelectorAll('#pledge-form input[type="checkbox"][name="organs"]:checked');
    const emergencyName = document.getElementById('pledge-emergency-name').value.trim();
    const emergencyPhone = document.getElementById('pledge-emergency-phone').value.trim();

    if (checkedBoxes.length === 0) {
      this.showToast('Please select at least one organ to pledge.', 'error');
      return;
    }

    const organs = Array.from(checkedBoxes).map(cb => cb.value);

    try {
      const res = await fetch('/api/pledges', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          organs,
          emergency_contact_name: emergencyName,
          emergency_contact_phone: emergencyPhone
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to submit pledge');

      this.showToast(data.message, 'success');
      await this.fetchActivePledge();
      this.updateOverviewStats();
      this.switchDashTab('overview');
      
      // Auto-open print modal for their official receipt
      setTimeout(() => {
        this.openPrintModal('pledge');
      }, 800);
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  startPledgeFlow() {
    this.navigateToDashboard('pledge');
  }

  // ----------------------------------------------------
  // HOSPITAL CLINIC APPOINTMENTS
  // ----------------------------------------------------
  async fetchAppointments() {
    try {
      const res = await fetch('/api/appointments/my', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (!res.ok) throw new Error('Failed to load appointments');
      this.appointments = await res.json();
      
      this.renderAppointmentsUI();
    } catch (err) {
      console.error(err);
    }
  }

  renderAppointmentsUI() {
    const listWrapper = document.getElementById('overview-appointments-list');
    const overviewCount = document.getElementById('overview-appointment-count');
    
    overviewCount.innerText = `${this.appointments.length} Booking${this.appointments.length === 1 ? '' : 's'}`;

    if (this.appointments.length === 0) {
      listWrapper.innerHTML = `
        <div class="list-empty-state">
          <i class="fa-solid fa-calendar-plus"></i>
          <p>No health diagnostic appointments booked yet.</p>
          <button class="btn btn-teal btn-sm" onclick="app.switchDashTab('appointments')">Schedule Clinic Checkup</button>
        </div>
      `;
      return;
    }

    listWrapper.innerHTML = this.appointments.map(a => {
      const dateForm = new Date(a.appointment_date).toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
      });
      return `
        <div class="appt-card-wrapper">
          <div class="appt-item-header">
            <h4>${a.hospital_name}</h4>
            <span class="appt-status-tag">${a.status}</span>
          </div>
          <div class="appt-body-info">
            <div><i class="fa-solid fa-user-doctor"></i> ${a.doctor_name}</div>
            <div><i class="fa-solid fa-calendar"></i> ${dateForm}</div>
            <div><i class="fa-solid fa-clock"></i> ${a.appointment_time}</div>
            <div><i class="fa-solid fa-circle-question"></i> ${a.reason}</div>
          </div>
          <div class="appt-actions">
            <button class="btn btn-secondary btn-sm" onclick='app.openPrintModal("appointment", ${JSON.stringify(a).replace(/'/g, "&apos;")})'><i class="fa-solid fa-print"></i> Get Ticket</button>
          </div>
        </div>
      `;
    }).join('');
  }

  async handleAppointmentSubmission(e) {
    e.preventDefault();
    const hospitalId = document.getElementById('appointment-hospital').value;
    const doctorName = document.getElementById('appointment-doctor').value;
    const dateVal = document.getElementById('appointment-date').value;
    const timeVal = document.getElementById('appointment-time').value;
    const reasonVal = document.getElementById('appointment-reason').value;

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          hospital_id: hospitalId,
          doctor_name: doctorName,
          appointment_date: dateVal,
          appointment_time: timeVal,
          reason: reasonVal
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Appointment booking failed');

      this.showToast(data.message, 'success');
      await this.fetchAppointments();
      this.updateOverviewStats();
      this.switchDashTab('overview');
      
      // Auto-open print modal for confirmation ticket
      const newAppt = this.appointments.find(a => a.id === data.appointmentId) || {
        id: data.appointmentId,
        hospital_name: data.hospitalName,
        doctor_name: doctorName,
        appointment_date: dateVal,
        appointment_time: timeVal,
        reason: reasonVal,
        status: 'Scheduled'
      };

      setTimeout(() => {
        this.openPrintModal('appointment', newAppt);
      }, 800);

      document.getElementById('appointment-form').reset();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  // ----------------------------------------------------
  // EMERGENCY BROADCAST HUB
  // ----------------------------------------------------
  async handleEmergencySubmission(e) {
    e.preventDefault();
    const organ = document.getElementById('emergency-organ').value;
    const blood = document.getElementById('emergency-blood').value;
    const hospId = document.getElementById('emergency-hospital').value;
    const urgency = document.getElementById('emergency-urgency').value;
    const phone = document.getElementById('emergency-phone').value.trim();

    try {
      const res = await fetch('/api/emergencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          organ_needed: organ,
          blood_type: blood,
          hospital_id: hospId,
          urgency_level: urgency
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to dispatch request');

      this.showToast(`CRITICAL PROTOCOL ACTIVATED: ${data.message}`, 'error');
      
      // Simulating matchmaking effect
      this.showToast(`Broadcasting matching request to local networks...`, 'info');
      
      // Reset emergency form
      document.getElementById('emergency-form').reset();
      
      // Reload stats and switch to overview
      setTimeout(() => {
        this.updateOverviewStats();
        // Custom override display alert
        document.getElementById('overview-emergency-count').innerHTML = `<span style="color: var(--color-red)">Active Critical</span>`;
        document.getElementById('overview-emergency-count').nextElementSibling.innerText = `Searching match for patient`;
        this.switchDashTab('overview');
      }, 1500);

    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  updateOverviewStats() {
    // Count totals dynamically
    if (this.appointments) {
      document.getElementById('overview-appointment-count').innerText = `${this.appointments.length} Booking${this.appointments.length === 1 ? '' : 's'}`;
    }
    
    if (this.pledge) {
      document.getElementById('overview-pledge-status').innerText = 'Pledged Active';
      document.getElementById('overview-pledge-status').style.color = '#2dd4bf';
    } else {
      document.getElementById('overview-pledge-status').innerText = 'Not Registered';
      document.getElementById('overview-pledge-status').style.color = 'var(--text-secondary)';
    }
  }

  // ----------------------------------------------------
  // RECEIPT PDF / PRINT SYSTEM
  // ----------------------------------------------------
  openPrintModal(type, data) {
    const modal = document.getElementById('print-modal');
    const container = document.getElementById('printable-document-content');
    
    let html = '';
    const now = new Date();
    const dateFormatted = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

    if (type === 'pledge') {
      const p = this.pledge;
      const serial = `HL-DN-${p.id.toString().padStart(6, '0')}`;
      const pledgeDate = new Date(p.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      const listOrgans = p.organs.join(', ');

      html = `
        <div class="receipt-box">
          <div class="receipt-header">
            <div class="receipt-logo"><i class="fa-solid fa-heart-pulse"></i> HopeLink</div>
            <p>Certified Organ Donation Registry of India</p>
            <p>Project interlink: National Transplant Commission</p>
          </div>
          <h2 class="receipt-title">Official Legacy Pledge Card & Receipt</h2>
          
          <div class="receipt-row">
            <span class="lbl">Unique Registry ID</span>
            <span class="val" style="font-family: monospace;">${serial}</span>
          </div>
          <div class="receipt-row">
            <span class="lbl">Date of Registration</span>
            <span class="val">${pledgeDate}</span>
          </div>
          <div class="receipt-row">
            <span class="lbl">Pledging Donor Full Name</span>
            <span class="val">${this.user.name}</span>
          </div>
          <div class="receipt-row">
            <span class="lbl">Donor Email Contact</span>
            <span class="val">${this.user.email}</span>
          </div>
          <div class="receipt-row">
            <span class="lbl">Consented Organs</span>
            <span class="val" style="color: #0d9488;">${listOrgans}</span>
          </div>
          <div class="receipt-row">
            <span class="lbl">Emergency Representative</span>
            <span class="val">${p.emergency_contact_name}</span>
          </div>
          <div class="receipt-row">
            <span class="lbl">Representative Direct Contact</span>
            <span class="val">${p.emergency_contact_phone}</span>
          </div>
          <div class="receipt-row">
            <span class="lbl">Legal Status</span>
            <span class="val" style="background-color: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 4px;">ACTIVE DECLARED</span>
          </div>

          <div class="receipt-footer-stamp">
            <div class="receipt-uid">Generated: ${dateFormatted}</div>
            <div style="text-align: right; font-size: 11px; font-weight: 700; color: #4b5563;">
              <i class="fa-solid fa-signature"></i> National Registry Seal
            </div>
          </div>
          <div class="receipt-watermark">
            <i class="fa-solid fa-shield-halved"></i> Save this PDF/Slip. Present to medical authority if requested.
          </div>
        </div>
      `;
    } else if (type === 'appointment') {
      const serial = `HL-AP-${data.id.toString().padStart(6, '0')}`;
      const apptDate = new Date(data.appointment_date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
      });

      html = `
        <div class="receipt-box">
          <div class="receipt-header">
            <div class="receipt-logo"><i class="fa-solid fa-heart-pulse"></i> HopeLink</div>
            <p>Interlinked Hospital Appointment Booking Voucher</p>
          </div>
          <h2 class="receipt-title">Clinic Access Consultation Ticket</h2>
          
          <div class="receipt-row">
            <span class="lbl">Access Booking Reference</span>
            <span class="val" style="font-family: monospace;">${serial}</span>
          </div>
          <div class="receipt-row">
            <span class="lbl">Assigned Health Center</span>
            <span class="val">${data.hospital_name || 'Select Hospital'}</span>
          </div>
          <div class="receipt-row">
            <span class="lbl">Hospital Location Address</span>
            <span class="val">${data.hospital_address || 'Registered Address'}</span>
          </div>
          <div class="receipt-row">
            <span class="lbl">Assigned Doctor Specialty</span>
            <span class="val" style="color: #0d9488;">${data.doctor_name}</span>
          </div>
          <div class="receipt-row">
            <span class="lbl">Scheduled Appointment Date</span>
            <span class="val" style="font-weight: 800;">${apptDate}</span>
          </div>
          <div class="receipt-row">
            <span class="lbl">Scheduled Time Slot</span>
            <span class="val" style="font-weight: 800;">${data.appointment_time}</span>
          </div>
          <div class="receipt-row">
            <span class="lbl">Appointment Diagnostic Purpose</span>
            <span class="val">${data.reason}</span>
          </div>
          <div class="receipt-row">
            <span class="lbl">Check-In Queue Ticket Status</span>
            <span class="val" style="background-color: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 4px;">CONFIRMED SEAT</span>
          </div>

          <div class="receipt-footer-stamp">
            <div class="receipt-uid">Issued: ${dateFormatted}</div>
            <div style="text-align: right; font-size: 11px; font-weight: 700; color: #4b5563;">
              <i class="fa-solid fa-calendar-check"></i> Clinic Dispatch stamp
            </div>
          </div>
          <div class="receipt-watermark">
            <i class="fa-solid fa-qrcode"></i> Present this coupon code slip at the counter 15 mins prior.
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
    modal.classList.add('show');
  }

  printCurrentReceipt() {
    window.print();
  }

  closePrintModal() {
    document.getElementById('print-modal').classList.remove('show');
  }

  // ----------------------------------------------------
  // FLOATING SYSTEM TOAST HELPER
  // ----------------------------------------------------
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    // Remove toast after slideout animation
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }
}

// Instantiate App
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new HopeLinkApp();
});