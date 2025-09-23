'use client';

import React, { useState } from 'react';
import { Search, Plus, CreditCard, Settings, ChevronDown } from 'lucide-react';

export default function AddWalletPage() {
  const [walletAddress, setWalletAddress] = useState('https://ip.interledger-test.dev/ejemplo');
  const [keyId, setKeyId] = useState('');
  const [keyIdentifier, setKeyIdentifier] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // para cookies si usas auth
        body: JSON.stringify({ walletAddress, keyId, keyIdentifier }),
      });

      if (!res.ok) throw new Error('Error al agregar wallet');

      const data = await res.json();
      console.log('Wallet agregada:', data);
      // Aquí podrías limpiar el form o redirigir
    } catch (err) {
      console.error(err);
      alert('Error al agregar wallet');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-32 bg-teal-500 text-white flex flex-col items-center py-6 space-y-8">
        <div className="text-2xl font-bold">Olbil</div>
        <nav className="flex flex-col space-y-6">
          <Search className="w-6 h-6 cursor-pointer hover:text-teal-200" />
          <Plus className="w-6 h-6 cursor-pointer hover:text-teal-200" />
          <CreditCard className="w-6 h-6 cursor-pointer hover:text-teal-200 bg-yellow-400 text-teal-700 p-1 rounded" />
          <CreditCard className="w-6 h-6 cursor-pointer hover:text-teal-200" />
        </nav>
        <div className="mt-auto">
          <Settings className="w-6 h-6 cursor-pointer hover:text-teal-200" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* User Profile */}
        <div className="absolute top-6 right-6 flex items-center">
          <span className="text-gray-700 mr-3">nombre_usuario</span>
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg">
            👨‍💼
          </div>
        </div>

        {/* Form */}
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">Agregar wallet</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Wallet Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="https://ip.interledger-test.dev/ejemplo"
              />
            </div>

            {/* Key Identifier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identificador de la clave
              </label>
              <textarea
                value={keyIdentifier}
                onChange={(e) => setKeyIdentifier(e.target.value)}
                placeholder="Crea un nombre increíble para poder identificar a tu wallet."
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none h-24"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
            >
              Agregar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
