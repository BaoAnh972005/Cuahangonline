import axiosInstance from "../AxiosConfig.js";

const addSP = async (data) => {
  const URL_API = "admin/addSanpham";

  return await axiosInstance.post(URL_API, data);
};
const xemkho = async () => {
  const URL_API = "admin/xemkho";
  return await axiosInstance.get(URL_API);
};
const SP_client = async () => {
  const URL_API = "/SP";
  return await axiosInstance.get(URL_API);
};
const xemCTSP = async (sanpham_id) => {
  console.log(sanpham_id);
  const URL_API = `/SPCT/${sanpham_id}`;
  return await axiosInstance.get(URL_API);
};
const bestseller = async () => {
  const URL_API = `/bestseller`;
  return await axiosInstance.get(URL_API);
};
const random20 = async () => {
  const URL_API = `/sp20`;
  return await axiosInstance.get(URL_API);
};
const SP_ofshop = async () => {
  const URL_API = `/admin/xemsanpham`;
  return await axiosInstance.get(URL_API);
};
const suaSP = async (data) => {
  console.log("data sửa sp", data);
  const URL_API = `/admin/suasanpham/${data.sanpham_id}`;
  return await axiosInstance.patch(URL_API, data);
};
const delete_sp = async (sanpham_id) => {
  const URL_API = `/admin/deletesanpham/${sanpham_id}`;
  return await axiosInstance.delete(URL_API);
};
const SP = {
  addSP,
  xemkho,
  SP_client,
  xemCTSP,
  bestseller,
  random20,
  SP_ofshop,
  suaSP,
  delete_sp,
};
export default SP;
