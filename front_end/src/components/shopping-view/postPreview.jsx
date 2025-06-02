import { formatDateCustom } from '@/lib/utils';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
function PostPreview({ data, variant = 'horizontal', className = '' }) {
    const navigate = useNavigate();
    const variantStyles = {
        horizontal: 'flex-row',
        vertical: 'flex-col'
    };
    console.log(data);
    const handleWatchDetail = () => {
        navigate(`/blog/${data.slug}`);
    };
    return (
        <div
            className={classNames('flex gap-5', variantStyles[variant], className)}
            onClick={handleWatchDetail}
        >
            <div
                className={classNames('hover:cursor-pointer', {
                    'w-[30%]': variant === 'horizontal',
                    'w-[100%]': variant === 'vertical'
                })}
            >
                <img
                    src={data.featured_image.url}
                    alt={data.featured_image.alt_text}
                    className='w-[100%] object-cover'
                />
            </div>
            <div
                className={classNames('flex-1 flex-col', {
                    flex: variant === 'horizontal',
                    'space-y-2': variant === 'vertical'
                })}
            >
                <p className='text-red-500 font-semibold '>
                    {data.categories[0]?.name || 'Unknown'}
                </p>
                <p className='font-bold text-[20px] line-clamp-2'>{data.title}</p>
                <p className='line-clamp-2'>{data.excerpt}</p>
                <p className='text-muted-foreground'>
                    {formatDateCustom(data.published_at, 'shortDate')}
                </p>
            </div>
        </div>
    );
}

export default PostPreview;
