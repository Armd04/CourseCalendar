'use client';

import { useState } from 'react';
import styles from '../styles/RegisterForm.module.css';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import WaterlooLogo from '../styles/WaterlooFullLogo.png';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false as boolean);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(false);
    let response;

    if (username.trim() === '') {
      setMessage('Username is required.');
      setError(true);
      setLoading(false);
    }
  
    else if (email.trim() === '') {
      setMessage('Email is required.');
      setError(true);
      setLoading(false);
    }
  
    else if (password.trim() === '') {
      setMessage('Password is required.');
      setError(true);
      setLoading(false);
    }

    else {
      try {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/register/`,
          {
            username,
            email,
            password,
          },
          {
            headers: {
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );

        if (response.status === 201) {
          router.push('/login');
        } else {
          setMessage(response.data.message || 'Registration failed. Please try again.');
          setError(true);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setMessage(error.response?.data.message || 'Registration failed. Please try again.');
        } else {
          setMessage('Registration failed. Please try again.');
        }
        setError(true);
      } finally {
        setLoading(false);
      }
    }
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
      <div className={`card ${styles.RegisterContainer}`}>
        <h1 className={styles.Registerheading}>Register</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={`mt-3 mb-3 ${styles.inputGroup}`}>
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
          <div className={`mt-3 mb-3 ${styles.inputGroup}`}>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`form-control ${styles.inputText}`}
              placeholder=" "
            />
            <label className={styles.label} htmlFor="email">Email</label>
          </div>
          <div className={`mt-3 mb-3 ${styles.inputGroup}`}>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`form-control ${styles.inputPassword}`}
              placeholder=" "
            />
            <label className={styles.label} htmlFor="password">Password</label>
          </div>
          <div className="d-flex justify-content-center">
            <button type="submit" className={`btn btn-primary w-40 ${styles.button}`} disabled={loading}>
              {loading ? <span className={styles.loading}>Loading<span className={styles.dots}></span></span> : 'Register'}
            </button>
          </div>
          {message && <p className={`mt-3 text-center ${styles.message} ${error ? styles.errorMessage : ''}`}>{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
