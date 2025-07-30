import {useSelector} from "react-redux";
import {Sheet, SheetContent, SheetHeader, SheetTitle} from "../ui/sheet";
import CartItem from "./cartProduct";
import {Button} from "../ui/button";
import {Link, useNavigate} from "react-router-dom";

function CartWrapper({isOpenCartDialog, setIsOpenCartDialog}) {
  const {listCartItems} = useSelector((state) => state.shoppingCart);
  const navigate = useNavigate();
  const caculateTotalPrice = () => {
    return listCartItems.items.reduce((acc, item) => {
      return (
        acc + (item.price - (item.price * item.discount) / 100) * item.quantity
      );
    }, 0);
  };
  const handleNavigateCheckout = () => {
    setIsOpenCartDialog(false);
    navigate("/checkout");
  };
  return (
    <Sheet
      open={isOpenCartDialog}
      onOpenChange={() => setIsOpenCartDialog(false)}
      className=""
    >
      <SheetContent side="right" className="overflow-auto flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">Cart</SheetTitle>
        </SheetHeader>
        {listCartItems && listCartItems.items?.length > 0 ? (
          <div className="flex flex-1 flex-col justify-between h-full mt-4">
            <div className="space-y-4 flex-1 overflow-y-auto">
              {listCartItems.items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>
            <div>
              <p className="text-xl font-bold">
                Total: {caculateTotalPrice().toFixed(2)} VNĐ
              </p>
              <Button className="w-full mt-4" onClick={handleNavigateCheckout}>
                Checkout
              </Button>
            </div>
          </div>
        ) : (
          <p>No item in cart</p>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default CartWrapper;
