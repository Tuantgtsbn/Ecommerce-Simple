import { forwardRef } from 'react';
import { IoAddSharp } from 'react-icons/io5';
import { FaMinus } from 'react-icons/fa6';
import styles from './DetailInfor.module.scss';
import classNames from 'classnames';
const Accordion = forwardRef(function Accordion({ title, children, variant = 'primary' }, ref) {
    // const [isOpen, setIsOpen] = useState(false);
    const { border, active, secondaryBorder } = styles;
    const variantStyles = {
        primary: 'gap-4',
        secondary: 'flex-row-reverse justify-between'
    };
    const handleCLick = (e) => {
        console.log(ref.current);
        console.log(e.currentTarget);
        if (ref.current === e.currentTarget) {
            // setIsOpen(!isOpen);
            ref.current.childNodes[0].childNodes[0].classList.remove('hidden');
            ref.current.childNodes[0].childNodes[1].classList.add('hidden');
            ref.current.nextElementSibling.classList.toggle('h-0');
            ref.current.nextElementSibling.classList.toggle(active);
            ref.current.classList.toggle('bg-[#f7f7f7]');
        } else {
            ref.current?.nextElementSibling.classList.add('h-0');
            ref.current?.nextElementSibling.classList.remove(active);
            ref.current?.classList.remove('bg-[#f7f7f7]');
            ref.current?.childNodes[0].childNodes[0].classList.remove('hidden');
            ref.current?.childNodes[0].childNodes[1].classList.add('hidden');
            ref.current = e.currentTarget;
            ref.current.nextElementSibling.classList.toggle('h-0');
            ref.current.nextElementSibling.classList.toggle(active);
            ref.current.classList.toggle('bg-[#f7f7f7]');
            ref.current?.childNodes[0].childNodes[0].classList.add('hidden');
            ref.current?.childNodes[0].childNodes[1].classList.remove('hidden');
        }
    };
    return (
        <div
            className={classNames({
                [border]: variant === 'primary',
                [secondaryBorder]: variant === 'secondary'
            })}
        >
            <div
                className={classNames(
                    'flex px-[15px] py-[9px] hover:bg-[#f7f7f7] items-center font-semibold',
                    variantStyles[variant]
                )}
                onClick={handleCLick}
            >
                <div>
                    <p>+</p>
                    <p className='hidden'>-</p>
                </div>
                <h2>{title}</h2>
            </div>
            <div className='h-0 px-[15px] overflow-hidden transition-all duration-200 ease-linear text-gray-500'>
                {children}
            </div>
        </div>
    );
});

export default Accordion;
