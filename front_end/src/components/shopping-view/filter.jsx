import { filterOptions } from '@/config';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

function ProductFilter({ handleFilterChange, filters }) {
    return (
        <div className='bg-background rounded-lg shadow-sm'>
            <div className='p-4 border-b h-[60px]'>
                <h2 className='text-lg font-semibold'>Filter</h2>
            </div>
            <div className='p-4 space-y-4'>
                {Object.keys(filterOptions).map((keyItem) => (
                    <div key={keyItem}>
                        <h3 className='text-base font-bold capitalize'>{keyItem}</h3>
                        <div className='mt-3'>
                            {filterOptions[keyItem].map((item) => (
                                <div className='flex items-center gap-2 mb-3' key={item.id}>
                                    <Checkbox
                                        checked={
                                            filters &&
                                            Object.keys(filters).length > 0 &&
                                            filters[keyItem] &&
                                            filters[keyItem].includes(item.id)
                                        }
                                        id={item.id}
                                        onCheckedChange={(e) =>
                                            handleFilterChange(e, keyItem, item.id)
                                        }
                                    />
                                    <Label
                                        htmlFor={item.id}
                                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                    >
                                        {item.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductFilter;
