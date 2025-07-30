import Banner from "@/assets/imgs/account.jpg";
import AddressWrapper from "@/components/shopping-view/addressWrapper";
import CartItem from "@/components/shopping-view/cartProduct";
import {Button} from "@/components/ui/button";
import {useDispatch, useSelector} from "react-redux";
import Loading from "@/components/common/Loading/Loading";
import {createOrder} from "@/store/shop/order-slice";
import {useEffect, useState} from "react";
import {useToast} from "@/contexts/ToastContext";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";

function CheckoutShopingPage() {
  const dispatch = useDispatch();
  const {listCartItems, isLoading} = useSelector((state) => state.shoppingCart);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const {addressChoosen} = useSelector((state) => state.shoppingAddress);
  const {approvalURL, isLoading: isLoadingOrder} = useSelector(
    (state) => state.shoppingOrder,
  );
  const [paymentMethod, setpaymentMethod] = useState("cash");
  const {toast} = useToast();
  const caculateTotalPrice = () => {
    return Number(
      listCartItems.items
        .reduce((acc, item) => {
          return (
            acc +
            Number(
              (item.price - (item.price * item.discount) / 100).toFixed(2),
            ) *
              item.quantity
          );
        }, 0)
        .toFixed(2),
    );
  };

  const {user} = useSelector((state) => state.auth);
  const handleInitialPaypalPayment = () => {
    if (!addressChoosen) {
      toast.error("Please choose an address");
      return;
    }
    const orderData = {
      userId: user.id,
      cartItems: listCartItems?.items.map((item) => ({
        productId: item.productId,
        title: item.title,
        name: item.name,
        thumbnail: item.thumbnail,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
      })),
      addressInfo: {
        ...addressChoosen,
      },
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: caculateTotalPrice(),
      cartId: listCartItems._id,
    };
    dispatch(createOrder(orderData)).then((action) => {
      if (action?.payload?.success) {
        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(action.payload.orderId),
        );
        setIsPaymemntStart(true);
      } else {
        setIsPaymemntStart(false);
      }
    });
  };
  if (approvalURL) {
    window.location.href = approvalURL;
  }
  const handleOrderByCash = async () => {
    if (!addressChoosen) {
      toast.error("Please choose an address");
      return;
    }
    const orderData = {
      userId: user.id,
      cartItems: listCartItems?.items.map((item) => ({
        productId: item.productId,
        title: item.title,
        name: item.name,
        thumbnail: item.thumbnail,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
      })),
      addressInfo: {
        ...addressChoosen,
      },
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      orderStatus: "pending",
      paymentMethod: "cash",
      paymentStatus: "pending",
      totalAmount: caculateTotalPrice(),
      cartId: listCartItems._id,
    };
    dispatch(createOrder(orderData))
      .then((action) => {
        if (action?.payload?.success) {
          toast.success("Order created successfully");
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 3000);
          });
        } else {
          toast.error("Order created failed");
        }
      })
      .then(() => {
        window.location.href = "/checkout/success";
      });
  };
  useEffect(() => {
    window.document.title = "Thanh toán";
  }, []);
  return (
    <div className="flex flex-col">
      <div className="relative">
        <img
          src={Banner}
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="container mx-auto mt-10 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="w-full max-lg:order-2 m">
          <AddressWrapper />
        </div>
        {listCartItems && listCartItems.items?.length > 0 ? (
          <div className="flex flex-col max-lg:order-1 p-4 relative h-max">
            <div className="space-y-4 ">
              {listCartItems.items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xl font-bold">Total</p>
                <p className="text-xl font-bold">
                  {caculateTotalPrice().toFixed(2)} VNĐ
                </p>
              </div>
              <Separator />
              <div className="mt-4">
                <p className="text-xl font-bold">Choose payment method</p>
                <div>
                  <div className="flex items-center gap-3">
                    <Input
                      className="w-[20px]"
                      type="radio"
                      checked={paymentMethod === "cash"}
                      value="cash"
                      onChange={(e) => setpaymentMethod(e.target.value)}
                    />
                    <Label className="text-xl">Cash on delivery (COD)</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      className="w-[20px]"
                      type="radio"
                      checked={paymentMethod === "paypal"}
                      value="paypal"
                      onChange={(e) => setpaymentMethod(e.target.value)}
                    />
                    <Label className="text-xl">Paypal</Label>
                  </div>
                </div>
              </div>
              {paymentMethod === "paypal" && (
                <Button
                  className="w-full mt-4"
                  onClick={handleInitialPaypalPayment}
                  disabled={isPaymentStart}
                >
                  {isPaymentStart
                    ? "Redirecting to payment..."
                    : "Proceed to Payment"}
                </Button>
              )}
              {paymentMethod === "cash" && (
                <Button
                  disabled={isLoadingOrder}
                  className="w-full mt-4"
                  onClick={handleOrderByCash}
                >
                  Place order
                </Button>
              )}
            </div>
            {isLoading && (
              <div className="absolute inset-0 bg-black opacity-50">
                <Loading className="h-full w-full" />
              </div>
            )}
          </div>
        ) : (
          <p className="max-lg:order-2">No item in cart</p>
        )}
      </div>
    </div>
  );
}

export default CheckoutShopingPage;
