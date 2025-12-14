import axiosInstance from "../AxiosConfig.js";

const profile = async () => {
  const URL_API = "/profile";

  return await axiosInstance.get(URL_API);
};

export default { profile };
