import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Hardcoded for local dev for now
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
