import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {Card, CardContent} from "@/components/ui/card";
import classNames from "classnames";
export default function SliderCommon({
  data,
  className = "",
  onHover,
  onClick,
  variant = "primary",
  renderFunc,
}) {
  const variantStyles = {
    primary: "basis-1/5",
    secondary: "basis-full",
  };
  return (
    <Carousel
      className="w-full group mb-3"
      opts={{
        loop: true,
        align: "start",
      }}
    >
      <CarouselContent
        className={classNames({"ml-0": variant === "secondary"})}
      >
        {data.map((item, index) => (
          <CarouselItem
            key={index}
            className={classNames(className, variantStyles[variant], {
              "pl-0": variant === "secondary",
            })}
            onMouseEnter={() => onHover(index)}
            onClick={() => onClick(index)}
          >
            <Card className="h-full">
              <CardContent className="flex justify-center items-center h-full !p-0">
                {renderFunc(item, index)}
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden group-hover:flex" />
      <CarouselNext className="hidden group-hover:flex" />
    </Carousel>
  );
}
