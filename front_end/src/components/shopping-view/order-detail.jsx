import { useSelector } from 'react-redux';
import { DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { formatDateCustom } from '@/lib/utils';
import classNames from 'classnames';
function ShoppingOrderDetail() {
    const { user } = useSelector((state) => state.auth);
    const { orderDetails } = useSelector((state) => state.shoppingOrder);
    return (
        <DialogContent className='sm:max-w-[600px] max-h-[90vh]'>
            <DialogHeader>
                <DialogTitle>Order detail</DialogTitle>
            </DialogHeader>
            {orderDetails ? (
                <>
                    <div className='grid gap-3 py-4 space-y-2'>
                        <div className='flex gap-3 items-center'>
                            <Label>ID:</Label>
                            <div className='flex-1'>{orderDetails._id}</div>
                        </div>
                        <div className='flex gap-3 items-center'>
                            <Label>Name of customer:</Label>
                            <div className='flex-1'>{user.userName}</div>
                        </div>
                        <div className='flex gap-3 items-center'>
                            <Label>Address:</Label>
                            <div className='flex-1'>
                                {orderDetails.addressInfo.address} {orderDetails.addressInfo.street}{' '}
                                {orderDetails.addressInfo.ward} {orderDetails.addressInfo.district}{' '}
                                {orderDetails.addressInfo.city} {orderDetails.addressInfo.country}
                            </div>
                        </div>
                        <div className='flex gap-3 items-center'>
                            <Label>Phone:</Label>
                            <div className='flex-1'>{orderDetails.addressInfo.phone} </div>
                        </div>
                        <div className='flex gap-3 items-center'>
                            <Label>Date order:</Label>
                            <div className='flex-1'>
                                {formatDateCustom(orderDetails.orderDate, 'longDate')}
                            </div>
                        </div>
                        <div className='flex gap-3 items-center'>
                            <Label>Lastest update:</Label>
                            <div className='flex-1'>
                                {formatDateCustom(orderDetails.updatedAt, 'longDate')}
                            </div>
                        </div>
                        <div className='flex gap-3 items-center'>
                            <Label>Total price:</Label>
                            <div className='flex-1'>{orderDetails.totalAmount} VNĐ</div>
                        </div>
                        <div className='flex gap-3 items-center'>
                            <Label>Status:</Label>
                            <div
                                className={classNames('rounded-lg p-2 ', {
                                    'bg-[#FACC15]': orderDetails.orderStatus === 'pending',
                                    'bg-[#3B82F6]': orderDetails.orderStatus === 'inProcess',
                                    'bg-[#8B5CF6]': orderDetails.orderStatus === 'confirmed',
                                    'bg-green-500': orderDetails.orderStatus === 'delivered',
                                    'bg-yellow-500': orderDetails.orderStatus === 'inShipping',
                                    'bg-red-500': [
                                        'rejected',
                                        'cancelled',
                                        'failedDelivery'
                                    ].includes(orderDetails.orderStatus)
                                })}
                            >
                                {orderDetails.orderStatus}
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className='grid gap-4'>
                        <div className='grid gap-2'>
                            <div className='font-medium'>Order Details</div>
                            <ul className='grid gap-3'>
                                {orderDetails?.cartItems && orderDetails?.cartItems.length > 0 ? (
                                    <>
                                        {orderDetails?.cartItems.map((item) => (
                                            <div className='grid  gap-3 grid-cols-[auto,1fr]'>
                                                <img
                                                    src={item.thumbnail}
                                                    alt={item.title}
                                                    className='w-20 h-20 object-cover rounded-lg'
                                                />
                                                <div className='flex flex-col flex-1'>
                                                    <p className='font-bold'>{item.title}</p>
                                                    <div className='flex justify-between'>
                                                        <p>{item.name}</p>
                                                        <p className='text-gray-400 self-end'>
                                                            x {item.quantity}
                                                        </p>
                                                    </div>
                                                    {item.discount > 0 ? (
                                                        <div className='flex self-end gap-2'>
                                                            <p className='text-gray-400 line-through'>
                                                                {item.price} VNĐ
                                                            </p>
                                                            <p>
                                                                {(
                                                                    item.price *
                                                                    (1 - item.discount / 100)
                                                                ).toFixed(2)}{' '}
                                                                VNĐ
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className='self-end'>{item.price} VNĐ</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <Separator />
                                        <div className='flex justify-end'>
                                            <p className='text-xl font-bold'>
                                                Total: {orderDetails.totalAmount} VNĐ
                                            </p>
                                        </div>
                                    </>
                                ) : null}
                            </ul>
                        </div>
                    </div>
                </>
            ) : (
                <p>No order found</p>
            )}
        </DialogContent>
    );
}

export default ShoppingOrderDetail;
