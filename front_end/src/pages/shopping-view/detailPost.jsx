import axiosClient from '@/apis/axiosClient';
import Loading from '@/components/common/Loading/Loading';
import { formatDateCustom } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import '@/styles/blog-content.css';
import parse from 'html-react-parser';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';

import { CiSquareMinus, CiSquarePlus } from 'react-icons/ci';
function DetailPostPage() {
    const { slug } = useParams();
    const [detailPost, setDetailPost] = useState(null);
    const [loading, setIsLoading] = useState(false);
    const [tocItems, setTocItems] = useState([]);
    const [isOpenAccordion, setIsOpenAccordion] = useState(false);
    useEffect(() => {
        async function fetchDetailPost() {
            try {
                setIsLoading(true);
                const response = await axiosClient.get(`/api/shop/post/${slug}`);
                if (response.data.success) {
                    setDetailPost(response.data.data);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchDetailPost();
    }, [slug]);
    useEffect(() => {
        if (detailPost?.content) {
            // Tạm thời tạo một div ẩn để phân tích DOM
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = detailPost.content;

            const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6'); // Lấy tất cả các thẻ heading
            const extractedTocItems = [];
            headings.forEach((heading) => {
                let id = '';
                let text = '';

                // Lấy id từ thẻ span trước thẻ heading
                if (heading.previousElementSibling) {
                    id = heading.previousElementSibling.id;
                }

                // Hàm lấy text ưu tiên thẻ b, rồi đến span, rồi đến heading
                const getHeadingText = (el) => {
                    if (!el) return '';
                    // Nếu có thẻ b bên trong
                    const bold = el.querySelector('b');
                    if (bold) return bold.textContent.trim();
                    // Nếu có thẻ span bên trong
                    const span = el.querySelector('span');
                    if (span) return getHeadingText(span);
                    // Nếu chỉ có text
                    return el.textContent.trim();
                };

                text = getHeadingText(heading);

                extractedTocItems.push({
                    id: id,
                    text: text,
                    level: parseInt(heading.tagName.substring(1), 10)
                });
            });
            setTocItems(extractedTocItems);
        }
    }, [detailPost?.content]);
    console.log(tocItems, 'tocItems');
    const scrollToId = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };
    return (
        <div className='container mx-auto p-4 scroll-smooth'>
            <div className='flex gap-2 h-[60px] items-center'>
                <p className='text-muted-foreground cursor-pointer'>Trang chủ</p>
                <p className='text-muted-foreground'>|</p>
                <p className='text-muted-foreground cursor-pointer'>Blog</p>
                <p className='text-muted-foreground'>|</p>
                <p className='text-muted-foreground cursor-pointer'>
                    {detailPost?.categories[0]?.name}
                </p>
                <p className='text-muted-foreground'>|</p>
                <p className='cursor-pointer'>{detailPost?.title}</p>
            </div>
            <div className='w-full max-w-[900px] mx-auto'>
                <p className='text-[24px] font-bold my-[24px]'>{detailPost?.title}</p>
                <div className='flex justify-between items-center'>
                    <p>Ngày đăng: {formatDateCustom(detailPost?.published_at, 'shortDate')}</p>
                    <div className='flex gap-2'>
                        <div className='p-2 border border-gray-200 rounded-lg cursor-pointer'>
                            <a
                                href='https://www.facebook.com/'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                <FaFacebookF size={24} />
                            </a>
                        </div>
                        <div className='p-2 border border-gray-200 rounded-lg cursor-pointer'>
                            <a
                                href='https://www.youtube.com/'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                <FaYoutube size={24} />
                            </a>
                        </div>
                        <div className='p-2 border border-gray-200 rounded-lg cursor-pointer'>
                            <a
                                href='https://www.instagram.com/'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                <FaInstagram size={24} />
                            </a>
                        </div>
                    </div>
                </div>
                <div className='w-full max-w-[900px] mx-auto border rounded-lg mt-[24px]'>
                    <Accordion
                        type='single'
                        collapsible
                        onClick={() => setIsOpenAccordion(!isOpenAccordion)}
                    >
                        <AccordionItem value='item-1'>
                            <AccordionTrigger
                                className='px-[10px] font-bold'
                                icon={
                                    isOpenAccordion ? (
                                        <CiSquarePlus className='h-6 w-6' />
                                    ) : (
                                        <CiSquareMinus className='h-6 w-6' />
                                    )
                                }
                            >
                                MỤC LỤC
                            </AccordionTrigger>
                            <AccordionContent>
                                {/* Phần hiển thị TOC */}

                                {tocItems.length > 0 && (
                                    <nav className='table-of-contents'>
                                        <ul className='space-y-4'>
                                            {tocItems.map((item) => (
                                                <li
                                                    key={item.id}
                                                    style={{
                                                        marginLeft: `${(item.level - 1) * 15}px`
                                                    }}
                                                >
                                                    {/* Thụt lề theo level */}
                                                    <a
                                                        onClick={() => scrollToId(item.id)}
                                                        className='text-[20px] cursor-pointer'
                                                    >
                                                        {item.text}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
                <div className='w-full max-w-[900px] mx-auto'>
                    {!loading && detailPost?.content ? (
                        <div className='prose prose-lg max-w-none'>{parse(detailPost.content)}</div>
                    ) : (
                        <Loading className='h-[400px]' />
                    )}
                </div>
            </div>
        </div>
    );
}

export default DetailPostPage;
