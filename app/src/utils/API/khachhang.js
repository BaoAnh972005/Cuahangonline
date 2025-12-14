import axiosInstance from "../AxiosConfig.js";

const newkhachhang = async (data) => {
  const URL_API = "/newkhachhang";

  return await axiosInstance.post(URL_API, data);
};
const newdiachi = async (data) => {
  const URL_API = "/newdiachi";

  return await axiosInstance.post(URL_API, data);
};
const xemkh = async () => {
  const URL_API = "/xemkh";

  return await axiosInstance.get(URL_API);
};
const khachhang = { newkhachhang, newdiachi, xemkh };
export default khachhang;
