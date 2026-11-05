const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeTables();
  }
});

// Helper to run queries with promises
function dbRun(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Helper to get all results with promises
function dbAll(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Helper to get a single row
function dbGet(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function initializeTables() {
  try {
    // 1. Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Hospitals table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS hospitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        phone TEXT NOT NULL,
        available_organs TEXT NOT NULL,
        rating REAL DEFAULT 4.5
      )
    `);

    // 3. Pledges table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS pledges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        organs TEXT NOT NULL,
        emergency_contact_name TEXT NOT NULL,
        emergency_contact_phone TEXT NOT NULL,
        status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 4. Appointments table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        hospital_id INTEGER NOT NULL,
        doctor_name TEXT NOT NULL,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'Scheduled',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
      )
    `);

    // 5. Emergency Requests table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS emergency_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        organ_needed TEXT NOT NULL,
        blood_type TEXT NOT NULL,
        hospital_id INTEGER NOT NULL,
        urgency_level TEXT NOT NULL,
        status TEXT DEFAULT 'Searching Match',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
      )
    `);

    console.log('Tables initialized successfully.');
    await seedHospitals();
  } catch (err) {
    console.error('Error initializing database tables:', err);
  }
}

async function seedHospitals() {
  const rowCount = await dbGet('SELECT COUNT(*) as count FROM hospitals');
  if (rowCount.count > 0) {
    console.log('Hospitals table already seeded.');
    return;
  }

  // Pre-seed some premium mock hospitals around Bengaluru central (Lat: 12.9716, Lng: 77.5946)
  const mockHospitals = [
    {
      name: "St. Jude Memorial Health City",
      address: "12, Outer Ring Road, Marathahalli, Bengaluru",
      latitude: 12.9562,
      longitude: 77.7011,
      phone: "+91 80 4912 3456",
      available_organs: JSON.stringify(["Kidney", "Cornea", "Heart"]),
      rating: 4.8
    },
    {
      name: "Fortis Organ Care & Transplant Centre",
      address: "154/9, Bannerghatta Road, Opp. IIM-B, Bengaluru",
      latitude: 12.8953,
      longitude: 77.5985,
      phone: "+91 80 6627 2000",
      available_organs: JSON.stringify(["Liver", "Kidney", "Lungs"]),
      rating: 4.7
    },
    {
      name: "Narayana Health Hrudayalaya",
      address: "258/A, Bommasandra Industrial Area, Anekal Taluk, Bengaluru",
      latitude: 12.8126,
      longitude: 77.6881,
      phone: "+91 80 7122 2222",
      available_organs: JSON.stringify(["Heart", "Cornea", "Kidney", "Pancreas"]),
      rating: 4.9
    },
    {
      name: "Apollo Hospitals & Donor Registry",
      address: "21/2, Old Three Road, Seshadripuram, Bengaluru",
      latitude: 12.9902,
      longitude: 77.5794,
      phone: "+91 80 2309 6100",
      available_organs: JSON.stringify(["Cornea", "Liver"]),
      rating: 4.6
    },
    {
      name: "Manipal Hospital Life Institute",
      address: "98, HAL Old Airport Road, Kodihalli, Bengaluru",
      latitude: 12.9592,
      longitude: 77.6433,
      phone: "+91 80 2502 4444",
      available_organs: JSON.stringify(["Kidney", "Lungs", "Heart", "Cornea"]),
      rating: 4.8
    }
  ];

  for (const h of mockHospitals) {
    await dbRun(`
      INSERT INTO hospitals (name, address, latitude, longitude, phone, available_organs, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [h.name, h.address, h.latitude, h.longitude, h.phone, h.available_organs, h.rating]);
  }

  console.log('Seeded mock hospital database successfully.');
}

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll
};
