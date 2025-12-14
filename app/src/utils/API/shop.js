import axiosInstance from "../AxiosConfig.js";

const crateshop = async (data) => {
  const URL_API = "/newshop";

  return await axiosInstance.post(URL_API, data);
};

const pageshop = async (shop_id) => {
  console.log("shop_id trong api pageshop", shop_id);
  const URL_API = "/pageshop";
  return await axiosInstance.get(URL_API, {
    params: { shop_id },
  });
};

const Shop = { crateshop, pageshop };
export default Shop;
