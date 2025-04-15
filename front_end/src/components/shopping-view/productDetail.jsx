import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';
import classNames from 'classnames';
import { Separator } from '@radix-ui/react-select';
import ReviewProduct from './reviewProduct';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { addProductToCart, fetchCartItems } from '@/store/shop/cart-slice';
import { useToast } from '@/contexts/ToastContext';
import { startTransition, useEffect, useOptimistic, useState } from 'react';
import RatingStar from '../common/rating-star';
import { addReview, getReviewsByProductId } from '@/store/shop/review-slice';
import { useNavigate } from 'react-router-dom';
function ProductDetailDialog({ open, setOpen }) {
    const [rating, setRating] = useState(0);
    const [reviewMessage, setReviewMessage] = useState('');
    const { detailProduct, isLoading } = useSelector((state) => state.shoppingProducts);
    const { isLoading: isLoadingReview, listReviews } = useSelector(
        (state) => state.shoppingReview
    );

    const dispatch = useDispatch();
    const { toast } = useToast();
    const { user } = useSelector((state) => state.auth);

    // Optimistic UI state
    const [optimisticReviews, addOptimisticReview] = useOptimistic(listReviews);
    const navigate = useNavigate();
    const handleAddToCart = async () => {
        try {
            await dispatch(
                addProductToCart({ userId: user.id, productId: detailProduct._id, quantity: 1 })
            ).unwrap();
            toast.success('Add to cart successfully');
            await dispatch(fetchCartItems(user.id)).unwrap();
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };
    useEffect(() => {
        const fetchReviews = async () => {
            dispatch(getReviewsByProductId(detailProduct?._id));
        };
        if (detailProduct?._id) {
            fetchReviews();
        }
    }, [dispatch, detailProduct]);
    useEffect(() => {
        console.log('Current listReviews:', listReviews);
        console.log('Current optimisticReviews:', optimisticReviews);
    }, [listReviews, optimisticReviews]);
    const handleSubmitReview = async () => {
        if (!rating || !reviewMessage) return;

        // Create optimistic review with loading state
        const optimisticReview = {
            _id: `temp-${Date.now()}`, // Temporary ID to identify optimistic review
            userId: {
                _id: user.id,
                userName: user.userName,
                avatar: user.avatar
            },
            productId: detailProduct._id,
            rating: rating,
            comment: reviewMessage,
            createdAt: new Date().toISOString(),
            isOptimistic: true // Flag to identify optimistic review
        };
        startTransition(async () => {
            try {
                // Add optimistic update
                addOptimisticReview((prev) => [...prev, optimisticReview]);
                console.log('optimisticReviews', optimisticReviews);
                // Reset form immediately

                // Artificial delay to show loading state
                await new Promise((resolve) => setTimeout(resolve, 3000));

                // Make actual API call
                await dispatch(
                    addReview({
                        userId: user.id,
                        productId: detailProduct._id,
                        rating,
                        comment: reviewMessage
                    })
                ).unwrap();

                // Refresh reviews to get the actual data
                await dispatch(getReviewsByProductId(detailProduct._id)).unwrap();

                toast.success('Review added successfully');
                setRating(0);
                setReviewMessage('');
            } catch (error) {
                // Revert optimistic update by re-fetching
                await dispatch(getReviewsByProductId(detailProduct._id)).unwrap();
                toast.error(error || 'Failed to add review');
            }
        });
    };
    const handleNavigateToDetailPage = () => {
        navigate(`/product/${detailProduct._id}`);
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {isLoading || !detailProduct ? (
                <DialogContent className='sm:p-12 max-w-[90vw] sm:max-w[80vw] lg:max-w-[70vw]'>
                    <div className='flex flex-col space-y-3'>
                        <Skeleton className='h-[125px] w-[250px] rounded-xl' />
                        <div className='space-y-2'>
                            <Skeleton className='h-4 w-[250px]' />
                            <Skeleton className='h-4 w-[200px]' />
                        </div>
                    </div>
                </DialogContent>
            ) : (
                <DialogContent className='grid grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w[80vw] lg:max-w-[70vw]'>
                    <div className='relative overflow-hidden rounded-lg'>
                        <img
                            src={detailProduct?.thumbnail}
                            alt={detailProduct?.title}
                            width={600}
                            height={600}
                            className='aspect-square w-full object-cover'
                        />
                    </div>
                    <div className='grid gap-6'>
                        <div>
                            <h1 className='text-3xl font-bold'>{detailProduct?.title}</h1>
                            <p>{detailProduct?.description}</p>
                            <div className='flex justify-between '>
                                <div className='flex gap-2'>
                                    <p
                                        className={classNames('text-3xl font-bold', {
                                            'line-through': detailProduct?.discount > 0
                                        })}
                                    >
                                        {detailProduct?.price}
                                    </p>
                                    <sub className='pt-2'>đ</sub>
                                </div>
                                {detailProduct?.discount > 0 && (
                                    <div className='flex gap-2'>
                                        <p className='text-3xl font-bold'>
                                            {detailProduct.price *
                                                (1 - detailProduct.discount / 100)}
                                        </p>
                                        <sub className='pt-2'>đ</sub>
                                    </div>
                                )}
                            </div>
                            <div className='mt-2'>
                                <Button className='w-full' onClick={handleNavigateToDetailPage}>
                                    Watch detail
                                </Button>
                            </div>
                            <div className='mt-2'>
                                <Button className='w-full' onClick={handleAddToCart}>
                                    Add to cart
                                </Button>
                            </div>
                            <Separator />
                            <div className='max-h-[300px] overflow-y-auto flex flex-col gap-4 mt-2 relative'>
                                <div className='sticky top-0 bg-white z-10'>
                                    <p className='text-3xl font-bold'>Reviews</p>
                                </div>
                                <div className='space-y-4'>
                                    {optimisticReviews.map((review) => (
                                        <div
                                            key={review._id}
                                            className={classNames('', {
                                                'opacity-50': review.isOptimistic
                                            })}
                                        >
                                            <ReviewProduct review={review} />
                                        </div>
                                    ))}
                                    {optimisticReviews.length === 0 && (
                                        <p className='text-center text-gray-500'>No reviews yet</p>
                                    )}
                                </div>
                            </div>
                            <div className='px-1 flex flex-col gap-2 mt-4'>
                                <Label className='text-3xl font-bold'>Write a review</Label>
                                <div className='flex gap-2'>
                                    <RatingStar rating={rating} setRating={setRating} />
                                </div>
                                <Textarea
                                    value={reviewMessage}
                                    onChange={(e) => setReviewMessage(e.target.value)}
                                    placeholder='Write your review here...'
                                    disabled={isLoadingReview}
                                />
                                <Button
                                    onClick={handleSubmitReview}
                                    disabled={!reviewMessage || !rating || isLoadingReview}
                                >
                                    {isLoadingReview ? 'Submitting...' : 'Submit Review'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            )}
        </Dialog>
    );
}

export default ProductDetailDialog;
