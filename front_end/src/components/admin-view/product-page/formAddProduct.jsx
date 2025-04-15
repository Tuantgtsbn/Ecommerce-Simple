import { useState } from 'react';
import { addProductFormElements } from '@/config/index';
import CommonForm from '@/components/common/form';
import InputFile from '@/components/common/inputFile';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct, getAllProducts } from '@/store/admin/products-slice';
import { useToast } from '@/contexts/ToastContext';
const initialState = {
    name: '',
    description: '',
    title: '',
    thumbnail: null,
    images: [],
    price: 0,
    stock: 0,
    category: '',
    brand: ''
};
const thumbnailConfig = {
    name: 'thumbnail',
    label: 'Thumbnail',
    config: {
        accept: 'image/*',
        isMultiple: false
    }
};
const imagesConfig = {
    name: 'images',
    label: 'Illustration images',
    config: {
        accept: 'image/*',
        isMultiple: true,
        max: 5
    }
};
function FormAddProduct({ setOpenDialog }) {
    const [formData, setFormData] = useState(initialState);
    const { toast } = useToast();
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.adminProducts);
    const checkValid = Object.values(formData).every(
        (value) =>
            (typeof value === 'string' && value.trim() !== '') ||
            (typeof value === 'object' && value !== null) ||
            (typeof value === 'number' && value !== 0) ||
            (typeof value === 'object' && Array.isArray(value) && value.length > 0)
    );
    console.log('checkValid', checkValid);
    const onSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        const newFormData = new FormData();
        const { thumbnail, images, ...rest } = formData;
        newFormData.append('thumbnail', thumbnail);
        images.forEach((image) => {
            newFormData.append('images', image);
        });
        console.log(newFormData);
        for (const key in rest) {
            newFormData.append(key, formData[key]);
        }
        try {
            await dispatch(addProduct(newFormData)).unwrap();
            toast.success('Product added successfully');
            setFormData(initialState);

            setOpenDialog(false);
            dispatch(getAllProducts());
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };
    console.log(formData);

    return (
        <>
            <InputFile
                name={thumbnailConfig.name}
                label={thumbnailConfig.label}
                config={thumbnailConfig.config}
                setFormData={setFormData}
                files={formData.thumbnail}
            />

            <InputFile
                name={imagesConfig.name}
                label={imagesConfig.label}
                config={imagesConfig.config}
                setFormData={setFormData}
                files={formData.images}
            />
            <CommonForm
                formData={formData}
                setFormData={setFormData}
                formControls={addProductFormElements}
                buttonText='Add Product'
                onSubmit={onSubmit}
                isBtnDisabled={isLoading ? true : !checkValid}
                isLoading={isLoading}
            />
        </>
    );
}

export default FormAddProduct;
