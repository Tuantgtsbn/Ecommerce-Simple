import {
  HousePlug,
  LogOut,
  Menu,
  Settings,
  ShoppingCart,
  UserRoundPen,
} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import {Sheet, SheetContent, SheetTrigger} from "../ui/sheet";
import {Button} from "../ui/button";
import {useDispatch, useSelector} from "react-redux";
import {shoppingViewHeaderMenuItems} from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {Avatar, AvatarFallback, AvatarImage} from "../ui/avatar";
import {logoutUser} from "@/store/auth-slice";
import {useEffect, useState} from "react";
import {fetchCartItems} from "@/store/shop/cart-slice";

import CartWrapper from "./cartWrapper";
import {getAllCategories} from "@/store/shop/category-slice";
import Category from "./Category/Category";
import CategoryDialog from "./Category/Category";
function MenuItems({setIsOpenMenuSheet, setIsOpenListCategory}) {
  const navigate = useNavigate();
  return (
    <nav className="flex flex-col lg:flex-row lg:items-center gap-6 font-semibold">
      {shoppingViewHeaderMenuItems.map((item) => (
        <p
          key={item.id}
          className="text-black cursor-pointer"
          onClick={() => {
            navigate(item.path);
            setIsOpenMenuSheet(false);
          }}
        >
          {item.label}
        </p>
      ))}
      <p
        className="text-black cursor-pointer"
        onClick={() => {
          setIsOpenMenuSheet(false);
          setIsOpenListCategory(true);
        }}
      >
        Category
      </p>
    </nav>
  );
}
const HeaderRightContent = ({user, handleOpenCart}) => {
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logoutUser());
  };
  const navigate = useNavigate();
  const {listCartItems} = useSelector((state) => state.shoppingCart);
  console.log("listCartItems", listCartItems);
  return (
    <div className="flex gap-2">
      <div className="relative">
        <Button variant="outline" onClick={() => handleOpenCart(true)}>
          <ShoppingCart className="w-6 h-6" />
          <span className="sr-only">User cart</span>
        </Button>
        {listCartItems && listCartItems.items?.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
            {listCartItems.items.length}
          </span>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>UserUser</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>
            <p>{user.userName}</p>
            <p>{user.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/account")}>
            Account
            <DropdownMenuShortcut>
              <UserRoundPen />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Setting
            <DropdownMenuShortcut>
              <Settings />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            Logout
            <DropdownMenuShortcut>
              <LogOut />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
function ShoppingHeader() {
  const {isAuthenticated, user} = useSelector((state) => state.auth);
  const {loading, listCategory} = useSelector(
    (state) => state.shoppingCategory,
  );
  const [isOpenCartDialog, setIsOpenCartDialog] = useState(false);
  const [isOpenMenuSheet, setIsOpenMenuSheet] = useState(false);
  const [isOpenListCategory, setIsOpenListCategory] = useState(false);
  console.log(isOpenListCategory);
  const dispath = useDispatch();
  useEffect(() => {
    dispath(fetchCartItems(user.id));
    dispath(getAllCategories());
  }, [dispath, user.id]);
  const handleOpenListCategory = () => {
    if (loading || listCategory.length == 0) return;
    setIsOpenListCategory(!isOpenListCategory);
  };
  return (
    <>
      <header className="fixed top-0 z-40 w-full border-b bg-background ">
        <div className="flex  items-center justify-between py-2 container mx-auto">
          <div className="flex gap-2 items-center">
            <Button
              onClick={() => setIsOpenMenuSheet(true)}
              variant="outline"
              size="icon"
              className="lg:hidden"
            >
              <Menu className="w-6 h-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
            <Link to="/" className="inline-flex gap-2">
              <HousePlug className="w-6 h-6" />
              <span className="font-bold">Ecommerce</span>
            </Link>
          </div>

          <div className="hidden lg:flex lg:gap-2">
            <MenuItems
              setIsOpenListCategory={setIsOpenListCategory}
              setIsOpenMenuSheet={setIsOpenMenuSheet}
            />
          </div>
          <div></div>
          {isAuthenticated ? (
            <HeaderRightContent
              user={user}
              handleOpenCart={setIsOpenCartDialog}
            />
          ) : (
            <Link to="/auth/login">
              <Button>Login</Button>
            </Link>
          )}
          <Sheet open={isOpenMenuSheet} onOpenChange={setIsOpenMenuSheet}>
            <SheetContent side="left" className="w-full max-w-xs">
              <MenuItems
                setIsOpenMenuSheet={setIsOpenMenuSheet}
                setIsOpenListCategory={setIsOpenListCategory}
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <CartWrapper
        isOpenCartDialog={isOpenCartDialog}
        setIsOpenCartDialog={setIsOpenCartDialog}
      />
      <CategoryDialog
        open={isOpenListCategory}
        categories={listCategory}
        setIsOpenListCategory={setIsOpenListCategory}
      />
    </>
  );
}

export default ShoppingHeader;
