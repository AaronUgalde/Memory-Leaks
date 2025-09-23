'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../../../components/ui/Input';
import { FormSection } from '../../../components/ui/FormSection';
import { Button } from '../../../components/ui/Button';
import api from '../../lib/api';

interface RegistrationForm {
  email: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  password: string;
  confirmPassword: string;
  telefonoPrincipal: string;
  tipoDomicilio: string;
  calle: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  numeroExterior: string;
  numeroInterior: string;
  telefonosEmergencia: string[];
}

export default function RegistrationPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegistrationForm>({
    email: '',
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    password: '',
    confirmPassword: '',
    telefonoPrincipal: '',
    tipoDomicilio: '',
    calle: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    numeroExterior: '',
    numeroInterior: '',
    telefonosEmergencia: ['', '', '', '', '']
  });

  const updateField = (field: keyof RegistrationForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateEmergencyPhone = (index: number, value: string) => {
    const newPhones = [...form.telefonosEmergencia];
    newPhones[index] = value;
    setForm(prev => ({
      ...prev,
      telefonosEmergencia: newPhones
    }));
  };

  const addEmergencyPhone = () => {
    setForm(prev => ({
      ...prev,
      telefonosEmergencia: [...prev.telefonosEmergencia, '']
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const payload = {
      email: form.email,
      password: form.password,
      nombre: form.nombre,
      apellido_paterno: form.primerApellido,
      apellido_materno: form.segundoApellido,
      tipo_domicilio: form.tipoDomicilio,
      calle: form.calle,
      colonia: form.colonia,
      ciudad: form.ciudad,
      estado: form.estado,
      codigo_postal: form.codigoPostal,
      numero_exterior: form.numeroExterior,
      numero_interior: form.numeroInterior,
      telefonoPrincipal: form.telefonoPrincipal,
      telefonosEmergencia: form.telefonosEmergencia.filter(phone => phone.trim() !== ""),
    };

    try {
      const res = await api.post('/auth/register', payload);
      console.log("Registro exitoso:", res.data);
      router.push('/LoginPage'); // Next.js navigation
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido</h1>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Registrarse</h2>
              <p className="text-gray-600">Donde las mascotas descansan de sus dueños</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <FormSection title="Información Personal">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input type="email" label="Correo electrónico" value={form.email} onChange={(v) => updateField('email', v)} placeholder="Ingresa tu correo electronico" required />
                  <Input label="Tipo de domicilio" value={form.tipoDomicilio} onChange={(v) => updateField('tipoDomicilio', v)} placeholder="Ingresa tu tipo de domicilio" />
                  <Input label="Nombre" value={form.nombre} onChange={(v) => updateField('nombre', v)} placeholder="Ingresa tu nombre" />
                  <Input label="Calle" value={form.calle} onChange={(v) => updateField('calle', v)} placeholder="Ingresa tu calle" />
                  <Input label="Primer apellido" value={form.primerApellido} onChange={(v) => updateField('primerApellido', v)} placeholder="Ingresa tu primer apellido" />
                  <Input label="Colonia" value={form.colonia} onChange={(v) => updateField('colonia', v)} placeholder="Ingresa tu colonia" />
                  <Input label="Segundo apellido" value={form.segundoApellido} onChange={(v) => updateField('segundoApellido', v)} placeholder="Ingresa tu segundo apellido" />
                  <Input label="Ciudad" value={form.ciudad} onChange={(v) => updateField('ciudad', v)} placeholder="Ingresa tu ciudad" />
                  <Input type="password" label="Contraseña" value={form.password} onChange={(v) => updateField('password', v)} placeholder="Ingresa tu contraseña" required />
                  <Input label="Estado" value={form.estado} onChange={(v) => updateField('estado', v)} placeholder="Ingresa tu Estado" />
                  <Input type="password" label="Confirmar contraseña" value={form.confirmPassword} onChange={(v) => updateField('confirmPassword', v)} placeholder="Confirma tu contraseña" required />
                  <Input label="Codigo postal" value={form.codigoPostal} onChange={(v) => updateField('codigoPostal', v)} placeholder="Ingresa tu Codigo postal" />
                  <Input label="Telefono principal" value={form.telefonoPrincipal} onChange={(v) => updateField('telefonoPrincipal', v)} placeholder="Telefono principal" required />
                  <Input label="Numero exterior" value={form.numeroExterior} onChange={(v) => updateField('numeroExterior', v)} placeholder="Ingresa tu numero exterior" />
                  <div className="md:col-span-2">
                    <Input label="Numero interior" value={form.numeroInterior} onChange={(v) => updateField('numeroInterior', v)} placeholder="Ingresa tu numero exterior" />
                  </div>
                </div>
              </FormSection>

              <Button variant="primary" size="lg" className="w-full">Registrate</Button>
              <div className="text-center">
                <span className="text-gray-600">Ya tienes una cuenta? </span>
                <button type="button" className="text-gray-600 hover:text-gray-800 underline">Inicia sesión</button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <FormSection title="Telefonos extra" className="h-fit">
              <div className="space-y-4">
                {form.telefonosEmergencia.map((phone, index) => (
                  <Input key={index} label={`Telefono de emergencia ${index + 1}`} value={phone} onChange={(v) => updateEmergencyPhone(index, v)} placeholder="Telefono de emergencia" />
                ))}
                <button type="button" onClick={addEmergencyPhone} className="w-full text-left text-gray-500 hover:text-gray-700 text-sm underline">
                  Agregar telefono de emergencia
                </button>
              </div>
            </FormSection>
          </div>
        </div>
      </div>
    </div>
  );
}
