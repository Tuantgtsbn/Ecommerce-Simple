import { ToastProvider } from "./ToastContext";
function AppProvider({ children }) {
    return (
        <ToastProvider>
            {children}
        </ToastProvider>
    );
}

export default AppProvider;