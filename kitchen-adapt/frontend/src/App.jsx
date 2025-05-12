import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [recipe, setRecipe] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [material, setMaterial] = useState('');
  const [response, setResponse] = useState(null);

  const calcVolume = (dimStr) => {
    try {
      const [length, width] = dimStr.toLowerCase().replace('inches', '').trim().split('x').map(Number);
      return Math.round(length * width * 2); // basic volume assuming 2" height
    } catch {
      return 1024; // default fallback
    }
  };

  const handleSubmit = async () => {
    const volume = calcVolume(dimensions);

    try {
      const res = await axios.post(`${API_URL}/api/adjust`, {
        original: { shape: 'rectangle', material: 'glass', dimensions: '9x13 inches', volume: 1827 },
        target: { shape: 'rectangle', material, dimensions, volume },
        baseTime: 45,
        baseTemp: 350,
        ingredients: [
          { name: 'flour', quantity: 2 },
          { name: 'sugar', quantity: 1.5 }
        ]
      });
      setResponse(res.data);
    } catch (err) {
      console.error("Error calling backend:", err);
      alert("Failed to adjust recipe. Check your backend connection.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-copper mb-4">Kitchen Adapt</h1>
      <textarea
        className="w-full p-2 border border-gray-300 rounded mb-4"
        rows="5"
        placeholder="Paste your recipe here..."
        value={recipe}
        onChange={e => setRecipe(e.target.value)}
      />
      <input
        type="text"
        placeholder="Your cookware dimensions (e.g. 8x8 inches)"
        className="w-full p-2 border border-gray-300 rounded mb-2"
        onChange={e => setDimensions(e.target.value)}
      />
      <input
        type="text"
        placeholder="Material (e.g. metal, glass)"
        className="w-full p-2 border border-gray-300 rounded mb-4"
        onChange={e => setMaterial(e.target.value)}
      />
      <button
        className="bg-copper text-white px-4 py-2 rounded shadow"
        onClick={handleSubmit}
      >
        Adjust Recipe
      </button>

      {response && (
        <div className="mt-6 bg-white rounded shadow p-4">
          <h2 className="text-xl font-bold mb-2">Adjusted Recipe</h2>
          <p><strong>New Time:</strong> {response.newTime} min</p>
          <p><strong>New Temp:</strong> {response.newTemp}°F</p>
          <h3 className="font-semibold mt-2">Scaled Ingredients:</h3>
          <ul className="list-disc list-inside">
            {response.scaledIngredients.map((i, idx) => (
              <li key={idx}>{i.quantity} units of {i.name}</li>
            ))}
          </ul>
          <h3 className="font-semibold mt-2">Tips:</h3>
          <ul className="list-disc list-inside">
            {response.notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
