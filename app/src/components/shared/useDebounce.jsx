import { useState, useEffect } from "react";

export default function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    console.log("Debounce triggered:", value); // log mỗi khi value thay đổi

    const handler = setTimeout(() => {
      console.log("Debounce set:", value); // log sau khi delay xong
      setDebouncedValue(value);
    }, delay);

    return () => {
      console.log("Debounce cleanup for:", value); // log khi timeout bị clear
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
