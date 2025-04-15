import { createContext, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
const ToastContext = createContext();
const ToastProvider = ({ children }) => {
    const value = {
        toast
    }
    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    )
}
const useToast = () => {
    return useContext(ToastContext);
}
export { ToastProvider, useToast };