import { useState } from 'react';
import { LoginFormConfig } from '@/config';
import CommonForm from '@/components/common/form';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser } from '@/store/auth-slice';
import { useToast } from '@/contexts/ToastContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
function AuthLogin() {
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const { toast } = useToast();
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth);
    console.log('formData', formData);
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('formData submit', formData);
        try {
            await dispatch(loginUser(formData)).unwrap();

            toast.success('Login successful');
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };
    return (
        <div className=''>
            <h1 className='text-4xl font-bold text-center mb-4'>Login</h1>
            <CommonForm
                formControls={LoginFormConfig}
                formData={formData}
                setFormData={setFormData}
                buttonText='Login'
                onSubmit={handleSubmit}
                isBtnDisabled={isLoading}
                option='login'
                isLoading={isLoading}
            />
        </div>
    );
}

export default AuthLogin;
