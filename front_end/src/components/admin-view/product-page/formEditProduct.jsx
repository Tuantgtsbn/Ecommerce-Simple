import CommonForm from "@/components/common/form";
import InputFile from "@/components/common/inputFile";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {editProductFormElements} from "@/config";
import {useToast} from "@/contexts/ToastContext";
import {getAllProducts, updateProduct} from "@/store/admin/products-slice";
import {X} from "lucide-react";
import {useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
function EditFormProduct({initialFormData, setIsOpenAddProductDialog}) {
  console.log(initialFormData);
  const [formData, setFormData] = useState(initialFormData);
  const {isLoading} = useSelector((state) => state.adminProducts);
  const checkValid = editProductFormElements().every(
    (element) => formData[element.name] !== "",
  );
  const {toast} = useToast();
  // const [linksImagesProductDelete, setLinksImagesProductDelete] = useState([]);
  const [linksThumbnailProductDelete, setLinksThumbnailProductDelete] =
    useState(null);
  const dispatch = useDispatch();
  // const inputThumbnailRef = useRef(null);
  // const inputImagesRef = useRef(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("FormData", formData);
    console.log("id", formData._id);
    try {
      await dispatch(
        updateProduct({id: formData._id, data: formData}),
      ).unwrap();
      toast.success("Edit product successfully");
      setIsOpenAddProductDialog(false);
      await dispatch(getAllProducts()).unwrap();
      toast.success("Update product list successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  console.log("FormData", formData);
  console.log("checkValid", checkValid);
  return (
    <>
      <Label>Thumbnail</Label>
      <div className="relative bg-gray-300">
        <img
          src={initialFormData.thumbnail}
          alt="Thumbnail"
          className="w-full aspect-square object-contain rounded-md"
        />
        <button className="absolute top-[10px] right-1 rounded-full bg-gray-300 hover:bg-gray-500">
          <X
            size={16}
            onClick={() =>
              setLinksThumbnailProductDelete(initialFormData.thumbnail)
            }
          />
        </button>
      </div>
      <Label>Illustration images</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {initialFormData.images.map((img, index) => (
          <div key={index} className="flex flex-col  gap-2 relative">
            <img
              src={img}
              alt={`Preview ${index + 1}`}
              className="w-full aspect-square object-contain rounded-md"
            />
            <button className="absolute top-[10px] right-1 rounded-full bg-gray-300 hover:bg-gray-500">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <CommonForm
        formControls={editProductFormElements(
          initialFormData.brand,
          initialFormData.category,
        )}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        checkValid={checkValid}
        buttonText="Edit Product"
        isBtnDisabled={isLoading ? true : !checkValid}
      />
    </>
  );
}

export default EditFormProduct;
