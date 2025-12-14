import axiosInstance from "../../AxiosConfig.js";

const getfeedback = async (data) => {
  console.log("data lấy", data);
  const URL_API = "/getfeedback";

  return await axiosInstance.get(URL_API, {
    params: {
      sanpham_id: data.sanpham_id,
      shop_id: data.shop_id,
    },
  });
};

// feedbackofshop
const feedback_ofshop = async (data) => {
  console.log("data cuar shop", data);
  const URL_API = `/feedbackofshop/${data}`;

  return await axiosInstance.get(URL_API);
};
const averagerating = async (data) => {
  const URL_API = `/averagerating/${data.sanpham_id}`;

  return await axiosInstance.get(URL_API);
};

export default { getfeedback, feedback_ofshop, averagerating };
