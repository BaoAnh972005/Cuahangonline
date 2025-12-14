
import axiosInstance from "../../AxiosConfig.js";

const getallbill = async () => {
  const URL_API = "/getallbill";

  return await axiosInstance.get(URL_API);
};
const getallbillshop = async () => {
  const URL_API = "/getallbillshop";

  return await axiosInstance.get(URL_API);
};
const updatebill = async (data) => {
  console.log("data ", data);
  const URL_API = "/updatebill";

  return await axiosInstance.put(URL_API, data);
};
const updateBillRefunded = async (data) => {
  console.log("data ", data);
  const URL_API = "/updateBillRefunded";

  return await axiosInstance.put(URL_API, data);
};
const getBillDetail = async (data) => {
  console.log("data ", data);
  const URL_API = `/getBillDetail/${data}`;

  return await axiosInstance.get(URL_API);
};
const feedBack = async (data) => {
  const URL_API = `/newfeedback`;

  return await axiosInstance.post(URL_API, data);
};
const check_feedback = async (data) => {
  const URL_API = `/checkfeedback`;
  console.log("dữ liệu api feedBack", data);

  return await axiosInstance.get(URL_API, {
    params: {
      sanpham_id: data.sanpham_id,
      hoadon_id: data.hoadon_id,
    },
  });
};

const bill = {
  getallbill,
  getallbillshop,
  updatebill,
  updateBillRefunded,
  getBillDetail,
  feedBack,
  check_feedback,
};
export default bill;
