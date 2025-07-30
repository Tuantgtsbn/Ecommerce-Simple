import {ArrowLeft, ArrowRight} from "lucide-react";
import React, {useCallback, useEffect, useState} from "react";
import classNames from "classnames";
export const usePrevNextButtons = (emblaApi) => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  };
};

export const PrevButton = (props) => {
  const {children, className, ...restProps} = props;

  return (
    <button
      className={classNames(
        "absolute  h-8 w-8 rounded-full left-0 top-1/2 -translate-y-1/2 flex items-center justify-center border border-solid border-black",
        className,
      )}
      type="button"
      {...restProps}
    >
      <ArrowLeft />
      {children}
    </button>
  );
};

export const NextButton = (props) => {
  const {children, className, ...restProps} = props;

  return (
    <button
      className={classNames(
        "absolute h-8 w-8 rounded-full right-0 top-1/2 -translate-y-1/2 flex items-center justify-center border border-solid border-black ",
        className,
      )}
      type="button"
      {...restProps}
    >
      <ArrowRight />

      {children}
    </button>
  );
};
