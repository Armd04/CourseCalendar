"use client";

import React, { useState } from 'react';
import axios from 'axios';

const LoggedIn: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [user, setUser] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUser(document.cookie.split('=')[1]);
    console.log(user);
    
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/logged-in/`, {
        headers: {
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        });
        const { username, email, courses } = response.data;
        setMessage(`Logged in as ${username}`);
    } catch (error) {
        setMessage('Not logged in');
    }
  };

  return (
    <div>
        <button onClick={handleSubmit}>Check if logged in</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoggedIn;
