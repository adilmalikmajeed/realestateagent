const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Property Schema
const propertySchema = new mongoose.Schema({
  title: String,
  price: String,
  priceValue: Number,
  type: String,
  purpose: String,
  city: String,
  beds: Number,
  baths: Number,
  area: String,
  image: String,
  description: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  createdAt: { type: Date, default: Date.now }
});

const Property = mongoose.model('Property', propertySchema);

// Routes
app.get('/api/properties', async (req, res) => {
  try {
    const { purpose, type, city, minPrice, maxPrice } = req.query;
    
    const query = {};
    if (purpose) query.purpose = purpose;
    if (type) query.type = type;
    if (city) query.city = city.toLowerCase();
    
    if (minPrice || maxPrice) {
      query.priceValue = {};
      if (minPrice) query.priceValue.$gte = parseInt(minPrice);
      if (maxPrice) query.priceValue.$lte = parseInt(maxPrice);
    }
    
    const properties = await Property.find(query);
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/properties', async (req, res) => {
  try {
    const property = new Property(req.body);
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));