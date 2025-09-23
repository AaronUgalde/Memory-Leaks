// src/app/profile/[userId]/page.tsx
import ProfileClient from './ProfileClient';
import api from '@/lib/api';

type Params = { params: { userId: string } };

async function getUser(userId: string) {
  try {
    const res = await api.get(`/users/${userId}`);
    return res.data; // axios ya parsea JSON
  } catch (err: any) {
    if (err.response?.status === 404) {
      return null;
    }
    throw err; // deja que Next maneje el error (500)
  }
}

export default async function Page({ params }: Params) {
  const { userId } = await params;
  const user = await getUser(userId);

  if (!user) {
    return <div>Usuario no encontrado</div>;
  }
  console.log('user from API', user);


  // Pasamos el usuario inicial al client component
  return <ProfileClient initialUser={user} />;
}
