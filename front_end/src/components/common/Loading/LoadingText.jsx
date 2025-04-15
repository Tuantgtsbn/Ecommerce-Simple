import classNames from "classnames";
function LoadingText({ className }) {
    return (
        <div className={classNames("w-4 h-4 border-2 border-gray-500 border-t-transparent border-solid rounded-full animate-spin", className)}></div>
    );
}

export default LoadingText;