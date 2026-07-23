const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory database
let products = [
  { id: 1, name: 'Laptop', category: 'Electronics', price: 999.99, quantity: 5, sku: 'ELEC001' },
  { id: 2, name: 'Mouse', category: 'Electronics', price: 29.99, quantity: 25, sku: 'ELEC002' },
  { id: 3, name: 'Desk Chair', category: 'Furniture', price: 199.99, quantity: 3, sku: 'FURN001' },
  { id: 4, name: 'Monitor', category: 'Electronics', price: 299.99, quantity: 8, sku: 'ELEC003' }
];

let nextId = 5;

// GET all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// CREATE product
app.post('/api/products', (req, res) => {
  const { name, category, price, quantity, sku } = req.body;

  if (!name || !category || !price || quantity === undefined || !sku) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (price <= 0) {
    return res.status(400).json({ message: 'Price must be greater than 0' });
  }
  if (quantity < 0) {
    return res.status(400).json({ message: 'Quantity cannot be negative' });
  }
  if (products.some(p => p.sku === sku)) {
    return res.status(400).json({ message: 'SKU already exists' });
  }

  const newProduct = {
    id: nextId++,
    name,
    category,
    price: parseFloat(price),
    quantity: parseInt(quantity),
    sku
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// UPDATE product
app.put('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const { name, category, price, quantity, sku } = req.body;

  if (price !== undefined && price <= 0) {
    return res.status(400).json({ message: 'Price must be greater than 0' });
  }
  if (quantity !== undefined && quantity < 0) {
    return res.status(400).json({ message: 'Quantity cannot be negative' });
  }
  if (sku && sku !== product.sku && products.some(p => p.sku === sku)) {
    return res.status(400).json({ message: 'SKU already exists' });
  }

  if (name) product.name = name;
  if (category) product.category = category;
  if (price !== undefined) product.price = parseFloat(price);
  if (quantity !== undefined) product.quantity = parseInt(quantity);
  if (sku) product.sku = sku;

  res.json(product);
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  const deletedProduct = products.splice(index, 1);
  res.json(deletedProduct[0]);
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const lowStock = products.filter(p => p.quantity < 5).length;
  
  res.json({
    totalProducts: products.length,
    totalInventoryValue: totalValue.toFixed(2),
    lowStockAlerts: lowStock,
    categories: [...new Set(products.map(p => p.category))]
  });
});

app.listen(PORT, () => {
  console.log(`✅ Inventory API running on http://localhost:${PORT}`);
  console.log(`📊 API Endpoints:`);
  console.log(`   GET    /api/products      - List all products`);
  console.log(`   POST   /api/products      - Create product`);
  console.log(`   PUT    /api/products/:id  - Update product`);
  console.log(`   DELETE /api/products/:id  - Delete product`);
  console.log(`   GET    /api/stats         - Get inventory stats`);
});
