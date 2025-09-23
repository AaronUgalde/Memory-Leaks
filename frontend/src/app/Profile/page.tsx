'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Plus, CreditCard, Settings, BarChart3, Heart, Share, X } from 'lucide-react';
import { useParams } from "next/navigation";

interface User {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  profile_image_url: string;
  website_url: string;
  user_type: string;
  organization_type: string;
  verification_status: boolean;
  allow_donations: boolean;
  created_at: string;
}

interface Donor {
  id: string;
  name: string;
  followers: string;
  rank: number;
}

interface Post {
  id: string;
  image: string;
  description: string;
  likes: number;
  shares: number;
}

const ProfilePageWithDonation: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDonationModal, setShowDonationModal] = useState(true);
  const [donationAmount, setDonationAmount] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  

  // Extraer el ID desde la ruta: /profile/[id]
  //const userId = pathname.split('/').pop();
  const {userId } = useParams();

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}`);
        if (!res.ok) throw new Error('Usuario no encontrado');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleDonate = () => {
    console.log('Donating:', donationAmount);
    setShowDonationModal(false);
  };

  const topDonors: Donor[] = [
    { id: '1', name: 'Donador numero 1', followers: '# seguidores', rank: 1 },
    { id: '2', name: 'Donador num. 2', followers: '# seguidores', rank: 2 },
    { id: '3', name: 'Donador num. 3', followers: '# seguidores', rank: 3 },
  ];

  const posts: Post[] = [
    {
      id: '1',
      image: '/api/placeholder/300/200',
      description: 'Aquí va la descripción de la publicación',
      likes: 10,
      shares: 7
    },
    {
      id: '2',
      image: '/api/placeholder/300/200',
      description: 'Aquí va la descripción de la publicación',
      likes: 10,
      shares: 7
    }
  ];

  if (loading) return <div>Cargando perfil...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-32 bg-teal-500 text-white flex flex-col items-center py-6 space-y-8">
        <div className="text-2xl font-bold">Olbil</div>
        <nav className="flex flex-col space-y-6">
          <Search className="w-6 h-6 cursor-pointer hover:text-teal-200" onClick={() => router.push('/SearchProfile')} />
          <Plus className="w-6 h-6 cursor-pointer hover:text-teal-200" onClick={() => alert('Funcionalidad en desarrollo')} />
          <CreditCard className="w-6 h-6 cursor-pointer hover:text-teal-200" onClick={() => router.push('/AddWallet')} />
        </nav>
        <div className="mt-auto">
          <Settings className="w-6 h-6 cursor-pointer hover:text-teal-200" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-end items-center mb-8">
          <div className="flex items-center">
            <span className="text-gray-700 mr-3">{user?.display_name || 'Usuario'}</span>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg bg-blue-500">
              {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt="Profile" className="w-10 h-10 rounded-full" />
              ) : '👨‍💼'}
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left Section - Profile Info */}
          <div className="flex-1">
            {/* Hero Image */}
            <div className="relative mb-6 rounded-lg overflow-hidden">
              <img src="/api/placeholder/800/200" alt="Profile banner" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
            </div>

            {/* Profile Section */}
            <div className="flex items-start mb-8">
              <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-4xl mr-6 -mt-12 relative z-10 border-4 border-white">
                {user?.profile_image_url ? <img src={user.profile_image_url} alt="Avatar" className="w-full h-full rounded-full" /> : '🎭'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{user?.display_name}</h1>
                    <p className="text-teal-600 font-medium">{user?.bio || '# Seguidores'}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-6 py-2 rounded-lg font-medium flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Ver estadísticas
                    </button>
                    <button 
                      onClick={() => setShowDonationModal(true)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Donar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Publications */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Publicaciones</h2>
              <div className="grid grid-cols-2 gap-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <img src={post.image} alt="Post" className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <p className="text-gray-700 mb-3">{post.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1 text-red-500" />
                          {post.likes}
                        </div>
                        <div className="flex items-center">
                          <Share className="w-4 h-4 mr-1" />
                          {post.shares}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Top Donors */}
          <div className="w-80">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Principales Donadores</h3>
              <div className="space-y-3">
                {topDonors.map((donor) => (
                  <div key={donor.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center mr-3">
                      {donor.rank === 1 && <span className="text-yellow-500 text-lg">⭐</span>}
                      {donor.rank === 2 && <span className="text-gray-400 text-lg">⭐</span>}
                      {donor.rank === 3 && <span className="text-orange-600 text-lg">⭐</span>}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{donor.name}</div>
                      <div className="text-sm text-gray-500">{donor.followers}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-semibold text-teal-700">
                Estás a unos pasos de ayudar a alguien...
              </h3>
              <button onClick={() => setShowDonationModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingresa la Cantidad a enviar
              </label>
              <input
                type="text"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="$ xxx"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button onClick={() => setShowDonationModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors">
                Cancelar
              </button>
              <button onClick={handleDonate} className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                <span className="mr-2">📹</span>
                Donar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePageWithDonation;
