import {Button} from "@/components/ui/button";
import {Minus, Plus} from "lucide-react";
import {useDispatch, useSelector} from "react-redux";
import Imgs1 from "@assets/imgs/Bank/visa.jpeg";
import Imgs2 from "@assets/imgs/Bank/master-card.jpeg";
import Imgs3 from "@assets/imgs/Bank/paypal.jpeg";
import Imgs4 from "@assets/imgs/Bank/american-express.jpeg";
import Imgs5 from "@assets/imgs/Bank/maestro.jpeg";
import Imgs6 from "@assets/imgs/Bank/bitcoin.jpeg";
import NoProductFound from "@assets/imgs/noproduct.png";
import Tooltip from "@/components/common/Tooltip/Tooltip";

import {useEffect, useRef, useState} from "react";
import Accordion from "@/components/common/Accordion/accordion";
import {Label} from "@/components/ui/label";
import {Link, useParams} from "react-router-dom";
import {fetchDetailProduct} from "@/store/shop/products-slice";
import {getReviewsByProductId} from "@/store/shop/review-slice";
import ReviewProduct from "@/components/shopping-view/reviewProduct";
import Loading from "@/components/common/Loading/Loading";
import axiosClient from "@/apis/axiosClient";
import ShoppingProductCard from "@/components/shopping-view/productCard";
import ProductDetailDialog from "@/components/shopping-view/productDetail";
import {useToast} from "@/contexts/ToastContext";
import {addProductToCart, fetchCartItems} from "@/store/shop/cart-slice";
import RatingStar from "@/components/common/rating-star";
import SliderCommon from "@/components/shopping-view/SliderCommon/SliderCommon";
import ModalSlider from "@/components/shopping-view/Modal/ModalSlider/ModalSlider";

function DetailProduct() {
  const {detailProduct, isLoading: isLoadingDetail} = useSelector(
    (state) => state.shoppingProducts,
  );
  if (detailProduct) {
    var listImgs = [detailProduct.thumbnail, ...detailProduct.images];
  }
  const {listReviews} = useSelector((state) => state.shoppingReview);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [chooseImg, setChooseImg] = useState(0);
  const [isSilerModalOpen, setIsSilerModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const {id} = useParams();
  const [quantiy, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const {toast} = useToast();
  const {user} = useSelector((state) => state.auth);
  console.log(location);
  useEffect(() => {
    async function fetchRelatedProducts(id) {
      try {
        setIsLoading(true);
        const response = await axiosClient.get(
          `/api/shop/products/related/${id}`,
          {
            withCredentials: true,
          },
        );
        console.log(response);
        setRelatedProducts(response.data.data);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRelatedProducts(id);
  }, [dispatch, id]);
  useEffect(() => {
    async function fetchProduct() {
      console.log(detailProduct);
      if (!detailProduct) {
        try {
          await dispatch(fetchDetailProduct(id)).unwrap();
          await dispatch(getReviewsByProductId(id)).unwrap();
        } catch (error) {
          console.log(error);
        }
      }
    }
    fetchProduct();
  }, [dispatch, id, detailProduct]);
  const handleChangeQuantity = async (type) => {
    let copyQuantity = quantiy;
    if (type === "plus") {
      copyQuantity += 1;
    } else {
      copyQuantity -= 1;
    }

    if (copyQuantity > detailProduct.stock) {
      toast.error("You have reached the maximum quantity for this product");
      return;
    } else {
      setQuantity(copyQuantity);
    }
  };
  const addToCart = async () => {
    try {
      await dispatch(
        addProductToCart({
          userId: user.id,
          productId: detailProduct._id,
          quantity: quantiy,
        }),
      ).unwrap();
      toast.success("Add to cart successfully");
      await dispatch(fetchCartItems(user.id)).unwrap();
    } catch (error) {
      toast.error(error);
    }
  };
  const handleHoverImg = (index) => {
    setChooseImg(index);
  };
  const handleClickImg = () => {
    setIsSilerModalOpen(true);
  };
  const handleClickSlider = (index) => {
    setIsSilerModalOpen(true);
    setChooseImg(index);
  };
  const renderFunc = (item, index) => {
    return <img src={item} alt="" className="w-full object-contain" />;
  };
  const elementRef = useRef(null);
  useEffect(() => {
    window.document.title = detailProduct?.name
      ? `${detailProduct.name} - Ecommerce`
      : "Loading...";
  }, [detailProduct?.name]);
  return isLoadingDetail ? (
    <Loading className="h-screen" />
  ) : detailProduct ? (
    <>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-9">
          <div>
            <div className="h-[450px] mb-4">
              <img
                src={listImgs[chooseImg]}
                alt=""
                className="w-full object-contain h-full"
                onClick={handleClickImg}
              />
            </div>
            <SliderCommon
              data={listImgs}
              className=""
              variant="primary"
              onHover={handleHoverImg}
              onClick={handleClickSlider}
              renderFunc={renderFunc}
            />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl">{detailProduct.name}</h1>
            <div className="flex gap-2">
              <div className="flex gap-2">
                <RatingStar
                  rating={parseInt(detailProduct.averageRating)}
                  setRating={(item) => console.log(item)}
                />
              </div>
              <p>{`(${detailProduct.totalReviews} reviews)`}</p>
            </div>
            <div>
              {detailProduct?.discount > 0 ? (
                <div>
                  <div className="text-red-500 flex font-[500]">
                    <p className="text-lg ">
                      {detailProduct.price * (1 - detailProduct.discount / 100)}
                    </p>
                    <sub>đ</sub>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className=" bg-gray-400 font-[500] px-1 py-1 rounded-lg">
                      -{detailProduct.discount}%
                    </div>
                    <div className="flex">
                      <p className="text-muted-foreground line-through">
                        {detailProduct.price}
                      </p>
                      <sub className="text-muted-foreground">đ</sub>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex font-[500]">
                  <p className="text-lg ">{detailProduct.price}</p>
                  <sub className="">đ</sub>
                </div>
              )}
            </div>
            <p>{detailProduct.description}</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Button
                  disabled={detailProduct.quantity === 1}
                  variant="outline"
                  size="icon"
                  onClick={() => handleChangeQuantity("minus")}
                  className="w-[30px] h-[30px]"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <p>{quantiy}</p>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleChangeQuantity("plus")}
                  className="w-[30px] h-[30px]"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Button className="w-full" onClick={addToCart}>
                Add to cart
              </Button>
            </div>
            <div className="line flex gap-2 items-center">
              <div className="h-[1px] bg-black flex-1"></div>
              <p>OR</p>
              <div className="h-[1px] bg-black flex-1"></div>
            </div>
            <Button className="w-full">Buy now</Button>
            <div className="relative border border-solid border-thirdWhite h-[97px] mt-7 flex justify-center items-center">
              <div className="flex gap-2">
                <Tooltip text="Pay safety with Visa">
                  <img
                    src={Imgs1}
                    alt=""
                    className="w-[48px] h-[32px] border border-solid border-thirdWhite"
                  />
                </Tooltip>
                <Tooltip text="Pay safety with Master Card">
                  <img
                    src={Imgs2}
                    alt=""
                    className="w-[48px] h-[32px] border border-solid border-thirdWhite"
                  />
                </Tooltip>
                <Tooltip text="Pay safety with Pay Pal">
                  <img
                    src={Imgs3}
                    alt=""
                    className="w-[48px] h-[32px] border border-solid border-thirdWhite"
                  />
                </Tooltip>
                <Tooltip text="Pay safety with American Express">
                  <img
                    src={Imgs4}
                    alt=""
                    className="w-[48px] h-[32px] border border-solid border-thirdWhite"
                  />
                </Tooltip>
                <Tooltip text="Pay safety with Maetro">
                  <img
                    src={Imgs5}
                    alt=""
                    className="w-[48px] h-[32px] border border-solid border-thirdWhite"
                  />
                </Tooltip>
                <Tooltip text="Pay safety with Bitcoin">
                  <img
                    src={Imgs6}
                    alt=""
                    className="w-[48px] h-[32px] border border-solid border-thirdWhite"
                  />
                </Tooltip>
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-white">
                <h1 className="uppercase">
                  Guaranteed <span className="text-green-400">safe</span>{" "}
                  checkout
                </h1>
              </div>
            </div>
            <p className="text-center">Your payment is 100% secure</p>
            <div>
              <div className="flex gap-2 items-center">
                <h1 className="text-xl">Brand:</h1>
                <p className="capitalize text-xl">{detailProduct.brand}</p>
              </div>
              <div className="flex gap-2 items-center">
                <h1 className="text-xl">SKU:</h1>
                <p className="capitalize text-xl">{detailProduct._id}</p>
              </div>
              <div className="flex gap-2 items-center">
                <h1 className="text-xl">Category:</h1>
                <p className="capitalize text-xl">{detailProduct.category}</p>
              </div>
            </div>
            <div>
              <Accordion ref={elementRef} title="Additional information">
                <h1>Additional information</h1>
              </Accordion>
              <Accordion
                ref={elementRef}
                title={`Reviews (${listReviews.length})`}
              >
                <div className="max-h-[500px] overflow-y-auto space-y-4">
                  {listReviews.map((review) => (
                    <ReviewProduct key={review._id} review={review} />
                  ))}
                </div>
              </Accordion>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <p className="text-2xl font-semibold text-center">Related products</p>
          {isLoading ? (
            <Loading className="h-[400px]" />
          ) : error ? (
            <p>Error</p>
          ) : relatedProducts.length === 0 ? (
            <p>No related products</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {relatedProducts.map((product) => (
                <ShoppingProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
      {isSilerModalOpen && (
        <ModalSlider
          images={listImgs}
          onClose={() => setIsSilerModalOpen(false)}
          options={{loop: true, startIndex: chooseImg}}
        />
        // <ModalSlider slides={[1, 2, 3, 4, 5]} options={{ loop: true }} />
      )}
    </>
  ) : (
    <div className="flex flex-col gap-4 justify-center items-center h-[90vh]">
      <img src={NoProductFound} className="h-[500px]" alt="" />
      <Button>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}

export default DetailProduct;
