function Tooltip({ children, text }) {
    return (
        <div>
            <div className="relative inline-block group">
                {children}
                <div className="w-max absolute text-[12px] bg-white text-mainBlack py-[7px] px-[12px] border border-solid border-thirdWhite top-0 left-1/2 -translate-x-1/2 -translate-y-[120%] opacity-0 transition-opacity group-hover:opacity-100  z-50">
                    {text}
                </div>
            </div>
        </div>
    );
}

export default Tooltip;