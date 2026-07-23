import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Search } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/products';
const STATS_URL = 'http://localhost:5000/api/stats';

export default function InventoryApp() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sku, setSku] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Fetch products and stats
  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(STATS_URL);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !price || !quantity || !sku) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          price: parseFloat(price),
          quantity: parseInt(quantity),
          sku
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create product');
      }

      const newProduct = await response.json();
      setProducts([...products, newProduct]);
      setName('');
      setPrice('');
      setQuantity('');
      setSku('');
      fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update product');
      }

      const updatedProduct = await response.json();
      setProducts(products.map(p => p.id === id ? updatedProduct : p));
      setEditingId(null);
      fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete product');
      setProducts(products.filter(p => p.id !== id));
      fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  let filteredProducts = products;
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (filterCategory !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === filterCategory);
  }

  if (sortBy === 'price') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'quantity') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.quantity - b.quantity);
  } else {
    filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
  }

  const categories = stats?.categories || [];
  const lowStockCount = products.filter(p => p.quantity < 5).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">📦 Inventory Management</h1>
          <p className="text-slate-400">Professional product inventory dashboard</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-lg text-white shadow-lg">
              <p className="text-sm text-blue-200">Total Products</p>
              <p className="text-4xl font-bold">{stats.totalProducts}</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-lg text-white shadow-lg">
              <p className="text-sm text-green-200">Inventory Value</p>
              <p className="text-3xl font-bold">${stats.totalInventoryValue}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 rounded-lg text-white shadow-lg">
              <p className="text-sm text-yellow-200">Low Stock Alerts</p>
              <p className="text-4xl font-bold">{lowStockCount}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-lg text-white shadow-lg">
              <p className="text-sm text-purple-200">Categories</p>
              <p className="text-4xl font-bold">{stats.categories.length}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Add Product Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleCreate} className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Plus size={24} /> Add Product
              </h2>

              <input
                type="text"
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 mb-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 mb-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Clothing</option>
                <option>Food</option>
                <option>Other</option>
              </select>

              <input
                type="number"
                placeholder="Price"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-3 mb-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />

              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-3 mb-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />

              <input
                type="text"
                placeholder="SKU"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full p-3 mb-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition"
              >
                {loading ? 'Creating...' : 'Add Product'}
              </button>
            </form>
          </div>

          {/* Products List */}
          <div className="lg:col-span-2">
            {/* Search and Filter */}
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="quantity">Sort by Quantity</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
              {loading && products.length === 0 && (
                <div className="p-8 text-center text-slate-400">Loading products...</div>
              )}

              {!loading && filteredProducts.length === 0 && (
                <div className="p-8 text-center text-slate-400">No products found</div>
              )}

              {filteredProducts.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700 border-b border-slate-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Product</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Category</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Price</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Quantity</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Value</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {filteredProducts.map(product => (
                        <tr key={product.id} className="hover:bg-slate-700 transition">
                          {editingId === product.id ? (
                            <>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  value={editData.name || ''}
                                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                                  className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={editData.category || ''}
                                  onChange={(e) => setEditData({...editData, category: e.target.value})}
                                  className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white"
                                >
                                  <option>Electronics</option>
                                  <option>Furniture</option>
                                  <option>Clothing</option>
                                  <option>Food</option>
                                  <option>Other</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editData.price || ''}
                                  onChange={(e) => setEditData({...editData, price: parseFloat(e.target.value)})}
                                  className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  value={editData.quantity || ''}
                                  onChange={(e) => setEditData({...editData, quantity: parseInt(e.target.value)})}
                                  className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white"
                                />
                              </td>
                              <td className="px-6 py-4 text-white">${((editData.price || product.price) * (editData.quantity || product.quantity)).toFixed(2)}</td>
                              <td className="px-6 py-4 flex gap-2">
                                <button
                                  onClick={() => handleUpdate(product.id)}
                                  disabled={loading}
                                  className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition disabled:opacity-50"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
                                >
                                  <X size={18} />
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 text-white font-semibold">{product.name}</td>
                              <td className="px-6 py-4 text-slate-300">{product.category}</td>
                              <td className="px-6 py-4 text-white">${product.price.toFixed(2)}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  product.quantity < 5 ? 'bg-red-900 text-red-200' :
                                  product.quantity < 10 ? 'bg-yellow-900 text-yellow-200' :
                                  'bg-green-900 text-green-200'
                                }`}>
                                  {product.quantity} units
                                </span>
                              </td>
                              <td className="px-6 py-4 text-white font-semibold">${(product.price * product.quantity).toFixed(2)}</td>
                              <td className="px-6 py-4 flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingId(product.id);
                                    setEditData(product);
                                  }}
                                  disabled={loading}
                                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition disabled:opacity-50"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  disabled={loading}
                                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition disabled:opacity-50"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="mt-4 text-slate-400 text-sm">
              Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
