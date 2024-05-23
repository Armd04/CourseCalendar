'use client';

import { useRouter } from 'next/navigation';
import styles from '../styles/LogoutButton.module.css';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    router.push('/login');
  };

  return (
    <button onClick={handleLogout} className={styles.logoutButton}>
      Logout
    </button>
  );
};

export default LogoutButton;
