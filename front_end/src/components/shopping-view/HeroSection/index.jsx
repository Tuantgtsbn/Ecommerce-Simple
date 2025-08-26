import * as React from "react";
import classNames from "classnames";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {Skeleton} from "@/components/ui/skeleton";
import useWindowSize from "@/hooks/useWindowSize";

export function HeroSection({className, isLoading, data, ...props}) {
  const {width} = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1280;
  const isDesktop = width >= 1280;
  const getImage = (item) => {
    switch (true) {
      case isMobile:
        return item.images?.mobile;
      case isTablet:
        return item.images?.tablet;
      case isDesktop:
        return item.images?.desktop;
      default:
        return item.images?.desktop;
    }
  };
  return (
    <Carousel className="w-full" opts={{loop: true}}>
      <CarouselContent
        className={classNames("w-full !-ml-0", {
          "h-[900px]": isDesktop,
          "h-[600px]": isTablet,
          "h-[400px]": isMobile,
        })}
      >
        {isLoading ? (
          <CarouselItem>
            <Skeleton />
          </CarouselItem>
        ) : (
          data.map((item, index) => {
            const image = getImage(item);
            return (
              <CarouselItem key={index} className="w-full px-0">
                <img
                  src={image?.url}
                  alt={image?.alt || `Hero Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </CarouselItem>
            );
          })
        )}
      </CarouselContent>
      <CarouselPrevious className="!rounded-none left-[20px]" />
      <CarouselNext className="!rounded-none right-[20px]" />
    </Carousel>
  );
}
