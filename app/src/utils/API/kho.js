import axiosInstance from "../AxiosConfig.js";

const xemthongtinkho = () => axiosInstance.get("admin/xemkho");
const newkho = (data) => axiosInstance.post("admin/addkho", data);
const nhapkho = (data) => axiosInstance.put("admin/nhapkho", data);

const KHo = { xemthongtinkho, nhapkho ,newkho};
export default KHo;
