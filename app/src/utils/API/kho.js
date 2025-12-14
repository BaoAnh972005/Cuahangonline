import axiosInstance from "../AxiosConfig.js";

const xemthongtinkho = async () => {
  const URL_API = "admin/xemthongtinkho";

  return await axiosInstance.get(URL_API);
};
const nhapkho = async (data) => {
  const URL_API = "admin/nhapkho";

  return await axiosInstance.put(URL_API, data);
};
const newkho = async (data) => {
  const URL_API = "admin/addkho";

  return await axiosInstance.post(URL_API, data);
};

const KHo = { xemthongtinkho, nhapkho ,newkho};
export default KHo;
