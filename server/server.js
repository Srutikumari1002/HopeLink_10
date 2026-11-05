const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Hospital = require('./models/Hospital');

// Load environment variables
dotenv.config();

const app = express();

const mockHospitals = [
  {
    name: "St. Jude Memorial Health City",
    address: "12, Outer Ring Road, Marathahalli, Bengaluru",
    latitude: 12.9562,
    longitude: 77.7011,
    phone: "+91 80 4912 3456",
    availableOrgans: ["Kidney", "Cornea", "Heart"],
    rating: 4.8
  },
  {
    name: "Fortis Organ Care & Transplant Centre",
    address: "154/9, Bannerghatta Road, Opp. IIM-B, Bengaluru",
    latitude: 12.8953,
    longitude: 77.5985,
    phone: "+91 80 6627 2000",
    availableOrgans: ["Liver", "Kidney", "Lungs"],
    rating: 4.7
  },
  {
    name: "Narayana Health Hrudayalaya",
    address: "258/A, Bommasandra Industrial Area, Anekal Taluk, Bengaluru",
    latitude: 12.8126,
    longitude: 77.6881,
    phone: "+91 80 7122 2222",
    availableOrgans: ["Heart", "Cornea", "Kidney", "Pancreas"],
    rating: 4.9
  },
  {
    name: "Apollo Hospitals & Donor Registry",
    address: "21/2, Old Three Road, Seshadripuram, Bengaluru",
    latitude: 12.9902,
    longitude: 77.5794,
    phone: "+91 80 2309 6100",
    availableOrgans: ["Cornea", "Liver"],
    rating: 4.6
  },
  {
    name: "Manipal Hospital Life Institute",
    address: "98, HAL Old Airport Road, Kodihalli, Bengaluru",
    latitude: 12.9592,
    longitude: 77.6433,
    phone: "+91 80 2502 4444",
    availableOrgans: ["Kidney", "Lungs", "Heart", "Cornea"],
    rating: 4.8
  }
];

const seedHospitalsIfEmpty = async () => {
  try {
    const count = await Hospital.countDocuments();
    if (count === 0) {
      await Hospital.insertMany(mockHospitals);
      console.log('Seeded initial mock hospitals into database.');
    }
  } catch (err) {
    console.warn('Auto-seed notice:', err.message);
  }
};

// Connect to MongoDB
connectDB().then(() => {
  seedHospitalsIfEmpty();
});

// Middleware
app.use(cors());
app.use(express.json());

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/pledges', require('./routes/pledges'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/emergencies', require('./routes/emergencies'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('HopeLink MERN API server is running...');
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` HopeLink MERN Backend Server running           `);
  console.log(` Port:    http://localhost:${PORT}               `);
  console.log(` Mode:    ${process.env.NODE_ENV || 'development'}               `);
  console.log(`=================================================`);
});
