import AdminOrder from "@/components/admin-view/order";
import {useEffect} from "react";

function AdminOrders() {
  useEffect(() => {
    window.document.title = "Quản lý đơn hàng - Admin";
  }, []);
  return (
    <>
      <AdminOrder />
    </>
  );
}

export default AdminOrders;
