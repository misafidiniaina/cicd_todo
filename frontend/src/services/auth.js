import axios from "axios";

export const loginUser = async (username, password) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Login failed');
  }

  return await res.json();
};


export const registerUser = async (username, password) => {
  const res = await axios.post(`${import.meta.env.VITE_API_URL}/register`, { username, password });
  return res.data; // { message, token }
};