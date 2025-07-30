import {Star} from "lucide-react";

function RatingStar({rating, setRating}) {
  return [1, 2, 3, 4, 5].map((item, index) => (
    <Star
      onClick={() => setRating(item)}
      fill={item <= rating ? "black" : "white"}
      key={index}
      width={20}
      height={20}
    />
  ));
}

export default RatingStar;
