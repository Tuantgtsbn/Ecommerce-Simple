import {useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CommonForm from "@/components/common/form";
import {ProfileFormConfig, ChangePasswordFormConfig} from "@/config";
import {useToast} from "@/contexts/ToastContext";
import {updateProfile, changePassword, logoutUser} from "@/store/auth-slice";
import {Label} from "../ui/label";
import {formatDateCustom} from "@/lib/utils";

function Profile() {
  const {user} = useSelector((state) => state.auth);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    userName: user.userName || "",
    email: user.email || "",
    phone: user.phone || "",
    birthday: user.birthday || "",
    gender: user.gender || "",
    id: user.id,
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const dispatch = useDispatch();
  const {toast} = useToast();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(profileFormData)).unwrap();
      toast.success("Profile updated successfully");
      setTimeout(() => {
        setIsEditDialogOpen(false);
      }, 1000);
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      await dispatch(
        changePassword({
          currentPassword: passwordFormData.currentPassword,
          newPassword: passwordFormData.newPassword,
          id: user.id,
        }),
      ).unwrap();
      toast.success("Password changed successfully");
      setTimeout(() => {
        dispatch(logoutUser());
      }, 2000);
      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    }
  };

  const handleInitializeEdit = async () => {
    try {
      setProfileFormData({
        userName: user.userName,
        email: user.email,
        gender: user.gender,
        birthday: user.birthday.split("T")[0],
        id: user.id,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsEditDialogOpen(true);
    }
  };
  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.userName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <div className="flex gap-2 items-center">
                <Label className="text-[18px]">Full name:</Label>
                <p className="text-gray-500">{user.userName}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Label className="text-[18px]">Email:</Label>
                <p className="text-gray-500">{user.email}</p>
              </div>
              {user.birthday && (
                <div className="flex gap-2 items-center">
                  <Label className="text-[18px]">Birthday:</Label>
                  <p className="text-gray-500">
                    {formatDateCustom(user.birthday, "shortDate")}
                  </p>
                </div>
              )}
              {user.gender && (
                <div className="flex gap-2 items-center">
                  <Label className="text-[18px]">Gender:</Label>
                  <p className="text-gray-500">{user.gender}</p>
                </div>
              )}
              {user.phone && <p className="text-gray-500">{user.phone}</p>}
            </div>
            <div className="flex gap-4">
              <Button onClick={handleInitializeEdit}>Edit Profile</Button>
              <Button
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                Change Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile information here
            </DialogDescription>
          </DialogHeader>
          <CommonForm
            formControls={ProfileFormConfig(profileFormData?.gender)}
            formData={profileFormData}
            setFormData={setProfileFormData}
            buttonText="Save Changes"
            onSubmit={handleUpdateProfile}
          />
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <CommonForm
            formControls={ChangePasswordFormConfig}
            formData={passwordFormData}
            setFormData={setPasswordFormData}
            buttonText="Change Password"
            onSubmit={handleChangePassword}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Profile;
