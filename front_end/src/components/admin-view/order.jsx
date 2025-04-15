import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog } from '../ui/dialog';
import AdminOrderDetail from './order-detail';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders, getDetailOrder } from '@/store/admin/order-slice';
import { useToast } from '@/contexts/ToastContext';
import { formatDateCustom, mappingStatusOrder } from '@/lib/utils';
import classNames from 'classnames';
import { Badge } from '../ui/badge';
import FormUpdateOrder from './formUpdateOrder';

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

function AdminOrder() {
    const [openDetailOrder, setOpenDetailOrder] = useState(false);
    const [openUpdateOrder, setOpenUpdateOrder] = useState(false);
    const { orderList, isLoading, isLoadingGetDetail } = useSelector((state) => state.adminOrders);
    const [error, setError] = useState(null);
    const { toast } = useToast();
    const dispatch = useDispatch();
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });
    // Memoize handlers
    const handleOpenDetailOrder = useCallback(
        async (id) => {
            try {
                await dispatch(getDetailOrder(id)).unwrap();
                setOpenDetailOrder(true);
            } catch (error) {
                toast.error(error);
            }
        },
        [dispatch, toast]
    );

    const handleOpenUpdateDialog = useCallback(
        async (id) => {
            try {
                await dispatch(getDetailOrder(id)).unwrap();
                setOpenUpdateOrder(true);
            } catch (error) {
                toast.error(error);
            }
        },
        [dispatch, toast]
    );

    // Memoize statusOptions
    const statusOptions = useMemo(
        () => [
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'inProcess', label: 'In Process' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'inShipping', label: 'In Shipping' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'failedDelivery', label: 'Failed Delivery' }
        ],
        []
    );

    // Fetch orders only once on mount
    useEffect(() => {
        const fetchAllOrders = async () => {
            try {
                await dispatch(getAllOrders()).unwrap();
            } catch (error) {
                setError(error);
            }
        };
        fetchAllOrders();
    }, [dispatch]);

    // Memoize columns
    const columns = useMemo(
        () => [
            {
                accessorKey: '_id',
                header: ({ column }) => {
                    return (
                        <Button
                            variant='ghost'
                            onClick={() => column.toggleSorting()}
                            className='p-0 hover:bg-transparent'
                        >
                            Order ID
                            {column.getIsSorted() === 'asc' ? (
                                <ArrowUp className='ml-2 h-4 w-4' />
                            ) : column.getIsSorted() === 'desc' ? (
                                <ArrowDown className='ml-2 h-4 w-4' />
                            ) : (
                                <ArrowUpDown className='ml-2 h-4 w-4' />
                            )}
                        </Button>
                    );
                },
                cell: (info) => <span className='font-medium'>{info.getValue()}</span>
            },
            {
                accessorKey: 'orderDate',
                header: ({ column }) => {
                    return (
                        <Button
                            variant='ghost'
                            onClick={() => column.toggleSorting()}
                            className='p-0 hover:bg-transparent'
                        >
                            Order Date
                            {column.getIsSorted() === 'asc' ? (
                                <ArrowUp className='ml-2 h-4 w-4' />
                            ) : column.getIsSorted() === 'desc' ? (
                                <ArrowDown className='ml-2 h-4 w-4' />
                            ) : (
                                <ArrowUpDown className='ml-2 h-4 w-4' />
                            )}
                        </Button>
                    );
                },
                cell: (info) => formatDateCustom(info.getValue(), 'longDate')
            },
            {
                accessorKey: 'totalAmount',
                header: ({ column }) => {
                    return (
                        <Button
                            variant='ghost'
                            onClick={() => column.toggleSorting()}
                            className='p-0 hover:bg-transparent'
                        >
                            Total Amount
                            {column.getIsSorted() === 'asc' ? (
                                <ArrowUp className='ml-2 h-4 w-4' />
                            ) : column.getIsSorted() === 'desc' ? (
                                <ArrowDown className='ml-2 h-4 w-4' />
                            ) : (
                                <ArrowUpDown className='ml-2 h-4 w-4' />
                            )}
                        </Button>
                    );
                },
                cell: (info) => `${info.getValue()} VNĐ`
            },
            {
                accessorKey: 'orderStatus',
                header: ({ column }) => {
                    return (
                        <Button
                            variant='ghost'
                            onClick={() => column.toggleSorting()}
                            className='p-0 hover:bg-transparent'
                        >
                            Status
                            {column.getIsSorted() === 'asc' ? (
                                <ArrowUp className='ml-2 h-4 w-4' />
                            ) : column.getIsSorted() === 'desc' ? (
                                <ArrowDown className='ml-2 h-4 w-4' />
                            ) : (
                                <ArrowUpDown className='ml-2 h-4 w-4' />
                            )}
                        </Button>
                    );
                },
                cell: (info) => (
                    <Badge
                        className={classNames({
                            'bg-[#FACC15]': info.getValue() === 'pending',
                            'bg-[#3B82F6]': info.getValue() === 'inProcess',
                            'bg-[#8B5CF6]': info.getValue() === 'confirmed',
                            'bg-green-500': info.getValue() === 'delivered',
                            'bg-yellow-500': info.getValue() === 'inShipping',
                            'bg-red-500': ['rejected', 'cancelled', 'failedDelivery'].includes(
                                info.getValue()
                            )
                        })}
                    >
                        {mappingStatusOrder(info.getValue())}
                    </Badge>
                )
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className='space-x-2'>
                        <Button
                            className='bg-yellow-500 text-white'
                            onClick={() => handleOpenUpdateDialog(row.original._id)}
                            disabled={isLoadingGetDetail}
                        >
                            Update Status
                        </Button>
                        <Button className='bg-red-500 text-white'>Cancel</Button>
                        <Button
                            className='bg-green-500 text-white'
                            onClick={() => handleOpenDetailOrder(row.original._id)}
                            disabled={isLoadingGetDetail}
                        >
                            View detail
                        </Button>
                    </div>
                )
            }
        ],
        [handleOpenDetailOrder, handleOpenUpdateDialog, isLoadingGetDetail]
    );

    // Memoize table state
    const tableState = useMemo(
        () => ({
            sorting,
            globalFilter,
            columnFilters:
                statusFilter !== 'all' ? [{ id: 'orderStatus', value: statusFilter }] : []
        }),
        [sorting, globalFilter, statusFilter]
    );

    // Memoize table instance
    const table = useReactTable({
        data: orderList,
        columns,
        state: {
            ...tableState,
            pagination
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    });
    console.log(table.getState().pagination.pageIndex);
    const handleCloseUpdateDialog = useCallback(() => {
        setOpenUpdateOrder(false);
    }, []);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>All orders</CardTitle>
                    <div className='flex items-center gap-4 mt-4'>
                        <Input
                            placeholder='Search orders...'
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className='max-w-sm'
                        />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className='w-[180px]'>
                                <SelectValue placeholder='Filter by status' />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={table.getState().pagination.pageSize}
                            onValueChange={(value) => {
                                console.log(value);
                                table.setPageSize(Number(value));
                            }}
                        >
                            <SelectTrigger className='w-[180px]'>
                                <SelectValue placeholder={'Rows per page'} />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 20, 30].map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <h1>Loading...</h1>
                    ) : error ? (
                        <h1>{error}</h1>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id}>
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows.length > 0 ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className='text-center'
                                            >
                                                No orders found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <div className='flex items-center justify-between space-x-2 py-4'>
                                <div className='flex-1 text-sm text-muted-foreground'>
                                    {table.getFilteredRowModel().rows.length} order(s) total
                                </div>
                                <div className='space-x-2'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        Previous
                                    </Button>
                                    {table.getPageOptions().map((page, index) => (
                                        <Button
                                            key={index}
                                            variant={
                                                table.getState().pagination.pageIndex === page
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size='sm'
                                            onClick={() => table.setPageIndex(page)}
                                        >
                                            {page + 1}
                                        </Button>
                                    ))}
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
            <Dialog open={openDetailOrder} onOpenChange={setOpenDetailOrder}>
                <AdminOrderDetail />
            </Dialog>
            <Dialog open={openUpdateOrder} onOpenChange={setOpenUpdateOrder}>
                <FormUpdateOrder closeDialog={handleCloseUpdateDialog} />
            </Dialog>
        </>
    );
}

export default AdminOrder;
