import axiosInstance from "../AxiosConfig.js";


const chekout_pay = async (data) => {
  const URL_API = "/checkout";

  return await axiosInstance.post(URL_API, data);
};

const chekout = { chekout_pay };
export default chekout;
