import axiosClient from '@/apis/axiosClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

import { statisticsOrders } from '@/store/admin/order-slice';
import { statisticsProducts } from '@/store/admin/products-slice';
import { statisticsUsers } from '@/store/admin/user-slice';
import { Skeleton } from '@/components/ui/skeleton';
function DashboardPage() {
    const dispatch = useDispatch();
    const { isLoading: isLoadingOrders, statisticsOrders: objStatisticsOrders } = useSelector(
        (state) => state.adminOrders
    );
    const { isLoading: isLoadingProducts, statisticsProducts: objStatisticsProducts } = useSelector(
        (state) => state.adminProducts
    );
    const { isLoading: isLoadingUsers, statisticsUsers: objStatisticsUsers } = useSelector(
        (state) => state.adminUsers
    );
    useEffect(() => {
        async function fetchStatistics() {
            await Promise.allSettled([
                dispatch(statisticsOrders()),
                dispatch(statisticsProducts()),
                dispatch(statisticsUsers())
            ]);
        }
        fetchStatistics();
    }, [dispatch]);
    const orderStatusData = useMemo(() => {
        let [countPending, countInProcess, countCancelled, countDelivered] = [0, 0, 0, 0];
        objStatisticsOrders?.orders.forEach((order) => {
            switch (order.orderStatus) {
                case 'pending':
                    countPending++;
                    break;
                case 'inProcess':
                    countInProcess++;
                    break;
                case 'cancelled':
                    countCancelled++;
                    break;
                case 'delivered':
                    countDelivered++;
                    break;
                default:
                    break;
            }
        });
        return [
            { status: 'Pending', count: countPending },
            { status: 'In Process', count: countInProcess },
            { status: 'Cancelled', count: countCancelled },
            { status: 'Delivered', count: countDelivered }
        ];
    }, [objStatisticsOrders]);
    const revenueData = useMemo(() => {
        return objStatisticsOrders?.statistics?.monthlyBusiness.map((item) => {
            return {
                name: `${item.month}/${item.year}`,
                total: item.revenue
            };
        });
    }, [objStatisticsOrders]);
    return (
        <div className='flex flex-col gap-5'>
            {/* Stats Cards */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {isLoadingOrders ? (
                    <Skeleton className='h-[100px] w-full' />
                ) : (
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
                            <DollarSign className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>
                                {objStatisticsOrders?.statistics?.total.revenue || 0}
                            </div>
                            <p className='text-xs text-muted-foreground'>{`+${objStatisticsOrders?.statistics?.growth.revenue || 0}% from last month`}</p>
                        </CardContent>
                    </Card>
                )}
                {isLoadingOrders ? (
                    <Skeleton className='h-[100px] w-full' />
                ) : (
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
                            <ShoppingCart className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>
                                +{objStatisticsOrders?.statistics?.total.orders || 0}
                            </div>
                            <p className='text-xs text-muted-foreground'>
                                +{objStatisticsOrders?.statistics?.growth.orders || 0}% from last
                                month
                            </p>
                        </CardContent>
                    </Card>
                )}
                {isLoadingProducts ? (
                    <Skeleton className='h-[100px] w-full ' />
                ) : (
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>Total Products</CardTitle>
                            <Package className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>
                                {objStatisticsProducts?.total || 0}
                            </div>
                            <p className='text-xs text-muted-foreground'>
                                +{objStatisticsProducts?.newProducts || 0} new products from last
                                month
                            </p>
                        </CardContent>
                    </Card>
                )}
                {isLoadingUsers ? (
                    <Skeleton className='h-[100px] w-full' />
                ) : (
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
                            <Users className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>
                                +{objStatisticsUsers?.total || 0}
                            </div>
                            <p className='text-xs text-muted-foreground'>
                                +{objStatisticsUsers?.newUsers || 0}% from last month
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Charts */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
                <Card className='col-span-4'>
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className='pl-2'>
                        <ResponsiveContainer width='100%' height={350}>
                            <LineChart data={revenueData}>
                                <XAxis
                                    dataKey='name'
                                    stroke='#888888'
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke='#888888'
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                                <Tooltip />
                                <Line
                                    type='monotone'
                                    dataKey='total'
                                    stroke='#8884d8'
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className='col-span-3'>
                    <CardHeader>
                        <CardTitle>Order Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width='100%' height={350}>
                            <BarChart data={orderStatusData}>
                                <XAxis
                                    dataKey='status'
                                    stroke='#888888'
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke='#888888'
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                                <Tooltip />
                                <Bar dataKey='count' fill='#8884d8' radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders or Additional Content can be added here */}
        </div>
    );
}

export default DashboardPage;
