'use client';


import { useState } from 'react';
import styles from '../styles/RegisterForm.module.css';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/register/`, {
      headers: {
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      username,
      email,
      password,
    });

    if (response.status === 201) {
      alert('Registration successful.');
      router.push('/login');
    } else {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className={styles.submitButton}>Register</button>
    </form>
  );
};

export default RegisterForm;
