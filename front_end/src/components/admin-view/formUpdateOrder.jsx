import {useEffect, useState} from "react";
import CommonForm from "../common/form";
import {updateOrderFormElements} from "@/config/index";
import {useDispatch, useSelector} from "react-redux";
import {getAllOrders, updateOrderStatus} from "@/store/admin/order-slice";
import {useToast} from "@/contexts/ToastContext";
import {DialogContent, DialogHeader, DialogTitle} from "../ui/dialog";

function FormUpdateOrder({closeDialog}) {
  const {isLoadingUpdate, detailOrder} = useSelector(
    (state) => state.adminOrders,
  );
  console.log(detailOrder);
  const [formData, setFormData] = useState({
    status: "",
  });
  useEffect(() => {
    setFormData({status: detailOrder?.orderStatus || ""});
  }, [detailOrder]);
  console.log(formData);
  const {toast} = useToast();
  const dispatch = useDispatch();
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      await dispatch(
        updateOrderStatus({id: detailOrder._id, status: formData.status}),
      ).unwrap();
      toast.success("Update order successfully");
      await dispatch(getAllOrders()).unwrap();
      setTimeout(() => {
        closeDialog();
      }, 2000);
      setFormData({status: ""});
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
      <DialogHeader>
        <DialogTitle>Update order status</DialogTitle>
      </DialogHeader>
      {detailOrder ? (
        <CommonForm
          formControls={updateOrderFormElements(formData?.orderStatus || "")}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          buttonText="Update"
          isBtnDisabled={isLoadingUpdate}
          isLoading={isLoadingUpdate}
        />
      ) : (
        <p>No order found</p>
      )}
    </DialogContent>
  );
}

export default FormUpdateOrder;
