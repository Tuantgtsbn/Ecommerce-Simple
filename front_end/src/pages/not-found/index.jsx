import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function NotFound() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const handleBackToHome = () => {
        if (user?.role === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/');
        }
    };
    return (
        <div className='container mx-auto gap-4 px-4 py-8 flex flex-col justify-center items-center h-[80vh]'>
            <h1 className='font-bold text-[40px]'>404</h1>
            <h2 className='font-semibold text-[30px]'>Page not found</h2>
            <Button onClick={handleBackToHome}>Back to home</Button>
        </div>
    );
}

export default NotFound;
