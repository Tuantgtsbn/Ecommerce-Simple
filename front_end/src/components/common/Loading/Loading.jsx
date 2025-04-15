import classNames from 'classnames';
function Loading({ className }) {
    return (
        <div className={classNames('flex items-center justify-center', className)}>
            <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin'></div>
        </div>
    );
}

export default Loading;
