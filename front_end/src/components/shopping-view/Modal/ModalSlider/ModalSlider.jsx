import { Card, CardContent } from '@/components/ui/card';
import classNames from 'classnames';
import useEmblaCarousel from 'embla-carousel-react';
import { usePrevNextButtons, PrevButton, NextButton } from './LeftRightButton';
import { DotButton, useDotButton } from './DotNav';
const ModalSlider = ({ images, currentIndex, onClose, options }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(options);
    const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);
    const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
        usePrevNextButtons(emblaApi);
    if (!images || images.length === 0) return null;

    return (
        <div
            className='slider-modal fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-[9999] flex-col'
            onClick={onClose}
        >
            <button
                className='close-btn absolute top-4 right-4 text-white text-[2.5rem]'
                onClick={onClose}
            >
                ×
            </button>
            <div
                className='slider-content relative w-[550px] h-[550px] overflow-hidden'
                ref={emblaRef}
                onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click thoát khi bấm vào slider
            >
                <div className={classNames('flex h-full')}>
                    {images.map((item, index) => {
                        return (
                            <Card
                                key={index}
                                className={classNames('shrink-0 grow-0 basis-full pl-4')}
                            >
                                <CardContent className='flex justify-center items-center h-full'>
                                    <img
                                        src={item}
                                        alt=''
                                        className='w-full h-full object-contain'
                                    />
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
                <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
                <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
            </div>
            <div className='mt-5 text-white'>Hình ảnh từ sản phẩm ({images.length})</div>
            <div className='w-[750px] flex mt-5'>
                {images.map((item, index) => {
                    return (
                        <DotButton
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDotButtonClick(index);
                            }}
                            className='basis-[10%] grow-0 shrink-0'
                        >
                            <Card
                                className={classNames('rounded-none border-2 h-full', {
                                    'border-red-500': selectedIndex === index
                                })}
                            >
                                <CardContent className='flex justify-center items-center p-0 h-full'>
                                    <img src={item} alt='' />
                                </CardContent>
                            </Card>
                        </DotButton>
                    );
                })}
            </div>
        </div>
    );
};

export default ModalSlider;
