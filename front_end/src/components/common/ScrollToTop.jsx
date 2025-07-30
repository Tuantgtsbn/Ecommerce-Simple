import {useEffect, useState} from "react";
import {FaChevronUp} from "react-icons/fa6";
import {useLocation, useNavigationType} from "react-router-dom";
import classNames from "classnames";
function ScrollToTop() {
  const {pathname, search} = useLocation();
  const navigationType = useNavigationType();
  const [isDisplay, setIsDisplay] = useState(false);
  useEffect(() => {
    // Only scroll to top if it's a PUSH navigation
    if (navigationType === "PUSH") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }

    // For POP navigation (back/forward), restore the scroll position
    if (navigationType === "POP") {
      const savedPosition = window.history.state?.scrollY || 0;
      window.scrollTo({
        top: savedPosition,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [pathname, search, navigationType]);

  // Save scroll position before leaving the page
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setIsDisplay(true);
      } else {
        setIsDisplay(false);
      }
      const currentState = window.history.state || {};
      window.history.replaceState(
        {
          ...currentState,
          scrollY: window.scrollY,
        },
        "",
      );
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={classNames(
        "fixed bottom-10 right-10 z-50 cursor-pointer w-[40px] h-[40px] rounded-full bg-gray-400 flex items-center justify-center",
        {
          hidden: !isDisplay,
        },
      )}
      onClick={() => window.scrollTo({top: 0, left: 0, behavior: "smooth"})}
    >
      <FaChevronUp width={20} height={20} />
    </div>
  );
}

export default ScrollToTop;
