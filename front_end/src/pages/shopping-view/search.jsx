import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Clock, X } from 'lucide-react';
import ShoppingProductCard from '@/components/shopping-view/productCard';
import ProductDetailDialog from '@/components/shopping-view/productDetail';
import { useToast } from '@/contexts/ToastContext';
import { useDispatch } from 'react-redux';
import { fetchDetailProduct } from '@/store/shop/products-slice';
import axiosClient from '@/apis/axiosClient';
import Loading from '@/components/common/Loading/Loading';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 5;

function ShoppingSearch() {
    console.log('re-render');
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q');
    console.log(query, 'query');
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [searchHistory, setSearchHistory] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);

    const dispatch = useDispatch();
    const { toast } = useToast();

    // Load search history from localStorage
    useEffect(() => {
        const history = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
        setSearchHistory(history);
    }, []);
    // useEffect(() => {
    //     const query = searchParams.get('q');
    //     if (query) {
    //         handleSearch(query);
    //     }
    // }, []);

    useEffect(() => {
        async function fetchSearchResults(term) {
            try {
                if (!term) {
                    setSearchResults([]);
                    return;
                }
                const response = await axiosClient.get(`/api/shop/search?keyword=${term}`, {
                    withCredentials: true
                });
                // console.log('Response:', response);
                if (response.data.success) {
                    setSearchResults(response.data.data);

                    // Update search history
                    const newHistory = [
                        term.split('+').join(' '),
                        ...searchHistory.filter((item) => item !== term)
                    ].slice(0, MAX_HISTORY_ITEMS);
                    setSearchHistory(newHistory);
                    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
                } else {
                    toast.error('Search failed');
                }
            } catch (error) {
                console.error(error);
                toast.error('An error occurred while searching');
            } finally {
                setIsLoading(false);
                setShowHistory(false);
            }
        }
        fetchSearchResults(searchParams.get('q'));
    }, [searchParams]);
    // Handle search
    const handleSearch = async (term) => {
        if (!term.trim()) return;
        setSearchParams({ q: term });
    };

    const handleClickDetail = async (productId) => {
        try {
            await dispatch(fetchDetailProduct(productId)).unwrap();
            setOpenDetailDialog(true);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const removeHistoryItem = (e, term) => {
        e.stopPropagation();
        const newHistory = searchHistory.filter((item) => item !== term);
        setSearchHistory(newHistory);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    };

    return (
        <div className='container mx-auto px-4 py-8'>
            {/* Search Input Section */}
            <div className='relative mb-8'>
                <div className='flex gap-2'>
                    <Input
                        type='text'
                        placeholder='Search products...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setShowHistory(true)}
                        // onBlur={() => setShowHistory(false)}
                        className='text-lg'
                        onBlur={() => {
                            setTimeout(() => {
                                setShowHistory(false);
                            }, 200);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(searchTerm);
                            }
                        }}
                    />
                    <Button onClick={() => handleSearch(searchTerm)} disabled={isLoading}>
                        <SearchIcon className='w-5 h-5 mr-2' />
                        Search
                    </Button>
                </div>

                {/* Search History Dropdown */}
                {showHistory && searchHistory.length > 0 && (
                    <div className='absolute w-full bg-white mt-1 rounded-md shadow-lg border z-50'>
                        {searchHistory.map((term, index) => (
                            <div
                                key={index}
                                className='flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer'
                                onClick={() => {
                                    setSearchTerm(term);
                                    handleSearch(term);
                                }}
                            >
                                <div className='flex items-center'>
                                    <Clock className='w-4 h-4 mr-2 text-gray-500' />
                                    <span>{term}</span>
                                </div>
                                <X
                                    className='w-4 h-4 text-gray-500 hover:text-red-500'
                                    onClick={(e) => removeHistoryItem(e, term)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Search Results */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {isLoading ? (
                    <div className='col-span-full text-center'>
                        <Loading className='h-screen' />
                    </div>
                ) : searchResults.length > 0 ? (
                    <>
                        {searchResults.map((product) => (
                            <ShoppingProductCard
                                key={product._id}
                                product={product}
                                handleClickDetail={handleClickDetail}
                            />
                        ))}
                        <ProductDetailDialog
                            open={openDetailDialog}
                            setOpen={setOpenDetailDialog}
                        />
                    </>
                ) : searchParams.get('q') ? (
                    <div className='col-span-full text-center text-gray-500'>
                        No products found for "{searchParams.get('q')}"
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default ShoppingSearch;
