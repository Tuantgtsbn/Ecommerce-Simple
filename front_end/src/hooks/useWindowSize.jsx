import {useState, useEffect, useCallback} from "react";

/**
 * Custom hook to track window dimensions with debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Object} Window width and height
 */
function useWindowSize(delay = 250) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = useCallback(() => {
    const debounce = (fn, ms) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
      };
    };

    const debouncedResize = debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, delay);

    debouncedResize();
  }, [delay]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    // Initial call to set the initial size
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return windowSize;
}

export default useWindowSize;
