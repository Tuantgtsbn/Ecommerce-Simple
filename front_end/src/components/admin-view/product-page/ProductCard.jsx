import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import classNames from "classnames";
function ProductCard({product, onClickEdit, onClickDelete}) {
  return (
    <Card>
      <div>
        <div className="relative">
          <img
            src={product?.thumbnail}
            alt="Anh thumbnail"
            className="w-full rounded-t-lg"
          />
        </div>
      </div>
      <CardContent>
        <h2 className="text-xl font-bold mb-2">{product?.title}</h2>
        <p>{product?.name}</p>
        <div className="flex justify-between items-center">
          <p
            className={classNames("", {"line-through": product?.discount > 0})}
          >
            {product?.price} $
          </p>
          {product?.discount != null && product?.discount > 0 ? (
            <p className="text-red-500 ">
              {(product.price * (100 - product.discount)) / 100} $
            </p>
          ) : null}
        </div>
        <div className="flex justify-between mt-2">
          <Button onClick={() => onClickEdit(product)}>Edit</Button>
          <Button onClick={onClickDelete}>Delete</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;
