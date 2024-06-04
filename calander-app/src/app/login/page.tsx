'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';  // Import Link from 'next/link'
import styles from '../styles/LoginForm.module.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [user, setUser] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/login/`, {
        headers: {
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        username,
        password,
      });
      const { access, refresh } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setMessage('Login successful.');
      router.push('/');
    } catch (error) {
      setMessage('Login failed. Please try again.');
    }
  };

  return (
    <div className={styles.body}>
      <div className={styles.loginContainer}>
        <h1 className={styles.heading}>Log in</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label} htmlFor="username">Email</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.inputText}
            placeholder="Email"
          />
          <label className={styles.label} htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputPassword}
            placeholder="Password"
          />
          <button type="submit" className={styles.button}>Login</button>
        </form>
        {message && <p className={styles.message}>{message}</p>}
        <p className={styles.registerLink}>
          Don't have an account? <Link href="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
