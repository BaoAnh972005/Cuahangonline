import axiosInstance from "../../AxiosConfig.js";

const doanhthu = async (data) => {
  const URL_API = "/admin/revenue";
  console.log("data doanh thu api", data);
  return await axiosInstance.get(URL_API, {
    params: {
      startDate: data.startDate,
      endDate: data.endDate,
    },
  });
};
const doanhthuthang = async (data) => {
  const URL_API = "/admin/dtthang";
  console.log("data doanh thu api", data);
  return await axiosInstance.get(URL_API, {
    params: {
      startDate: data.startDate,
      endDate: data.endDate,
    },
  });
};

export default {
  doanhthu,
  doanhthuthang,
};
