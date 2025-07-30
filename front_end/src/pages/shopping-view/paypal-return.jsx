import {useEffect} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {CheckCircle2} from "lucide-react";
import {useDispatch, useSelector} from "react-redux";
import {capturePayment} from "@/store/shop/order-slice";
import {fetchCartItems} from "@/store/shop/cart-slice";

function PayPalReturnPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get("paymentId");
  const PayerID = searchParams.get("PayerID");
  const {user} = useSelector((state) => state.auth);
  useEffect(() => {
    if (!paymentId || !PayerID) {
      navigate("/");
    } else {
      dispatch(
        capturePayment({
          paymentId: paymentId,
          payerId: PayerID,
          orderId: JSON.parse(sessionStorage.getItem("currentOrderId")),
        }),
      ).then((action) => {
        sessionStorage.removeItem("currentOrderId");
        if (action?.payload.success) {
          dispatch(fetchCartItems(user.id));
        }
      });
    }
  }, [paymentId, PayerID, navigate, dispatch, user.id]);

  const handleBackToHome = () => {
    navigate("/");
  };
  useEffect(() => {
    window.document.title = "Thanh toán thành công";
  }, []);
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your payment has been processed
          successfully.
        </p>
        <Button onClick={handleBackToHome}>Return to Home</Button>
      </div>
    </div>
  );
}

export default PayPalReturnPage;
