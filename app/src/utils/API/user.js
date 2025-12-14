import axios from "axios";

const APIUser = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

APIUser.profile = () => APIUser.get("/user/profile");

export default APIUser;
