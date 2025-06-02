import axiosClient from '@/apis/axiosClient';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import PostPreview from '@/components/shopping-view/postPreview';
import useWindowSize from '@/hooks/useWindowSize';
import { IoSearchOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { removeVietnameseTones } from '@/lib/utils';
function HomeBlogPage() {
    const navigate = useNavigate();
    const [listCategories, setListCategories] = useState([]);
    const [listFeaturedPosts, setListFeaturedPosts] = useState([]);
    const [listMostViewPosts, setListMostViewPosts] = useState([]);
    const [listNewestPosts, setListNewestPosts] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const { width } = useWindowSize();
    const isMobile = width < 1024;
    console.log(listFeaturedPosts, 'listFeaturedPosts');
    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await axiosClient.get('/api/shop/blogcategory');
                setListCategories(response.data.data);
            } catch (error) {
                console.log(error.message);
            }
        }
        async function fetchFeaturedPosts() {
            try {
                const response = await axiosClient.post('/api/shop/post', {
                    limit: 5,
                    sortBy: 'most-like'
                });
                setListFeaturedPosts(response.data.data);
            } catch (error) {
                console.log(error.message);
            }
        }
        async function fetchMostViewPosts() {
            try {
                const response = await axiosClient.post('/api/shop/post', {
                    limit: 5,
                    sortBy: 'most-view'
                });
                setListMostViewPosts(response.data.data);
            } catch (error) {
                console.log(error.message);
            }
        }
        async function fetchNewestPosts() {
            try {
                const response = await axiosClient.post('/api/shop/post', {
                    limit: 5,
                    sortBy: 'created_at'
                });
                setListNewestPosts(response.data.data);
            } catch (error) {
                console.log(error.message);
            }
        }

        fetchCategories();
        fetchFeaturedPosts();
        fetchMostViewPosts();
        fetchNewestPosts();
    }, []);
    const handleSearchBlog = (event) => {
        event.preventDefault();
        const searchParams = new URLSearchParams({
            s: searchValue
        });
        navigate(`/blog/search?${searchParams.toString()}`);
    };
    return (
        <>
            <div className='bg-[#EDF1F5] px-[28px] h-[340px] flex flex-col py-[20px]'>
                {/* Breadcumbs */}
                <div className='flex flex-row gap-2 h-[116px] container mx-auto'>
                    <p>Trang chủ</p>
                    <p>|</p>
                    <p>Blog</p>
                </div>
                <div className='container mx-auto'>
                    <p className='text-[44px] uppercase font-bold mb-[12px]'>Ecommerce Blog</p>
                    <p className='text-[16px] font-semibold'>
                        Cung cấp những kiến thức, kinh nghiệm hữu ích về thời trang nam, nữ, bé trai
                        và bé gái
                    </p>
                </div>
            </div>
            <div className='container mx-auto py-[36px] flex flex-row justify-between'>
                <Select
                    onValueChange={(value) => {
                        navigate(`/blog/category/${value}`);
                    }}
                >
                    <SelectTrigger className='w-[180px] h-[50px]'>
                        <SelectValue placeholder='Danh mục' />
                    </SelectTrigger>
                    <SelectContent>
                        {listCategories.map((category) => (
                            <SelectItem key={category._id} value={category.slug}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <form onSubmit={handleSearchBlog}>
                    <div className='flex'>
                        <Input
                            onChange={(e) => setSearchValue(e.target.value)}
                            type='text'
                            placeholder='Tìm kiếm'
                            className='w-[300px] h-[50px]'
                        />
                        <button className='border border-l-0 rounded-l-none rounded-md px-2 justify-between items-center'>
                            <IoSearchOutline className='w-5 h-5' />
                        </button>
                    </div>
                </form>
            </div>
            <div className='container mx-auto'>
                {/* List post */}
                <p className='font-bold text-[32px] mb-[24px]'>Bài viết nổi bật</p>
                {listFeaturedPosts.length > 0 ? (
                    <div className='grid lg:grid-cols-2 gap-[36px] '>
                        <div className=''>
                            <PostPreview variant='vertical' data={listFeaturedPosts[0]} />
                        </div>
                        <div className='grid grid-cols-2 lg:grid-cols-1 justify-between gap-[16px]'>
                            {listFeaturedPosts.slice(1).map((post) => (
                                <PostPreview
                                    key={post._id}
                                    data={post}
                                    variant={isMobile ? 'vertical' : 'horizontal'}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    ''
                )}
            </div>
            <div className='container mx-auto mt-[50px] lg:mt-[80px]'>
                {/* List post */}
                <p className='font-bold text-[32px] mb-[24px]'>Bài viết xem nhiều nhất</p>
                {listMostViewPosts.length > 0 ? (
                    <div className='grid lg:grid-cols-2 gap-[36px] '>
                        <div className=''>
                            <PostPreview variant='vertical' data={listMostViewPosts[0]} />
                        </div>
                        <div className='grid grid-cols-2 lg:grid-cols-1 justify-between gap-[16px]'>
                            {listMostViewPosts.slice(1).map((post) => (
                                <PostPreview
                                    key={post._id}
                                    data={post}
                                    variant={isMobile ? 'vertical' : 'horizontal'}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    ''
                )}
            </div>
            <div className='container mx-auto my-[50px] lg:mt-[80px]'>
                {/* List post */}
                <div className='flex justify-between'>
                    <p className='font-bold text-[32px] mb-[24px]'>Bài viết mới nhất</p>
                    {!isMobile && <p className='text-[24px] text-red-500'>Xem thêm &gt;</p>}
                </div>
                {listNewestPosts.length > 0 ? (
                    <div className='grid lg:grid-cols-2 gap-[36px] '>
                        <div className=''>
                            <PostPreview variant='vertical' data={listNewestPosts[0]} />
                        </div>
                        <div className='grid grid-cols-2 lg:grid-cols-1 justify-between gap-[16px]'>
                            {listNewestPosts.slice(1).map((post) => (
                                <PostPreview
                                    key={post._id}
                                    data={post}
                                    variant={isMobile ? 'vertical' : 'horizontal'}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    ''
                )}
                {isMobile && (
                    <div className='p-[12px] w-full border boder-1 border-red-500 hover:cursor-pointer my-[48px]'>
                        <p className='text-center text-[24px] font-bold text-red-500'>
                            Xem thêm &gt;
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

export default HomeBlogPage;
