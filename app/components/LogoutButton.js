'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <button
      id="nav-logout"
      onClick={handleLogout}
      className="btn btn-outline"
      style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', cursor: 'pointer' }}
    >
      Log Out
    </button>
  );
}
