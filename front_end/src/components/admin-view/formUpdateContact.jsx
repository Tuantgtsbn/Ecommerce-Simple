import {useEffect, useState} from "react";
import CommonForm from "../common/form";
import {updateContactFormElements} from "@/config/index";
import {useDispatch, useSelector} from "react-redux";

import {useToast} from "@/contexts/ToastContext";
import {DialogContent, DialogHeader, DialogTitle} from "../ui/dialog";
import {getAllContacts, updateContact} from "@/store/admin/contact-slice";

function FormContactOrder({closeDialog}) {
  const {isLoadingUpdate, detailContact} = useSelector(
    (state) => state.adminContacts,
  );
  const [formData, setFormData] = useState({
    status: "",
  });
  useEffect(() => {
    setFormData({status: detailContact?.read ? "1" : "0"});
  }, [detailContact]);
  console.log(formData);
  const {toast} = useToast();
  const dispatch = useDispatch();
  const handleSubmit = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(formData);
    try {
      await dispatch(
        updateContact({id: detailContact._id, read: formData.status === "1"}),
      ).unwrap();
      toast.success("Update contact successfully");
      await dispatch(getAllContacts()).unwrap();
      setTimeout(() => {
        closeDialog();
      }, 2000);
      setFormData({status: "0"});
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
      <DialogHeader>
        <DialogTitle>Update order status</DialogTitle>
      </DialogHeader>
      {detailContact ? (
        <CommonForm
          formControls={updateContactFormElements(formData?.status || "0")}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          buttonText="Update"
          isBtnDisabled={isLoadingUpdate}
          isLoading={isLoadingUpdate}
        />
      ) : (
        <p>No contact found</p>
      )}
    </DialogContent>
  );
}

export default FormContactOrder;
