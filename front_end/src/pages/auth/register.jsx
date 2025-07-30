import {useEffect, useState} from "react";
import {RegisterFormConfig} from "@/config";
import CommonForm from "@/components/common/form";
import {useSelector, useDispatch} from "react-redux";
import {registerUser} from "@/store/auth-slice";
import {useToast} from "@/contexts/ToastContext";
import {Link} from "react-router-dom";
function AuthRegister() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userName: "",
  });
  const {toast} = useToast();
  const dispatch = useDispatch();
  const {isLoading} = useSelector((state) => state.auth);
  console.log("formData", formData);
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("formData submit", formData);
    try {
      await dispatch(registerUser(formData)).unwrap();
      toast.success("Register successful");
    } catch (error) {
      console.log("Error", error);
      toast.error(error);
    }
  };
  useEffect(() => {
    window.document.title = "Đăng ký";
  }, []);
  return (
    <div className="">
      <h1 className="text-4xl font-bold text-center mb-4">Register</h1>

      <CommonForm
        formControls={RegisterFormConfig}
        setFormData={setFormData}
        buttonText="Register"
        onSubmit={handleSubmit}
        isBtnDisabled={isLoading}
        formData={formData}
        option="register"
        isLoading={isLoading}
      />
    </div>
  );
}

export default AuthRegister;
