# HopeLink - Premium Organ Donation & Healthcare Portal

HopeLink is a premium, full-stack, and highly interactive healthcare web application designed to bridge the gap between organ donors, clinical diagnostics, and emergency hospital networks. 

Built with modern design aesthetics (glassmorphism, tailored gradients, and telemetry micro-animations) and a robust database backend, HopeLink provides a secure environment to manage donation pledges, find nearby hospitals, and schedule clinic appointments.

---

## 🌟 Key Features

### 1. Secure Patient Authentication
*   **Encrypted Accounts**: User accounts are secured using `bcryptjs` password hashing.
*   **Session Management**: Secure API access guarded by JSON Web Tokens (JWT) stored client-side.

### 2. Legal Organ Donation Pledge Form
*   **Multi-Organ Selection**: Interactive console for choosing organs (Heart, Kidneys, Liver, Corneas, Lungs, etc.).
*   **Certified Donor Card**: Generates a beautiful digital "Healing Legacy Card" right on the patient dashboard.
*   **Verification Receipt**: Instant printable/downloadable legal pledge certificate with unique registry credentials.

### 3. Intelligent Nearest Hospital & Proximity Finder
*   **Coordinate Math**: Calculates exact distance (in km) on-the-fly using the **Haversine formula** based on simulated user positions.
*   **Live Sort**: Displays hospitals sorted dynamically from closest to furthest.
*   **Organ Bank Filter**: Filter hospitals instantly to check active stocks of specific organs.

### 4. Clinic Checkup Appointment Scheduler
*   **Queue Skip Slips**: Form to schedule pre-checks, organ compatibility testing, or diagnostics.
*   **Custom Tickets**: Generates printable booking tickets complete with physician credentials, timestamps, and database references.

### 5. High-Priority Emergency Request Hub
*   **Telemetric Red Alert**: Flashing console designed for life-support cases to broadcast matching requests.
*   **Active Proximity Broadcast**: Broadcasts matching profiles to closest interlinked clinics.

---

## 🛠️ Technology Stack & How It Was Built

HopeLink is designed with a lightweight, zero-configuration architecture, making it highly portable and production-ready.

### Backend (REST API Server)
*   **Node.js & Express.js**: Handles API routing, middleware integration, and session validation.
*   **SQLite3 Database**: A self-contained, serverless SQL database stored as a single local file (`database.sqlite`). Automatically initializes tables and seeds mock dataset on first startup.
*   **Security Tools**: Hashing with `bcryptjs` and token validation using `jsonwebtoken`.

### Frontend (Single Page Application)
*   **Structure**: Semantic HTML5 designed for SEO and complete screen accessibility.
*   **Styling (Vanilla CSS3)**:
    *   Curated dark-space health-tech theme using deep indigos, glowing teals, and emergency crimson colors.
    *   Glassmorphism elements (`backdrop-filter`) and smooth state transitions.
    *   Telemetry keyframe animations (`pulseGlow`, `wavePulse`, `floatCard`).
*   **Logic (Vanilla ES6)**: Modular router, form lifecycle controllers, coordinate distance calculations, and modal state management.
*   **Print Engine**: Built with native `@media print` queries. When the user clicks "Print / Download PDF", the stylesheet automatically hides headers, buttons, and backgrounds, formatting **only the official verification slip** into clean, white A4 documents ready to print or save.

---

## 📂 Database Relationship Model

```text
  [users] ──(1:1)──> [pledges]
     │
     ├──(1:N)──> [appointments] <──(N:1)── [hospitals]
     │
     └──(1:N)──> [emergency_requests] <──(N:1)── [hospitals]
```

---

## 🚀 Getting Started Locally

Getting HopeLink up and running on your machine requires zero complex database installations or external cloud configurations.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Srutikumari1002/HopeLink_10.git
   cd HopeLink_10
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Start the local server:**
   ```bash
   npm start
   ```

4. **Interact with the portal:**
   Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**. The server will automatically create `database.sqlite`, build the database tables, and seed it with major local hospitals.

---

## 🛡️ License
This project is licensed under the ISC License. Designed and built with ❤️ to promote organ donation awareness.
