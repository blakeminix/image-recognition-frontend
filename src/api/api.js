import axios from 'axios';

const baseURL = process.env.VUE_APP_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});


export default axiosInstance;