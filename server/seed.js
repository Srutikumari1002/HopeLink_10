const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hospital = require('./models/Hospital');

dotenv.config();

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

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hopelink_mern';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding...');

    await Hospital.deleteMany();
    console.log('Cleared existing hospitals...');

    await Hospital.insertMany(mockHospitals);
    console.log('Mock hospitals seeded successfully!');

    mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err.message);
    process.exit(1);
  }
};

seedDB();
