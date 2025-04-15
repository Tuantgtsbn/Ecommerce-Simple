import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import {
    deleteAddress,
    fetchListAddress,
    setAddressChoosen,
    setAddressEdited
} from '@/store/shop/address-slice';
import { useToast } from '@/contexts/ToastContext';
import classNames from 'classnames';
function CardAddress({ address }) {
    const dispatch = useDispatch();
    const handleClickEdit = (e) => {
        e.stopPropagation();
        dispatch(setAddressEdited(address._id));
    };
    const { addressChoosen } = useSelector((state) => state.shoppingAddress);
    const { toast } = useToast();
    const { user } = useSelector((state) => state.auth);
    const handleClickDelete = async () => {
        try {
            await dispatch(deleteAddress(address._id)).unwrap();
            toast.success('Delete address successfully');
            dispatch(fetchListAddress(user.id));
        } catch (error) {
            toast.error(error);
        }
    };
    const handleClickChoose = () => {
        dispatch(
            setAddressChoosen({
                addressId: address._id,
                address: address.address,
                street: address.street,
                ward: address.ward,
                district: address.district,
                city: address.city,
                country: address.country,
                phone: address.phone,
                notes: address.notes
            })
        );
    };
    return (
        <div>
            <Card
                className={classNames('', {
                    'bg-gray-400': addressChoosen?.addressId === address._id
                })}
                onClick={handleClickChoose}
            >
                <CardContent className='pt-6'>
                    <div className='flex flex-col gap-2'>
                        <Label className='text-lg'>
                            Address: <span className='font-normal'>{address?.address}</span>
                        </Label>
                        <Label className='text-lg'>
                            Street: <span className='font-normal'>{address?.street}</span>
                        </Label>
                        <Label className='text-lg'>
                            Ward: <span className='font-normal'>{address?.ward}</span>
                        </Label>
                        <Label className='text-lg'>
                            District: <span className='font-normal'>{address?.district}</span>{' '}
                        </Label>
                        <Label className='text-lg'>
                            City: <span className='font-normal'>{address?.city}</span>
                        </Label>
                        <Label className='text-lg'>
                            Country: <span className='font-normal'> {address?.country}</span>
                        </Label>
                        <Label className='text-lg'>
                            Phone: <span className='font-normal'> {address?.phone}</span>
                        </Label>
                    </div>
                </CardContent>
                <CardFooter className='justify-between'>
                    <Button onClick={handleClickEdit}>Edit</Button>
                    <Button onClick={handleClickDelete}>Delete</Button>
                </CardFooter>
            </Card>
        </div>
    );
}

function CardAddressWrapper({ listData }) {
    const { isLoading } = useSelector((state) => state.shoppingAddress);
    return (
        <div className='h-full'>
            {listData && listData.length > 0 ? (
                <div className='relative'>
                    <div className='grid  gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]'>
                        {listData.map((address, index) => (
                            <CardAddress key={index} address={address} />
                        ))}
                    </div>
                    {isLoading && (
                        <div className='absolute inset-0 opacity-75 bg-background'>
                            <div className='flex items-center justify-center h-full'>
                                <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin'></div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className='flex justify-center items-center h-full'>
                    <Label className='text-lg text-muted-foreground'>No address found</Label>
                </div>
            )}
        </div>
    );
}

export default CardAddressWrapper;
