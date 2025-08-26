import {Button} from "@/components/ui/button";
import {
  Airplay,
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Shirt,
  ShirtIcon,
  ShoppingBasket,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
} from "lucide-react";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {useToast} from "@/contexts/ToastContext";
import {
  fetchDetailProduct,
  fetchFilteredProducts,
} from "@/store/shop/products-slice";
import {Card, CardContent} from "@/components/ui/card";
import {createSearchParamsHelper} from "@/lib/utils";
import ShoppingProductCard from "@/components/shopping-view/productCard";
import ProductDetailDialog from "@/components/shopping-view/productDetail";
import {useGetActiveBannersQuery} from "@/store/api/bannerApi";
import {HeroSection} from "@/components/shopping-view/HeroSection";

const categoriesWithIcon = [
  {id: "men", label: "Men", icon: ShirtIcon},
  {id: "women", label: "Women", icon: CloudLightning},
  {id: "kids", label: "Kids", icon: BabyIcon},
  {id: "accessories", label: "Accessories", icon: WatchIcon},
  {id: "footwear", label: "Footwear", icon: UmbrellaIcon},
];

const brandsWithIcon = [
  {id: "nike", label: "Nike", icon: Shirt},
  {id: "adidas", label: "Adidas", icon: WashingMachine},
  {id: "puma", label: "Puma", icon: ShoppingBasket},
  {id: "levi", label: "Levi's", icon: Airplay},
  {id: "zara", label: "Zara", icon: Images},
  {id: "h&m", label: "H&M", icon: Heater},
];

function HomeShoppingPage() {
  const {productList} = useSelector((state) => state.shoppingProducts);
  const [openDetailProduct, setOpenDetailProduct] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {toast} = useToast();
  const {data: activeBanners, isLoading, isError} = useGetActiveBannersQuery();

  const handleNavigateToListingPage = (id, category) => {
    navigate(`/listing/?${category}=${id}`);
  };

  const handleClickDetail = async (productId) => {
    try {
      await dispatch(fetchDetailProduct(productId)).unwrap();
      setOpenDetailProduct(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const filter = {
      limit: 10,
    };
    const searchParams = createSearchParamsHelper(filter);
    console.log(searchParams, "searchParams");
    dispatch(fetchFilteredProducts(searchParams));
  }, [dispatch]);

  useEffect(() => {
    window.document.title = "Home - Shopping";
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full bg-gray-100">
        <HeroSection
          data={activeBanners?.data}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Shop by category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoriesWithIcon.map((categoryItem) => (
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() =>
                  handleNavigateToListingPage(categoryItem.id, "category")
                }
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <categoryItem.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold">{categoryItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Brand</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {brandsWithIcon.map((brandItem) => (
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() =>
                  handleNavigateToListingPage(brandItem.id, "brand")
                }
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <brandItem.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold">{brandItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Feature Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList && productList.length > 0
              ? productList.map((productItem) => (
                  <ShoppingProductCard
                    product={productItem}
                    handleClickDetail={handleClickDetail}
                  />
                ))
              : null}
          </div>
        </div>
      </section>
      <ProductDetailDialog
        open={openDetailProduct}
        setOpen={setOpenDetailProduct}
      />
    </div>
  );
}

export default HomeShoppingPage;
