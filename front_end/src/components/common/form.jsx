import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {Label} from "../ui/label";
import {Link} from "react-router-dom";
import LoadingText from "./Loading/LoadingText";
import {Textarea} from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import InputFile from "./inputFile";
function CommonForm({
  formControls,
  formData,
  setFormData,
  onSubmit,
  buttonText,
  isBtnDisabled,
  option,
  isLoading,
}) {
  console.log("formData", formData);
  const renderOption = () => {
    switch (option) {
      case "login":
        return (
          <div>
            <p className="inline-block mr-2">Don't have an account?</p>
            <Link to="/auth/register" className="text-blue-500">
              Sign up
            </Link>
          </div>
        );
      case "register":
        return (
          <div>
            <p className="inline-block mr-2">Already have an account</p>
            <Link to="/auth/login" className="text-blue-500">
              Sign in
            </Link>
          </div>
        );
      default:
        return null;
    }
  };
  const renderInputsByComponentType = (inputConfig) => {
    let element = null;
    const value = formData[inputConfig.name] || "";
    switch (inputConfig.componentType) {
      case "input":
        element = (
          <Input
            placeholder={inputConfig.placeholder}
            type={inputConfig.type}
            value={value}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                [inputConfig.name]: e.target.value,
              }))
            }
            id={inputConfig.name}
            name={inputConfig.name}
          />
        );
        break;
      case "select":
        element = (
          <Select
            onValueChange={(value) =>
              setFormData({
                ...formData,
                [inputConfig.name]: value,
              })
            }
            value={formData[inputConfig.name] || inputConfig.default}
          >
            <SelectTrigger className="w-full" id={inputConfig.name}>
              <SelectValue placeholder={inputConfig.label} />
            </SelectTrigger>
            <SelectContent>
              {inputConfig.options && inputConfig.options.length > 0
                ? inputConfig.options.map((optionItem) => (
                    <SelectItem key={optionItem.id} value={optionItem.id}>
                      {optionItem.label}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
        );
        break;
      case "textarea":
        element = (
          <Textarea
            placeholder={inputConfig.placeholder}
            value={value}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                [inputConfig.name]: e.target.value,
              }))
            }
            id={inputConfig.name}
            name={inputConfig.name}
            rows={inputConfig.rows || 4}
          />
        );
        break;
      default:
        element = (
          <Input
            placeholder={inputConfig.placeholder}
            type={inputConfig.type}
            value={value}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                [inputConfig.name]: e.target.value,
              }))
            }
            id={inputConfig.name}
            name={inputConfig.name}
          />
        );
    }
    return element;
  };
  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        {formControls.map((inputConfig, index) => (
          <div key={index}>
            <Label className="mb-1" htmlFor={inputConfig.name}>
              {inputConfig.label}
            </Label>
            {renderInputsByComponentType(inputConfig)}
          </div>
        ))}
        {renderOption()}
      </div>
      <Button type="submit" className="mt-2" disabled={isBtnDisabled}>
        {buttonText || "Submit"}
        {isLoading && <LoadingText />}
      </Button>
    </form>
  );
}

export default CommonForm;
