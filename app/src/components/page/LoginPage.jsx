import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import APIUser from "../../utils/API/api_python.js";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slices/User_data.js";

const Form = () => {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [apiError, setApiError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Login form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    shouldFocusError: false,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  // Register form
  const {
    register: register_createUser,
    handleSubmit: handleSubmit_CreateUser,
    watch,
    setError,
    formState: { errors: errors_CreateUser },
  } = useForm({
    shouldFocusError: false,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  // Submit login
  const handleSubmit_Login = async (data) => {
    setApiError("");
    try {
      setLoading(true);

      const response = await APIUser.login(data);

      // Debug: log raw response for easier diagnosis
      console.debug("login response:", response?.data);

      // Backend may use a nested shape: { status: boolean, data: { user, access_Token }, message }
      if (response.data?.status === false) {
        // login failed but server returned 200
        setApiError(response.data?.message || "Đăng nhập thất bại");
        return;
      }

      // Determine payload: prefer response.data.data when present
      const payload = response.data?.data ?? response.data;
      const user = payload?.user ?? payload;
      const token = payload?.access_Token ?? payload?.accessToken ?? response.data?.accessToken ?? null;

      dispatch(loginSuccess({ user, accessToken: token }));
      if (token) localStorage.setItem("token", token);

      navigate("/");
    } catch (error) {
      console.error("login error:", error?.response ?? error);
      setApiError(
        error.response?.data?.message || error.response?.data?.msg || "Sai tài khoản hoặc mật khẩu"
      );
    } finally {
      setLoading(false);
    }
  };

  // Submit register
  const handleSubmit_Register = async (data) => {
    setApiError("");

    // Confirm password check manually
    if (data.password !== data.confirm_password) {
      setError("confirm_password", {
        type: "manual",
        message: "Mật khẩu không trùng khớp",
      });
      return;
    }

    try {
      setLoading(true);
      await APIUser.register(data);
      setIsLogin(true);
    } catch (error) {
      setApiError(error.response?.data?.msg || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // InputField component
  const InputField = ({ label, registerFunc, name, type = "text", rules, error }) => (
    <div className="relative w-full min-w-[200px]">
      <input
        type={type}
        placeholder=" "
        {...registerFunc(name, rules)}
        className={`peer h-11 w-full rounded-lg border px-3 py-3 text-sm text-gray-700 outline-none transition-all bg-transparent
          ${error ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-cyan-500"}`}
      />
      <label className="absolute left-3 -top-2.5 bg-white px-1 text-[11px] text-gray-500 transition-all peer-focus:text-cyan-500">
        {label}
      </label>
      {error && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-red-600 text-sm mt-1 block min-h-[1.25rem]"
        >
          {error.message}
        </motion.span>
      )}
    </div>
  );

  // Banner
  const Banner = () => (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
      className="my-6 text-center"
    >
      <motion.h1
        className="text-4xl font-extrabold text-cyan-700 mb-2"
        animate={{ scale: [1, 1.05, 1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      >
        Welcome to Maliket
      </motion.h1>
    </motion.div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-cyan-100 to-cyan-200 p-4">
      <Banner />

      {isLogin ? (
        <motion.form
          key="login"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onSubmit={handleSubmit(handleSubmit_Login)}
          className="relative flex w-96 flex-col rounded-2xl bg-white text-gray-700 shadow-lg shadow-cyan-300/50 border border-gray-100"
        >
          <div className="mx-4 -mt-6 mb-4 grid h-28 place-items-center rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 text-white shadow-lg">
            <motion.h3 className="text-3xl font-semibold">Đăng nhập</motion.h3>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <InputField
              label="Tài khoản"
              registerFunc={register}
              name="username"
              rules={{
                required: "Tài khoản là bắt buộc",
                pattern: {
                  value: /^[a-zA-Z0-9]+$/,
                  message: "Không dấu, chỉ chữ và số",
                },
              }}
              error={errors.username}
            />
            <InputField
              label="Mật khẩu"
              type="password"
              registerFunc={register}
              name="password"
              rules={{ required: "Vui lòng nhập mật khẩu" }}
              error={errors.password}
            />
          </div>

          {apiError && <p className="text-red-500 text-center mb-2">{apiError}</p>}

          <div className="p-6 pt-0">
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.03 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-tr from-cyan-600 to-cyan-400 py-3 px-6 text-sm font-bold uppercase text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </motion.button>

            <p className="mt-6 flex justify-center text-sm font-light text-gray-600">
              Chưa có tài khoản?
              <button
                className="font-bold text-cyan-600 hover:underline ml-1"
                onClick={() => {
                  setApiError("");
                  setIsLogin(false);
                }}
                type="button"
              >
                Đăng ký
              </button>
            </p>
          </div>
        </motion.form>
      ) : (
        <motion.form
          key="register"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onSubmit={handleSubmit_CreateUser(handleSubmit_Register)}
          className="relative flex w-96 flex-col rounded-2xl bg-white text-gray-700 shadow-lg shadow-cyan-300/50 border border-gray-100"
        >
          <div className="mx-4 -mt-6 mb-4 grid h-28 place-items-center rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 text-white shadow-lg">
            <h3 className="text-3xl font-semibold">Đăng ký</h3>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <InputField
              label="Họ"
              registerFunc={register_createUser}
              name="first_name"
              rules={{ required: "Họ là bắt buộc" }}
              error={errors_CreateUser.first_name}
            />
            <InputField
              label="Tên"
              registerFunc={register_createUser}
              name="last_name"
              rules={{ required: "Tên là bắt buộc" }}
              error={errors_CreateUser.last_name}
            />
            <InputField
              label="Email"
              type="email"
              registerFunc={register_createUser}
              name="email"
              rules={{
                required: "Email là bắt buộc",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email không hợp lệ",
                },
              }}
              error={errors_CreateUser.email}
            />
            <InputField
              label="Số điện thoại"
              type="tel"
              registerFunc={register_createUser}
              name="phone"
              rules={{
                required: "Số điện thoại là bắt buộc",
                pattern: {
                  value: /^[0-9]{9,11}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              }}
              error={errors_CreateUser.phone}
            />
            <InputField
              label="Tài khoản"
              registerFunc={register_createUser}
              name="username"
              rules={{
                required: "Tài khoản là bắt buộc",
                pattern: {
                  value: /^[a-zA-Z0-9]+$/,
                  message: "Không dấu, chỉ chữ và số",
                },
              }}
              error={errors_CreateUser.username}
            />
            <InputField
              label="Mật khẩu"
              type="password"
              registerFunc={register_createUser}
              name="password"
              rules={{
                required: "Vui lòng nhập mật khẩu",
                minLength: { value: 8, message: "Ít nhất 8 ký tự" },
              }}
              error={errors_CreateUser.password}
            />
            <InputField
              label="Xác nhận mật khẩu"
              type="password"
              registerFunc={register_createUser}
              name="confirm_password"
              rules={{ required: "Vui lòng xác nhận mật khẩu" }}
              error={errors_CreateUser.confirm_password}
            />
            <InputField
              label="Ngày sinh"
              type="date"
              registerFunc={register_createUser}
              name="date_of_birth"
              rules={{ required: "Ngày sinh là bắt buộc" }}
              error={errors_CreateUser.date_of_birth}
            />
          </div>

          {apiError && <p className="text-red-500 text-center mb-2">{apiError}</p>}

          <div className="p-6 pt-0">
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.03 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-tr from-cyan-600 to-cyan-400 py-3 px-6 text-sm font-bold uppercase text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </motion.button>

            <p className="mt-6 flex justify-center text-sm font-light text-gray-600">
              Đã có tài khoản?
              <button
                className="font-bold text-cyan-600 hover:underline ml-1"
                onClick={() => {
                  setApiError("");
                  setIsLogin(true);
                }}
                type="button"
              >
                Đăng nhập
              </button>
            </p>
          </div>
        </motion.form>
      )}
    </div>
  );
};

export default Form;
