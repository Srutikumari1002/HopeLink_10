# HopeLink - Premium Organ Donation & Healthcare Portal (MERN Stack)

HopeLink is a premium, full-stack, and highly interactive healthcare web application designed to bridge the gap between organ donors, clinical diagnostics, and emergency hospital networks. 

This repository has been fully upgraded to the **MERN Stack** (MongoDB, Express, React, Node.js), featuring a modern, component-driven client built on **Vite** and a robust **Mongoose/NoSQL** database backend.

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

### Backend (`/server`)
*   **Node.js & Express.js**: Handles API routing, middleware integration, and session validation.
*   **MongoDB & Mongoose**: Mongoose ODM is used to define structured schemas for users, pledges, appointments, and hospitals.
*   **Security Tools**: Hashing with `bcryptjs` and token validation using `jsonwebtoken`.

### Frontend (`/client`)
*   **Vite + React**: Component-driven UI utilizing state management hooks (`useState`, `useEffect`) for a seamless Single Page Application.
*   **Styling (Vanilla CSS3)**:
    *   Curated dark-space health-tech theme using deep indigos, glowing teals, and emergency crimson colors.
    *   Glassmorphism elements (`backdrop-filter`) and smooth state transitions.
    *   Telemetry keyframe animations (`pulseGlow`, `wavePulse`, `floatCard`).
*   **Print Engine**: Built with native `@media print` queries. When the user clicks "Print / Download PDF", the stylesheet automatically hides headers, sidebars, and backgrounds, formatting **only the official verification slip** into clean, white A4 documents ready to print or save.

---

## 📂 Directory Structure

```text
HopeLink_MERN/
├── server/                    # Node/Express Backend
│   ├── config/db.js           # MongoDB Atlas/Local connection
│   ├── models/                # Mongoose Models (User, Pledge, Hospital, etc.)
│   ├── routes/                # Express API Route controllers
│   ├── middleware/auth.js     # JWT session validator
│   ├── seed.js                # Database seeder script
│   └── server.js              # Server entry point
│
└── client/                    # React Frontend (Vite)
    ├── vite.config.js         # Port configuration & backend API proxy
    ├── index.html             # Client HTML5 base
    └── src/
        ├── index.css          # Glassmorphism tokens & print stylesheet overrides
        ├── App.jsx            # Main app router and state context
        ├── main.jsx           # React app entry point
        ├── components/        # Reusable dashboard UI elements
        └── pages/             # Page view containers (Landing, Auth, Dashboard)
```

---

## 🚀 Getting Started Locally

Getting HopeLink up and running on your machine requires zero complex database installations or external cloud configurations.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and a local instance of [MongoDB](https://www.mongodb.com/try/download/community) running.

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Srutikumari1002/HopeLink_10.git
   cd HopeLink_10
   ```

2. **Install all dependencies for root, client, and server:**
   ```bash
   npm run install-all
   ```

3. **Seed the database with hospitals:**
   ```bash
   npm run seed
   ```

4. **Start both Backend and Frontend concurrently:**
   ```bash
   npm run dev
   ```

5. **Interact with the portal:**
   Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)** (which proxies API requests automatically to the backend on port `5000`).

---

## 🛡️ License
This project is licensed under the ISC License. Designed and built with ❤️ to promote organ donation awareness.
