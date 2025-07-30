import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {CheckCircle2} from "lucide-react";
import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {fetchCartItems} from "@/store/shop/cart-slice";

function OrderSuccessPage() {
  const navigate = useNavigate();
  const {user} = useSelector((state) => state.auth);
  const handleBackToHome = () => {
    navigate("/");
  };
  const dispatch = useDispatch();
  useEffect(() => {
    async function fetchCart() {
      dispatch(fetchCartItems(user.id)).then((action) => {
        console.log(action);
      });
    }
    window.document.title = "Đặt hàng thành công";
    fetchCart();
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Order successfully</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order status is pending. We will
          process yours as soon as possible.
        </p>
        <Button onClick={handleBackToHome}>Return to Home</Button>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
