'use client';

import { useState } from 'react';
import styles from '../styles/RegisterForm.module.css';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
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
        setMessage('Registration successful.');
        router.push('/login');
      } else {
        setMessage('Registration failed. Please try again.');
      }
    } catch (error) {
      setMessage('Registration failed. Please try again.');
    }
  };

  return (
    <div className={styles.body}>
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
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
};

export default RegisterForm;
