import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Components
import ProductFilter from '@/components/shopping-view/filter';
import ShoppingProductCard from '@/components/shopping-view/productCard';
import ProductDetailDialog from '@/components/shopping-view/productDetail';
import Pagination from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';

// Icons and Config
import { ArrowUpDownIcon } from 'lucide-react';
import { sortOptions } from '@/config';

// Actions and Utilities
import { fetchDetailProduct, fetchFilteredProducts } from '@/store/shop/products-slice';
import { createSearchParamsHelper } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { useSearchFilter } from '@/hooks/useSearchFilter';
import useFilter from '@/hooks/useFilter';

function ListingPage() {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const { productList } = useSelector((state) => state.shoppingProducts);
    // const prevFiltersRef = useRef(null);
    // Sử dụng hook đã được sửa đổi
    // console.log('Rendering ListingPage');
    // const { category, brand, page, sortBy, updateFilters } = useSearchFilter();
    const [pagination, setPagination] = useState(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { category, brand, page, sortBy, setFilter } = useFilter();
    const categoryToString = category.length > 0 ? category.join(',') : '';
    const brandToString = brand.length > 0 ? brand.join(',') : '';
    // Fetch products khi filters thay đổi
    // useEffect(() => {
    //     const currentFilters = JSON.stringify({ category, brand, page, sortBy });

    //     // Nếu filters không thay đổi, không gọi API
    //     if (prevFiltersRef.current === currentFilters) {
    //         return;
    //     }
    //     async function fetchProduct() {
    //         setIsLoading(true);
    //         try {
    //             const filterParams = {
    //                 category,
    //                 brand,
    //                 page,
    //                 sortBy
    //             };
    //             const searchParams = createSearchParamsHelper(filterParams);
    //             const response = await dispatch(fetchFilteredProducts(searchParams)).unwrap();
    //             setPagination({
    //                 page: response.currentPage,
    //                 totalPage: response.totalPages
    //             });
    //         } catch (error) {
    //             console.log(error);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     }

    //     fetchProduct();
    //     prevFiltersRef.current = currentFilters;
    // }, [dispatch, category, brand, page, sortBy]);
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const filterParams = {
                    category,
                    brand,
                    page,
                    sortBy
                };
                const searchParams = createSearchParamsHelper(filterParams);
                const response = await dispatch(fetchFilteredProducts(searchParams)).unwrap();
                setPagination({
                    page: response.currentPage,
                    totalPage: response.totalPages
                });
            } catch (error) {
                console.log(error);
            }
        };
        fetchProduct();
    }, [page, sortBy, categoryToString, brandToString, dispatch]);

    const handleFilterChange = (e, key, value) => {
        if (e) {
            setFilter({
                [key]: key === 'category' ? [...category, value] : [...brand, value],
                page: 1 // Reset page when filter changes
            });
        } else {
            setFilter({
                [key]:
                    key === 'category'
                        ? category.filter((item) => item !== value)
                        : brand.filter((item) => item !== value),
                page: 1
            });
        }
    };

    const handleSortChange = (value) => {
        setFilter({ sortBy: value, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setFilter({ page: Number(newPage) });
    };

    const handleGetDetailProduct = async (id) => {
        try {
            await dispatch(fetchDetailProduct(id)).unwrap();
            setIsDetailDialogOpen(true);
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    return (
        <div className='grid grid-cols-1 md:grid-cols-[300px,1fr] gap-6 p-4 md:p-6'>
            {/* Sử dụng category và brand trực tiếp thay vì filters */}
            <ProductFilter
                filters={{ category, brand, page, sortBy }}
                handleFilterChange={handleFilterChange}
            />

            {/* Main content area */}
            <div className='bg-background w-full rounded-lg shadow-sm'>
                {/* Header with product count and sort options */}
                <div className='p-4 border-b flex items-center justify-between h-[60px]'>
                    <h2 className='text-lg font-extrabold'>All products</h2>
                    <div className='flex gap-2 items-center'>
                        <p className='text-muted-foreground'>{productList.length} products</p>

                        {/* Sort dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='outline' size='sm'>
                                    <ArrowUpDownIcon />
                                    Sort by
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuRadioGroup
                                    value={sortBy}
                                    onValueChange={handleSortChange}
                                >
                                    {sortOptions.map((option) => (
                                        <DropdownMenuRadioItem key={option.id} value={option.id}>
                                            {option.label}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Product list section */}
                <div>
                    {productList.length > 0 ? (
                        <>
                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-4'>
                                {productList.map((product) => (
                                    <ShoppingProductCard
                                        key={product.id}
                                        product={product}
                                        handleClickDetail={handleGetDetailProduct}
                                    />
                                ))}
                            </div>
                            <Pagination pagination={pagination} onPageChange={handlePageChange} />
                        </>
                    ) : (
                        <div className='flex justify-center items-center p-8'>
                            <p className='text-muted-foreground'>No products found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Product detail dialog */}
            <ProductDetailDialog open={isDetailDialogOpen} setOpen={setIsDetailDialogOpen} />
        </div>
    );
}

export default ListingPage;
