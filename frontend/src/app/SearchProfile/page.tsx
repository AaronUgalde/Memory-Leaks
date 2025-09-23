'use client';

import React, { useState } from 'react';
import { Search, Plus, CreditCard, Settings, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  title: string;
  description: string;
  followers: string;
  donorStats: string;
  avatar: string;
}

const ProfileSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const profiles: Profile[] = [
    {
      id: '1',
      title: 'Perfil encontrado',
      description: 'descripción',
      followers: '# seguidores',
      donorStats: 'estadísticas de donadores',
      avatar: '👨‍💼'
    },
    {
      id: '2',
      title: 'Perfil encontrado',
      description: 'descripción',
      followers: '# seguidores',
      donorStats: 'estadísticas de donadores',
      avatar: '👨‍💼'
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-32 bg-teal-500 text-white flex flex-col items-center py-6 space-y-8">
        <div className="text-2xl font-bold">Olbil</div>
        
        <nav className="flex flex-col space-y-6">
          <Search 
            className="w-6 h-6 cursor-pointer hover:text-teal-200" 
            onClick={() => router.push('/SearchProfile')} 
          />
          <Plus 
            className="w-6 h-6 cursor-pointer hover:text-teal-200" 
            onClick={() => alert('Funcionalidad en desarrollo')} 
          />
          <CreditCard 
            className="w-6 h-6 cursor-pointer hover:text-teal-200" 
            onClick={() => router.push('/AddWallet')} 
          />
        </nav>
        
        <div className="mt-auto">
          <Settings className="w-6 h-6 cursor-pointer hover:text-teal-200" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl text-gray-600">Búsqueda de perfiles</h1>
          
          {/* User Profile */}
          <div className="flex items-center">
            <span className="text-gray-700 mr-3" onClick={() => router.push('/')}>nombre_usuario</span>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg">
              👨‍💼
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <span className="text-gray-400 text-sm">⌘</span>
          </div>
        </div>

        {/* Search Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {profiles.map((profile) => (
            <div key={profile.id} className="bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  {profile.avatar}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {profile.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {profile.description}
                  </p>
                  <p className="text-sm text-teal-600 font-medium mb-3">
                    {profile.followers}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {profile.donorStats}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSearch;