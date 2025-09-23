'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../../../components/ui/Input';
import { FormSection } from '../../../components/ui/FormSection';
import { Button } from '../../../components/ui/Button';
import api from '../../lib/api';

interface RegistrationForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'individual' | 'organization';
  displayName: string;
  organizationType?: string;
  verificationStatus?: string;
}

export default function RegistrationPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegistrationForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'individual',
    displayName: '',
    organizationType: '',
    verificationStatus: 'pending'
  });

  const updateField = (field: keyof RegistrationForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const payload: any = {
      username: form.username,
      email: form.email,
      password: form.password,
      user_type: form.userType,
      display_name: form.displayName,
    };

    if (form.userType === 'organization') {
      payload.organization_type = form.organizationType;
      payload.verification_status = form.verificationStatus;
    }

    try {
      const res = await api.post('/auth/register', payload);
      console.log("Registro exitoso:", res.data);
      router.push('/LoginPage');
    } catch (err) {
      console.error(err);
      alert("Error al registrarse");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-xl font-bold text-gray-900">Your Logo</div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Registrarse</h2>
          <p className="text-gray-600">Donde las mascotas descansan de sus dueños</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <FormSection title="Datos de la cuenta">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Usuario" value={form.username} onChange={(v) => updateField('username', v)} required />
              <Input type="email" label="Correo electrónico" value={form.email} onChange={(v) => updateField('email', v)} required />
              <Input label="Nombre para mostrar" value={form.displayName} onChange={(v) => updateField('displayName', v)} required />
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de usuario</label>
                <select
                  value={form.userType}
                  onChange={(e) => updateField('userType', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="individual">Individual</option>
                  <option value="organization">Organización</option>
                </select>
              </div>

              <Input type="password" label="Contraseña" value={form.password} onChange={(v) => updateField('password', v)} required />
              <Input type="password" label="Confirmar contraseña" value={form.confirmPassword} onChange={(v) => updateField('confirmPassword', v)} required />
            </div>
          </FormSection>

          {form.userType === 'organization' && (
            <FormSection title="Información de organización">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <Input label="Tipo de organización" value={form.organizationType || ''} onChange={(v) => updateField('organizationType', v)} required />
              </div>
            </FormSection>
          )}

          <Button variant="primary" size="lg" className="w-full">Registrarse</Button>
          <div className="text-center">
            <span className="text-gray-600">¿Ya tienes cuenta? </span>
            <button type="button" className="text-gray-600 hover:text-gray-800 underline">Inicia sesión</button>
          </div>
        </form>
      </div>
    </div>
  );
}
