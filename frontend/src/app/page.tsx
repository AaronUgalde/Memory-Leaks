import React from 'react';
import { Search, Plus, CreditCard, Settings } from 'lucide-react';

interface Transaction {
  id: string;
  user: string;
  operation: string;
  amount: string;
  date: string;
  avatar: string;
}

const Dashboard: React.FC = () => {
  const transactions: Transaction[] = [
    { id: '1', user: '@nombre_usuario', operation: 'Envío', amount: '$ xxx', date: '1/11/2025', avatar: '🎭' },
    { id: '2', user: '@nombre_usuario', operation: 'Depósito', amount: '$ xxx', date: '1/11/2025', avatar: '👨‍💼' },
    { id: '3', user: '@nombre_usuario', operation: 'Depósito', amount: '$ xxx', date: '1/11/2025', avatar: '👨‍🦱' },
    { id: '4', user: '@nombre_usuario', operation: 'Envío', amount: '$ xxx', date: '1/11/2025', avatar: '👨‍🦳' },
  ];

  const walletAddresses = [
    { name: 'wallet_adress_1', label: 'Nombre' },
    { name: 'wallet_adress_2', label: 'Nombre' },
    { name: 'wallet_adress_2', label: 'Nombre' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-32 bg-teal-500 text-white flex flex-col items-center py-6 space-y-8">
        <div className="text-2xl font-bold">Olbil</div>
        
        <nav className="flex flex-col space-y-6">
          <Search className="w-6 h-6 cursor-pointer hover:text-teal-200" />
          <Plus className="w-6 h-6 cursor-pointer hover:text-teal-200" />
          <CreditCard className="w-6 h-6 cursor-pointer hover:text-teal-200 bg-teal-600 p-1 rounded" />
          <CreditCard className="w-6 h-6 cursor-pointer hover:text-teal-200" />
        </nav>
        
        <div className="mt-auto">
          <Settings className="w-6 h-6 cursor-pointer hover:text-teal-200" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-start">
          {/* Left Section */}
          <div className="flex-1 mr-8">
            {/* Profile Section */}
            <div className="flex items-center mb-8">
              <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-4xl mr-6">
                🎭
              </div>
              <div>
                <h1 className="text-2xl font-bold text-teal-700 mb-2">Nombre Apellido(s)</h1>
                <p className="text-gray-600">nombre_usuario</p>
              </div>
            </div>

            {/* Transactions Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Transacciones</h2>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b">
                  <div className="font-medium text-gray-700">Usuario</div>
                  <div className="font-medium text-gray-700">Operación</div>
                  <div className="font-medium text-gray-700">Cantidad</div>
                  <div className="font-medium text-gray-700 flex items-center">
                    Fecha 
                    <span className="ml-1">↓</span>
                  </div>
                  <div></div>
                </div>

                {/* Table Rows */}
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-lg mr-2">
                        {transaction.avatar}
                      </span>
                      <span className="text-gray-700">{transaction.user}</span>
                    </div>
                    <div className="text-gray-700">{transaction.operation}</div>
                    <div className="text-gray-700">{transaction.amount}</div>
                    <div className="text-gray-700">{transaction.date}</div>
                    <div>
                      <button className="text-teal-600 hover:text-teal-800 font-medium">
                        Ver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Wallet List */}
          <div className="w-80">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Lista de wallet adress</h3>
              
              <div className="space-y-3">
                {walletAddresses.map((wallet, index) => (
                  <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center mr-3">
                      <span className="text-purple-600 text-sm">📱</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{wallet.label}</div>
                      <div className="text-sm font-medium text-gray-700">{wallet.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;