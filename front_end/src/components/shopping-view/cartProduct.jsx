import {Minus, Plus, Trash} from "lucide-react";
import {Button} from "../ui/button";
import {useDispatch, useSelector} from "react-redux";
import {
  deleteCartItem,
  fetchCartItems,
  updateCartItemQty,
} from "@/store/shop/cart-slice";
import {useToast} from "@/contexts/ToastContext";

function CartItem({item}) {
  const caculatePrice = () => {
    return (item.price - (item.price * item.discount) / 100) * item.quantity;
  };
  const {toast} = useToast();
  const dispatch = useDispatch();
  const {user} = useSelector((state) => state.auth);
  const handleChangeQuantity = async (type) => {
    var quantity = item.quantity;
    if (type === "plus") {
      quantity += 1;
    } else {
      quantity -= 1;
    }
    try {
      if (quantity > item.stock) {
        toast.error("You have reached the maximum quantity for this product");
        return;
      }
      await dispatch(
        updateCartItemQty({
          userId: user.id,
          productId: item.productId,
          quantity,
        }),
      ).unwrap();
      toast.success("Update cart successfully");
      await dispatch(fetchCartItems(user.id)).unwrap();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleDeleteItem = async () => {
    try {
      await dispatch(
        deleteCartItem({userId: user.id, productId: item.productId}),
      ).unwrap();
      toast.success("Delete item successfully");
      await dispatch(fetchCartItems(user.id)).unwrap();
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="flex gap-2">
      <div>
        <img
          src={item.thumbnail}
          alt={item.name}
          className="w-20 h-20 rounded-lg object-cover aspect-square"
        />
      </div>
      <div className="flex-1 flex justify-between items-center">
        <div>
          <p className="mb-2 font-bold">{item.name}</p>
          <div className="flex items-center gap-2">
            <Button
              disabled={item.quantity === 1}
              variant="outline"
              size="icon"
              onClick={() => handleChangeQuantity("minus")}
              className="w-[30px] h-[30px]"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <p>{item.quantity}</p>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleChangeQuantity("plus")}
              className="w-[30px] h-[30px]"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col">
          <p className="mb-2">{caculatePrice().toFixed(2)} VNĐ</p>
          <Button
            variant="outline"
            className="self-end w-[30px] h-[30px]"
            onClick={handleDeleteItem}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
