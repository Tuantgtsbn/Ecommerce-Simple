import { useDispatch, useSelector } from 'react-redux';
import FormAddress from './formAddress';
import { useEffect, useState } from 'react';
import { fetchListAddress } from '@/store/shop/address-slice';
import { Card, CardContent } from '../ui/card';
import Loading from '../common/Loading/Loading';
import CardAddressWrapper from './cardAddressWrapper';

function AddressWrapper() {
    const dispath = useDispatch();
    const { isLoading, listAddress } = useSelector((state) => state.shoppingAddress);
    const { user } = useSelector((state) => state.auth);
    useEffect(() => {
        dispath(fetchListAddress(user.id));
    }, [dispath, user.id]);
    return (
        <div>
            <div className='min-h-[350px] mb-6 flex'>
                <Card className='w-full'>
                    <CardContent className='pt-6 h-full'>
                        {isLoading && listAddress.length == 0 ? (
                            <Loading className='h-full' />
                        ) : (
                            <CardAddressWrapper listData={listAddress} />
                        )}
                    </CardContent>
                </Card>
            </div>
            <FormAddress />
        </div>
    );
}

export default AddressWrapper;
