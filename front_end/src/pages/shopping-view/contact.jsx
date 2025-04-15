import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import CommonForm from '@/components/common/form';
import { ContactFormConfig } from '@/config';
import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import axiosClient from '@/apis/axiosClient';
function ContactPage() {
    const [formData, setFormData] = useState({});
    const { toast } = useToast();
    const handleSubmitContactForm = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/api/shop/contact', formData, {
                withCredentials: true
            });
            toast.success('Send message successfully');
            setFormData({});
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data.message || 'Something went wrong');
        }
    };
    return (
        <div className='container mx-auto px-4 py-8'>
            <h1 className='text-3xl font-bold mb-6'>Liên Hệ</h1>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div>
                    <h2 className='text-xl font-semibold mb-4'>Thông tin liên hệ</h2>
                    <div className='space-y-4'>
                        <p>
                            <strong>Address:</strong> 688 Đường Quang Trung, Phường La Khê, Quận Hà
                            Đông, Thành phố Hà Nội
                        </p>
                        <p>
                            <strong>Phone:</strong> +84243 - 7303.0222
                        </p>
                        <p>
                            <strong>Email:</strong> hello@canifa.com
                        </p>
                        <p>
                            <strong>Hours:</strong> 8:00 - 22:00 (Thứ 2 - Chủ nhật)
                        </p>
                    </div>
                </div>

                <div>
                    <h2 className='text-xl font-semibold mb-4'>Send us message</h2>
                    <CommonForm
                        formControls={ContactFormConfig}
                        buttonText='Send'
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleSubmitContactForm}
                    />
                </div>
            </div>
        </div>
    );
}

export default ContactPage;
