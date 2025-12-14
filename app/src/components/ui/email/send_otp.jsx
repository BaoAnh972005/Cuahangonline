import React, { useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { LockOutlined, CheckCircleOutlined } from "@ant-design/icons";
import APIotp from "../../../utils/API/otp.js";
import {
  setOtpValues,
  setCountdown,
  setOtpSent,
  setVerified,
  setPopupVisible,
  clearOtpState,
} from "../../../redux/slices/otpSlice.js";

export default function SendOtpPopup() {
  const dispatch = useDispatch();
  const { otpValues, countdown, otpSent, popupVisible } = useSelector(
    (state) => state.otp
  );
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Nếu popup không mở thì return null
  if (!popupVisible) return null;

  // Dọn dẹp timer khi unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  // Gửi OTP
  const sendOtpMutation = useMutation({
    mutationFn: async () => await APIotp.SendOTP(),
    onSuccess: (res) => {
      console.log("[OTP] ✅ Gửi OTP thành công:", res.data);
      toast.success(res.data?.message || "OTP đã được gửi!");
      startCountdown();
      dispatch(setOtpSent(true));
      inputRefs.current[0]?.focus();
    },
    onError: (err) => {
      console.error("[OTP] ❌ Lỗi gửi OTP:", err);
      toast.error(err.response?.data?.message || "Gửi OTP thất bại");
    },
  });

  // Xác thực OTP
  const verifyOtpMutation = useMutation({
    mutationFn: async (data) => await APIotp.verify_otp(data),
    onSuccess: (res) => {
      console.log("[OTP] ✅ Xác thực thành công:", res.data);
      toast.success("Xác thực OTP thành công!");
      dispatch(setVerified(true)); // 🔹 Kích hoạt flag cho Checkout
      dispatch(setPopupVisible(false));
      clearInterval(timerRef.current);
    },
    onError: (err) => {
      console.error("[OTP] ❌ Lỗi xác thực:", err);
      toast.error(err.response?.data?.message || "Xác thực OTP thất bại");
    },
  });

  // Countdown
  const startCountdown = () => {
    dispatch(setCountdown(60));
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      dispatch(setCountdown("decrement"));
    }, 1000);
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    dispatch(setOtpValues(newOtp));
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData.getData("text").match(/\d/g) || []).slice(
      0,
      6
    );
    const newOtp = [...otpValues];
    paste.forEach((digit, i) => (newOtp[i] = digit));
    dispatch(setOtpValues(newOtp));
    const firstEmpty = newOtp.findIndex((v) => !v);
    inputRefs.current[firstEmpty === -1 ? 5 : firstEmpty]?.focus();
  };

  const handleSubmitOtp = () => {
    const otp = otpValues.join("");
    if (otp.length !== 6) return toast.error("Vui lòng nhập đủ 6 số OTP");
    verifyOtpMutation.mutate({ otp });
  };

  const handleClose = () => {
    clearInterval(timerRef.current);
    dispatch(setPopupVisible(false));
    dispatch(clearOtpState());
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-screen flex items-center justify-center p-4 pointer-events-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-auto bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-200 relative"
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-lg"
        >
          ✖
        </button>

        {!otpSent ? (
          <div className="flex flex-col items-center gap-6">
            <LockOutlined className="text-6xl text-blue-600" />
            <h2 className="text-2xl font-bold">Xác nhận OTP</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendOtpMutation.mutate()}
              disabled={sendOtpMutation.isPending}
              className="mt-4 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendOtpMutation.isPending ? "Đang gửi..." : "Nhận OTP"}
            </motion.button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <LockOutlined className="text-4xl text-blue-600 mx-auto mb-2" />
              <h2 className="text-2xl font-bold">Nhập OTP</h2>
              <p className="text-sm text-gray-600 mt-1">
                Mã đã được gửi đến Gmail của bạn
              </p>
            </div>

            <div
              className="flex gap-3 justify-center mb-6"
              onPaste={handlePaste}
            >
              {otpValues.map((value, i) => (
                <motion.input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none
                    focus:ring-4 focus:ring-blue-200 focus:border-blue-500
                    ${value ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitOtp}
              disabled={otpValues.some((v) => v === "")}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircleOutlined />
              Xác nhận
            </motion.button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Chưa nhận được mã?{" "}
                <motion.button
                  whileHover={{ scale: countdown === 0 ? 1.05 : 1 }}
                  whileTap={{ scale: countdown === 0 ? 0.95 : 1 }}
                  onClick={() => sendOtpMutation.mutate()}
                  disabled={countdown > 0 || sendOtpMutation.isPending}
                  className={`font-medium transition-all ${
                    countdown > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:underline"
                  }`}
                >
                  {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại"}
                </motion.button>
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
