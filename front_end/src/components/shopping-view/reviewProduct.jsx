import {Star} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "../ui/avatar";
import RatingStar from "../common/rating-star";

function ReviewProduct({review}) {
  return (
    <div className="flex gap-4">
      <div>
        <Avatar>
          <AvatarImage src={review?.userId?.avatar} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1">
        <p className="text-bold text-xl">{review?.userId?.userName}</p>
        <div className="flex gap-1">
          <RatingStar rating={review?.rating} readonly />
        </div>
        <p className="text-muted-foreground text-xl">{review?.comment}</p>
        {review?.isOptimistic && (
          <p className="text-muted-foreground">Loading...</p>
        )}
      </div>
    </div>
  );
}

export default ReviewProduct;
