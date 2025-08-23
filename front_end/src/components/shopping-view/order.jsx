import {useEffect, useState} from "react";
import {Button} from "../ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {Dialog, DialogTrigger} from "../ui/dialog";
import ShoppingOrderDetail from "./order-detail";
import {useDispatch, useSelector} from "react-redux";
import {getOrdersByUserId} from "@/store/shop/order-slice";
import {formatDateCustom} from "@/lib/utils";
import {Badge} from "../ui/badge";
import classNames from "classnames";
function ShoppingOrder() {
  const [openDetailOrder, setOpenDetailOrder] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const {orderList, isLoading} = useSelector((state) => state.shoppingOrder);
  const {user} = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  useEffect(() => {
    async function fetchOrders() {
      try {
        await dispatch(getOrdersByUserId(user.id)).unwrap();
      } catch (error) {
        setError(error);
      }
    }
    fetchOrders();
  }, [user.id]);
  const handleOpenDetailOrder = async (orderId) => {
    setSelectedOrderId(orderId);
    setOpenDetailOrder(true);
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>List of your orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Order date</TableHead>
                <TableHead>Total price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <h1>Loading...</h1>
              ) : error ? (
                <h1>{error.message}</h1>
              ) : orderList.length > 0 ? (
                <>
                  {orderList.map((order) => (
                    <TableRow>
                      <TableCell>{order._id}</TableCell>
                      <TableCell>
                        {formatDateCustom(order.orderDate, "longDate")}
                      </TableCell>
                      <TableCell>{order.totalAmount} VNĐ</TableCell>
                      <TableCell>
                        <Badge
                          className={classNames({
                            "bg-[#FACC15]": order.orderStatus === "pending",
                            "bg-[#3B82F6]": order.orderStatus === "inProcess",
                            "bg-[#8B5CF6]": order.orderStatus === "confirmed",
                            "bg-green-500": order.orderStatus === "delivered",
                            "bg-yellow-500": order.orderStatus === "inShipping",
                            "bg-red-500": [
                              "rejected",
                              "cancelled",
                              "failedDelivery",
                            ].includes(order.orderStatus),
                          })}
                        >
                          {order.orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2 flex">
                        <Button className="bg-red-500 text-white">
                          Cancel
                        </Button>
                        <Button
                          className="bg-green-500 text-white"
                          onClick={() => handleOpenDetailOrder(order._id)}
                        >
                          View detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                <p>No order found</p>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={openDetailOrder} onOpenChange={setOpenDetailOrder}>
        <ShoppingOrderDetail orderId={selectedOrderId} />
      </Dialog>
    </>
  );
}

export default ShoppingOrder;
