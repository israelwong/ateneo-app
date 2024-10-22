import validateToken from '@/app/libs/validateToken';
import Dashboard from '@/app/components/Dashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard'
}

export default async function DashboardPage() {
  const user = await validateToken();

  if (!user) {
    return null; // No renderiza nada si no hay usuario
  }

  return (
    <Dashboard user={user} />
  );
}