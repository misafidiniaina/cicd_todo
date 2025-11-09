import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5020"
});

export default API;
