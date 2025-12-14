import axiosInstance from "../AxiosConfig.js";

const SendOTP = async () => {
  const URL_API = "/email/send-otp";

  return await axiosInstance.post(URL_API);
};
const verify_otp = async (data) => {
  const URL_API = "/email/verify-otp";

  return await axiosInstance.post(URL_API, data);
};

const otp = { SendOTP, verify_otp };
export default otp;
