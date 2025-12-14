import axios from "../AxiosConfig.js";
const loginApi = async (data) => {
  const URL_API = "/Login";

  return await axios.post(URL_API, data, { withCredentials: true });
};

const Create_User = async (data) => {
  const URL_API = "/createUser";
  return await axios.post(URL_API, data);
};

const APIUser = { loginApi, Create_User };
export default APIUser;
