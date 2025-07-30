import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {XCircle} from "lucide-react";
import {useEffect} from "react";

function PayPalCancelPage() {
  const navigate = useNavigate();

  const handleBackToCheckout = () => {
    navigate("/checkout");
  };
  useEffect(() => {
    window.document.title = "Thanh toán thất bại";
  }, []);
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-8">
          Your payment has been cancelled. If you'd like to try again, please
          return to checkout.
        </p>
        <Button onClick={handleBackToCheckout}>Return to Checkout</Button>
      </div>
    </div>
  );
}

export default PayPalCancelPage;
