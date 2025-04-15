import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const INITIAL_SORT = 'price-lowtohigh';
function useFilter() {
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get('category')?.split(',').filter(Boolean) || [];
    const brand = searchParams.get('brand')?.split(',').filter(Boolean) || [];
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const sortBy = searchParams.get('sortBy') || INITIAL_SORT;
    const setFilter = useCallback(
        (filter) => {
            console.log('new filter', filter);
            setSearchParams((params) => {
                console.log('params', params.toString());
                const newParams = new URLSearchParams(params);
                Object.entries(filter).forEach(([key, value]) => {
                    // Trường hợp: mảng rỗng, chuỗi rỗng, null, undefined => xóa
                    const isEmptyArray = Array.isArray(value) && value.length === 0;
                    const isEmptyValue = value === undefined || value === null || value === '';

                    if (isEmptyArray || isEmptyValue) {
                        newParams.delete(key);
                    } else {
                        const newValue = Array.isArray(value) ? value.join(',') : value;
                        newParams.set(key, newValue);
                    }
                });
                console.log('newParams', newParams.toString());

                return newParams;
            });
        },
        [setSearchParams]
    );
    return {
        category,
        brand,
        page,
        sortBy,
        setFilter
    };
}

export default useFilter;
