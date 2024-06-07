'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/LoginForm.module.css';
import WaterlooLogo from '../styles/WaterlooFullLogo.png'; // Adjust the import path as needed

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
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
    <div className={`d-flex flex-column align-items-center vh-100 ${styles.body}`}>
      <div className={styles.bar}></div>
      <div className={styles.logoContainer}>
        <Image src={WaterlooLogo} alt="Waterloo Logo" layout="intrinsic" width={400} height={400} />
      </div>
      <div className={`card ${styles.loginContainer}`}>
        <h1 className={styles.heading}>Log in</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={`form-label ${styles.label}`} htmlFor="username">Email</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`form-control ${styles.inputText}`}
            placeholder="Email"
          />
          <label className={`form-label ${styles.label}`} htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`form-control ${styles.inputPassword}`}
            placeholder="Password"
          />
          <button type="submit" className={`btn btn-primary w-100 ${styles.button}`}>Login</button>
        </form>
        {message && <p className={`mt-3 text-danger text-center ${styles.message}`}>{message}</p>}
        <p className={`mt-3 text-center ${styles.registerLink}`}>
          Don't have an account? <Link href="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;