import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import { categoryValueMap, brandValueMap } from '@/config';
import { addProductToCart, fetchCartItems } from '@/store/shop/cart-slice';
import { useToast } from '@/contexts/ToastContext';
import { useState } from 'react';
function ShoppingProductCard({ product, handleClickDetail }) {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const { user } = useSelector((state) => state.auth);
    const { listCartItems } = useSelector((state) => state.shoppingCart);
    const [isLoading, setIsLoading] = useState(false);
    const handleAddToCart = async () => {
        try {
            setIsLoading(true);
            const productInCart = listCartItems?.items?.find(
                (item) => item.productId === product._id
            );
            if (productInCart && productInCart.quantity + 1 > product.stock) {
                toast.error('You have reached the maximum quantity for this product');
                return;
            }
            await dispatch(
                addProductToCart({ userId: user.id, productId: product._id, quantity: 1 })
            ).unwrap();
            toast.success('Add to cart successfully');
            await dispatch(fetchCartItems(user.id)).unwrap();
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Card>
            <div onClick={() => handleClickDetail(product._id)}>
                <div className='relative'>
                    <img
                        src={product.thumbnail}
                        alt={product.name}
                        className='w-full object-cover h-[300px] rounded-t-lg'
                    />
                    {product?.discount > 0 && (
                        <div className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg border-1 border-white border-solid'>
                            {product.discount}% OFF
                        </div>
                    )}
                </div>
            </div>
            <CardContent>
                <h2 className='text-xl font-bold mb-2'>{product?.name}</h2>
                <div className='flex justify-between mb-2'>
                    <p className='text-muted-foreground'>
                        {product.category
                            ? categoryValueMap[product.category] || 'Unknown'
                            : 'Unknown'}
                    </p>
                    <p className='text-muted-foreground'>
                        {product.brand ? brandValueMap[product.brand] || 'Unknown' : 'Unknown'}
                    </p>
                </div>
                <div>
                    {product?.discount > 0 ? (
                        <div>
                            <div className='text-red-500 flex font-[500]'>
                                <p className='text-lg '>
                                    {product.price * (1 - product.discount / 100)}
                                </p>
                                <sub>đ</sub>
                            </div>
                            <div className='flex items-center gap-2'>
                                <div className=' bg-gray-400 font-[500] px-1 py-1 rounded-lg'>
                                    -{product.discount}%
                                </div>
                                <div className='flex'>
                                    <p className='text-muted-foreground line-through'>
                                        {product.price}
                                    </p>
                                    <sub className='text-muted-foreground'>đ</sub>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='flex font-[500]'>
                            <p className='text-lg '>{product.price}</p>
                            <sub className=''>đ</sub>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button className='w-full' onClick={handleAddToCart} disabled={isLoading}>
                    Add to cart
                </Button>
            </CardFooter>
        </Card>
    );
}

export default ShoppingProductCard;
