import axios from "axios";

const BASE_URL = "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost:3000/",
  },
});

export default axiosInstance;
