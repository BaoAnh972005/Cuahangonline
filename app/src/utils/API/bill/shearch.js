import axiosInstance from "../../AxiosConfig.js";

const Shearch = async (data) => {
  console.log("data timf kieems", data);
  const URL_API = "/search";

  return await axiosInstance.get(URL_API, {
    params: {
      keyword: data.keyword,
      limit: "",
      page: "",
    },
  });
};
const Sheacrch_Detail = async (data) => {
  console.log("data timf kieems", data);
  const URL_API = "/search";

  return await axiosInstance.get(URL_API, {
    params: {
      keyword: data.keyword,
      limit: data.limit,
      page: data.page,
    },
  });
};
export default { Shearch, Sheacrch_Detail };
