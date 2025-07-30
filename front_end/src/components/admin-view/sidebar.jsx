import {adminSidebarMenuItems} from "@/config";
import {ChartNoAxesColumn, ChartNoAxesCombined} from "lucide-react";
import {useLocation, useNavigate} from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import classNames from "classnames";
function MenuItems({setOpen}) {
  const navigate = useNavigate();
  const {pathname} = useLocation();

  return (
    <nav className="flex flex-col gap-2 mt-8">
      {adminSidebarMenuItems.map((item, index) => (
        <div
          key={item.id}
          className={classNames(
            "flex items-center gap-2 cursor-pointer  px-3 py-2",
            {
              "bg-gray-400": pathname === item.path,
            },
          )}
          onClick={() => {
            navigate(item.path);
            setOpen?.(false);
          }}
        >
          <item.icon />
          <span>{item.label}</span>
        </div>
      ))}
    </nav>
  );
}
function AdminSidebar({open, setOpen}) {
  const navigate = useNavigate();
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 flex flex-col h-full">
          <SheetHeader className="border-b">
            <SheetTitle
              className="flex gap-2 mt-5 mb-5"
              onClick={() => {
                navigate("/admin/dashboard");
                setOpen?.(false);
              }}
            >
              <SheetDescription className="sr-only">
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </SheetDescription>
              <ChartNoAxesCombined size={30} />
              <p className="text-2xl font-extrabold">Admin Panel</p>
            </SheetTitle>
          </SheetHeader>
          <MenuItems setOpen={setOpen} />
        </SheetContent>
      </Sheet>
      <div className="hidden w-64 flex-col border-r bg-background lg:flex">
        <div
          className="flex items-center gap-2 cursor-pointer p-4"
          onClick={() => navigate("/admin/dashboard")}
        >
          <ChartNoAxesCombined size={30} />
          <p className="text-bold text-xl">Admin Panel</p>
        </div>
        <MenuItems />
      </div>
    </>
  );
}

export default AdminSidebar;
