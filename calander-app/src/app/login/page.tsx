"use client";

import React, { useState } from 'react';
import axios from 'axios';
import '../styles/login.css';
import { useRouter } from 'next/navigation';

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
      router.push('/logged-in');
    } catch (error) {
      setMessage('Login failed. Please try again.');
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
