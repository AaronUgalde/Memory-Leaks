'use client';

import React, { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/context/AuthContext'; // Asegúrate de importar tu función login
import PerroLogin from '../../../assets/perro_dueño_login.png';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {    
    try {
      await login(email, password, rememberMe);
      // Redirecciona al landing page después del login
      router.push('/');
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  const handleRegister = () => {
    router.push('/registration-page');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex items-center justify-between gap-8">
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <h1 className="text-xl font-bold text-gray-900">Your Logo</h1>
        </div>

        {/* Login Form Section */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Bienvenido</h2>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Iniciar Sesión</h1>
              <p className="text-gray-600">
                ¿Está tu mascota lista para unas vacaciones?
              </p>
            </div>

            {/* Login Form */}
            <div className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingresa tu correo
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="Ingresa tu correo"
                  className="w-full"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    placeholder="Ingresa tu contraseña"
                    className="w-full pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                    Recuerda mi contraseña
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Login Button */}
              <Button
                onClick={handleLogin}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Login
              </Button>

              {/* Register Link */}
              <div className="text-center">
                <span className="text-gray-600">¿Aún no tienes una cuenta? </span>
                <button
                  type="button"
                  onClick={handleRegister}
                  className="font-semibold text-black hover:text-gray-800 underline"
                >
                  Regístrate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cat Image Section */}
        <div className="hidden lg:flex w-full max-w-2xl justify-center items-center">
          <div className="relative">
            {/* Puedes colocar tu imagen aquí */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
