'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/LoginForm.module.css';
import WaterlooLogo from '../styles/WaterlooFullLogo.png';
import hideIcon from '../styles/hide.png'; // Hide icon path
import viewIcon from '../styles/view.png'; // View icon path

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      router.push('/');
    } catch (error) {
      setMessage('Login failed. Wrong username or password.');
      setError(true); // Set error state to true if login fails
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`d-flex flex-column align-items-center vh-100 ${styles.body}`}>
      <div className={styles.bar}></div>
      <div className={styles.logoContainer}>
        <Image 
          src={WaterlooLogo} 
          alt="Waterloo Logo" 
          priority 
          width={400} 
          height={400} 
          style={{ width: 'auto', height: 'auto' }} 
        />
      </div>
      <h1 className={styles.CCheading}>Course Calendar</h1>
      <div className={`card ${styles.loginContainer}`}>
        <h1 className={styles.Loginheading}>Log in</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={`mt-3 mb-3 ${styles.inputGroup} ${error ? styles.errorInput : ''}`}>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`form-control ${styles.inputText}`}
              placeholder=" "
            />
            <label className={styles.label} htmlFor="username">Username</label>
          </div>
          <div className={`mt-3 mb-3 ${styles.inputGroup} ${error ? styles.errorInput : ''}`}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              className={`form-control ${styles.inputPassword}`}
              placeholder=" "
              onChange={(e) => setPassword(e.target.value)}
            />
            <label className={styles.label} htmlFor="password">Password</label>
            <button type="button" onClick={togglePasswordVisibility} className={styles.eyeButton}>
              <Image src={showPassword ? viewIcon : hideIcon} alt="Toggle Password Visibility" width={24} height={24} />
            </button>
          </div>
          <div className="d-flex justify-content-center">
            <button type="submit" className={`w-40 ${styles.button}`} disabled={loading}>
                {loading ? <span className={styles.loading}>Loading<span className={styles.dots}></span></span> : 'Log in'}
            </button>
          </div>
        </form>
        {message && <p className={`mt-3 text-center ${styles.message} ${error ? styles.errorMessage : ''}`}>{message}</p>}
        <p className={`mt-3 text-center ${styles.registerText}`}>
          Don't have an account? <Link href="/register"><span className={styles.registerLink}>Register</span></Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
