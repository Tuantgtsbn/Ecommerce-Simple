import React from 'react';
import Banner from '@/assets/imgs/account.jpg';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShoppingOrder from '@/components/shopping-view/order';
import AddressCardWrapper from '@/components/shopping-view/addressWrapper';
import Profile from '@/components/shopping-view/profile';
const AccountShoppingPage = () => {
    return (
        <div className='flex flex-col'>
            <div className='relative h-[350px] w-full overflow-hidden'>
                <img src={Banner} alt='' className='h-full w-full object-cover object-center' />
            </div>
            <div className='container mx-auto mt-10 grid grid-cols-1 py-8'>
                <div className='flex flex-col border rounded-lg bg-background p-4 shadow'>
                    <Tabs defaultValue='profile' className='w-full'>
                        <TabsList>
                            <TabsTrigger value='profile'>Profile</TabsTrigger>
                            <TabsTrigger value='order'>Order</TabsTrigger>
                            <TabsTrigger value='address'>Address</TabsTrigger>
                        </TabsList>
                        <TabsContent value='profile'>
                            <Profile />
                        </TabsContent>
                        <TabsContent value='order'>
                            <ShoppingOrder />
                        </TabsContent>
                        <TabsContent value='address'>
                            <AddressCardWrapper />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};
export default AccountShoppingPage;
