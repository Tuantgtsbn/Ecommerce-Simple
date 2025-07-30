import {useSelector} from "react-redux";
import {DialogContent, DialogHeader, DialogTitle} from "../ui/dialog";
import {formatDateCustom} from "@/lib/utils";
import classNames from "classnames";
import {Label} from "../ui/label";

function AdminContactDetail() {
  const {detailContact} = useSelector((state) => state.adminContacts);
  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
      <DialogHeader>
        <DialogTitle>Order detail</DialogTitle>
      </DialogHeader>
      {detailContact ? (
        <>
          <div className="grid gap-3 py-4 space-y-2">
            <div className="flex gap-3 items-center">
              <Label>ID:</Label>
              <div className="flex-1">{detailContact._id}</div>
            </div>
            <div className="flex gap-3 items-center">
              <Label>Name of customer:</Label>
              <div className="flex-1">{detailContact.username}</div>
            </div>
            <div className="flex gap-3 items-center">
              <Label>Phone:</Label>
              <div className="flex-1">{detailContact.phone}</div>
            </div>

            <div className="flex gap-3 items-center">
              <Label>Date contact:</Label>
              <div className="flex-1">
                {formatDateCustom(detailContact.createdAt, "longDate")}
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <Label>Message:</Label>
              <div className="flex-1">{detailContact.message} VNĐ</div>
            </div>
            <div className="flex gap-3 items-center">
              <Label>Status:</Label>
              <div
                className={classNames("rounded-lg p-2 ", {
                  "bg-green-500": detailContact.read,
                  "bg-red-500": !detailContact.read,
                })}
              >
                {detailContact.read ? "Read" : "Unread"}
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>No contact found</p>
      )}
    </DialogContent>
  );
}

export default AdminContactDetail;
