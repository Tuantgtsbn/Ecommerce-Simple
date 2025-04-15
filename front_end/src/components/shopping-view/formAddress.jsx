import { AddressFormConfig } from '@/config';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import CommonForm from '../common/form';
import { useDispatch, useSelector } from 'react-redux';
import {
    addAddress,
    editAddress,
    fetchListAddress,
    setAddressEdited
} from '@/store/shop/address-slice';
import { useToast } from '@/contexts/ToastContext';

const initialFormData = {
    address: '',
    street: '',
    ward: '',
    district: '',
    city: '',
    country: '',
    phone: '',
    notes: ''
};
function FormAddress() {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState(initialFormData);
    const { user } = useSelector((state) => state.auth);
    const { toast } = useToast();
    const { isLoading, listAddress, idAddressEdited } = useSelector(
        (state) => state.shoppingAddress
    );
    const handleSubmitForm = async (e) => {
        e.preventDefault();
        if (!idAddressEdited) {
            try {
                await dispatch(addAddress({ ...formData, userId: user.id })).unwrap();
                toast.success('Add address successfully');
                await dispatch(fetchListAddress(user.id)).unwrap();
                setFormData(initialFormData);
            } catch (error) {
                toast.error(error);
            }
        } else {
            try {
                await dispatch(editAddress({ addressId: idAddressEdited, formData })).unwrap();
                toast.success('Edit address successfully');
                await dispatch(fetchListAddress(user.id)).unwrap();
                setFormData(initialFormData);
                dispatch(setAddressEdited(null));
            } catch (error) {
                toast.error(error);
            }
        }
    };
    useEffect(() => {
        if (idAddressEdited) {
            const addressEdited = listAddress.find((address) => address._id === idAddressEdited);
            console.log(addressEdited);
            if (addressEdited) {
                setFormData({
                    address: addressEdited.address,
                    street: addressEdited.street,
                    ward: addressEdited.ward,
                    district: addressEdited.district,
                    city: addressEdited.city,
                    country: addressEdited.country,
                    phone: addressEdited.phone,
                    notes: addressEdited.notes
                });
            } else {
                setFormData(initialFormData);
            }
        } else {
            setFormData(initialFormData);
        }
    }, [idAddressEdited]);
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {idAddressEdited ? 'Form edit address' : 'Form add address'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CommonForm
                        formControls={AddressFormConfig}
                        buttonText={idAddressEdited ? 'Save' : 'Add'}
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleSubmitForm}
                        isBtnDisabled={isLoading}
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

export default FormAddress;
