import { MdOutlineDashboard } from 'react-icons/md';
import { IoShirtOutline } from 'react-icons/io5';
import { FiPhoneCall, FiShoppingCart } from 'react-icons/fi';
export const LoginFormConfig = [
    {
        componentType: 'input',
        name: 'email',
        type: 'email',
        required: true,
        placeholder: 'Please enter your email',
        label: 'Email'
    },
    {
        componentType: 'input',
        name: 'password',
        type: 'password',
        required: true,
        placeholder: '',
        label: 'Password'
    }
];
export const ContactFormConfig = [
    {
        componentType: 'input',
        name: 'username',
        type: 'text',
        required: true,
        placeholder: 'Please enter your username',
        label: 'Full name'
    },
    {
        componentType: 'input',
        name: 'email',
        type: 'email',
        required: true,
        placeholder: 'Please enter your email',
        label: 'Email'
    },
    {
        componentType: 'input',
        name: 'phone',
        type: 'number',
        required: true,
        placeholder: 'Please enter your phone number',
        label: 'Phone'
    },
    {
        componentType: 'textarea',
        name: 'message',
        placeholder: 'Please enter your message',
        label: 'Message',
        required: true
    }
];
export const RegisterFormConfig = [
    {
        componentType: 'input',
        name: 'userName',
        type: 'text',
        required: true,
        placeholder: 'Please enter your username',
        label: 'Username'
    },
    {
        componentType: 'input',
        name: 'email',
        type: 'email',
        required: true,
        placeholder: 'Please enter your email',
        label: 'Email'
    },
    {
        componentType: 'input',
        name: 'password',
        type: 'password',
        required: true,
        placeholder: '',
        label: 'Password'
    }
];

export const adminSidebarMenuItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: MdOutlineDashboard,
        path: '/admin/dashboard'
    },
    {
        id: 'products',
        label: 'Products',
        icon: IoShirtOutline,
        path: '/admin/products'
    },
    {
        id: 'orders',
        label: 'Orders',
        icon: FiShoppingCart,
        path: '/admin/orders'
    },
    {
        id: 'contact',
        label: 'Contact',
        icon: FiPhoneCall,
        path: '/admin/contact'
    }
];
export const updateOrderFormElements = (defaultStatus) => [
    {
        label: 'Status',
        name: 'status',
        componentType: 'select',
        options: [
            { id: 'pending', label: 'Pending' },
            { id: 'inProcess', label: 'In process' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'inShipping', label: 'In shipping' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'cancelled', label: 'Cancelled' },
            { id: 'failedDelivery', label: 'Failed delivery' }
        ],
        default: defaultStatus
    }
];
export const updateContactFormElements = (defaultStatus) => [
    {
        label: 'status',
        name: 'status',
        componentType: 'select',
        options: [
            { id: '1', label: 'Read' },
            { id: '0', label: 'Unread' }
        ],
        default: defaultStatus
    }
];
export const addProductFormElements = [
    {
        label: 'Name',
        name: 'name',
        componentType: 'input',
        type: 'text',
        placeholder: 'Enter product name'
    },
    {
        label: 'Title',
        name: 'title',
        componentType: 'input',
        type: 'text',
        placeholder: 'Enter product title'
    },
    {
        label: 'Description',
        name: 'description',
        componentType: 'textarea',
        placeholder: 'Enter product description'
    },
    {
        label: 'Category',
        name: 'category',
        componentType: 'select',
        options: [
            { id: 'men', label: 'Men' },
            { id: 'women', label: 'Women' },
            { id: 'kids', label: 'Kids' },
            { id: 'accessories', label: 'Accessories' },
            { id: 'footwear', label: 'Footwear' }
        ]
    },
    {
        label: 'Brand',
        name: 'brand',
        componentType: 'select',
        options: [
            { id: 'nike', label: 'Nike' },
            { id: 'adidas', label: 'Adidas' },
            { id: 'puma', label: 'Puma' },
            { id: 'levi', label: "Levi's" },
            { id: 'zara', label: 'Zara' },
            { id: 'h&m', label: 'H&M' }
        ]
    },
    {
        label: 'Price',
        name: 'price',
        componentType: 'input',
        type: 'number',
        placeholder: 'Enter product price'
    },
    {
        label: 'Discount',
        name: 'discount',
        componentType: 'input',
        type: 'number',
        placeholder: 'Enter product discount'
    },
    {
        label: 'Total Stock',
        name: 'stock',
        componentType: 'input',
        type: 'number',
        placeholder: 'Enter total stock'
    }
];
export const editProductFormElements = (defaultBrand, defaultCategory) => [
    {
        label: 'Name',
        name: 'name',
        componentType: 'input',
        type: 'text',
        placeholder: 'Enter product name'
    },
    {
        label: 'Title',
        name: 'title',
        componentType: 'input',
        type: 'text',
        placeholder: 'Enter product title'
    },
    {
        label: 'Description',
        name: 'description',
        componentType: 'textarea',
        placeholder: 'Enter product description'
    },
    {
        label: 'Category',
        name: 'category',
        componentType: 'select',
        options: [
            { id: 'men', label: 'Men' },
            { id: 'women', label: 'Women' },
            { id: 'kids', label: 'Kids' },
            { id: 'accessories', label: 'Accessories' },
            { id: 'footwear', label: 'Footwear' }
        ],
        default: defaultCategory
    },
    {
        label: 'Brand',
        name: 'brand',
        componentType: 'select',
        options: [
            { id: 'nike', label: 'Nike' },
            { id: 'adidas', label: 'Adidas' },
            { id: 'puma', label: 'Puma' },
            { id: 'levi', label: "Levi's" },
            { id: 'zara', label: 'Zara' },
            { id: 'h&m', label: 'H&M' }
        ],
        default: defaultBrand
    },
    {
        label: 'Price',
        name: 'price',
        componentType: 'input',
        type: 'number',
        placeholder: 'Enter product price'
    },
    {
        label: 'Discount',
        name: 'discount',
        componentType: 'input',
        type: 'number',
        placeholder: 'Enter product discount'
    },
    {
        label: 'Total Stock',
        name: 'stock',
        componentType: 'input',
        type: 'number',
        placeholder: 'Enter total stock'
    }
];

export const shoppingViewHeaderMenuItems = [
    {
        id: 'home',
        label: 'Home',
        path: '/'
    },
    {
        id: 'men',
        label: 'Men',
        path: '/listing?category=men'
    },
    {
        id: 'women',
        label: 'Women',
        path: '/listing?category=women'
    },

    {
        id: 'accessories',
        label: 'Accessories',
        path: '/listing?category=accessories'
    },

    {
        id: 'search',
        label: 'Search',
        path: '/search'
    }
];
export const filterOptions = {
    category: [
        { id: 'men', label: 'Men' },
        { id: 'women', label: 'Women' },
        { id: 'kids', label: 'Kids' },
        { id: 'accessories', label: 'Accessories' },
        { id: 'footwear', label: 'Footwear' }
    ],
    brand: [
        { id: 'nike', label: 'Nike' },
        { id: 'adidas', label: 'Adidas' },
        { id: 'puma', label: 'Puma' },
        { id: 'levi', label: "Levi's" },
        { id: 'zara', label: 'Zara' },
        { id: 'h&m', label: 'H&M' }
    ]
};
export const categoryValueMap = {
    men: 'Men',
    women: 'Women',
    kids: 'Kids',
    accessories: 'Accessories',
    footwear: 'Footwear'
};
export const brandValueMap = {
    nike: 'Nike',
    adidas: 'Adidas',
    puma: 'Puma',
    levi: "Levi's",
    zara: 'Zara',
    'h&m': 'H&M'
};
export const sortOptions = [
    { id: 'price-lowtohigh', label: 'Price: Low to High' },
    { id: 'price-hightolow', label: 'Price: High to Low' },
    { id: 'title-atoz', label: 'Title: A to Z' },
    { id: 'title-ztoa', label: 'Title: Z to A' }
];

export const AddressFormConfig = [
    {
        componentType: 'input',
        name: 'address',
        type: 'text',
        required: true,
        placeholder: 'Please enter your detail address',
        label: 'Detail address'
    },
    {
        componentType: 'input',
        name: 'street',
        type: 'text',
        placeholder: 'Please enter your street',
        label: 'Street'
    },
    {
        componentType: 'input',
        name: 'ward',
        type: 'text',
        required: true,
        placeholder: 'Please enter your disward',
        label: 'Ward'
    },
    {
        componentType: 'input',
        name: 'district',
        type: 'text',
        required: true,
        placeholder: 'Please enter your district',
        label: 'District'
    },
    {
        componentType: 'input',
        name: 'city',
        type: 'text',
        required: true,
        placeholder: 'Please enter your city',
        label: 'City'
    },
    {
        componentType: 'input',
        name: 'country',
        type: 'text',
        required: true,
        placeholder: 'Please enter your country',
        label: 'Country'
    },
    {
        componentType: 'input',
        name: 'phone',
        type: 'number',
        required: true,
        placeholder: 'Please enter your phone number',
        label: 'Phone'
    },
    {
        componentType: 'textarea',
        name: 'notes',
        placeholder: 'Please enter your notes',
        label: 'Notes (optional)'
    }
];

export const ProfileFormConfig = (defaultGender) => {
    return [
        {
            componentType: 'input',
            name: 'userName',
            type: 'text',
            required: true,
            placeholder: 'Enter your username',
            label: 'Username'
        },
        {
            componentType: 'input',
            name: 'email',
            type: 'email',
            required: true,
            placeholder: 'Enter your email',
            label: 'Email'
        },
        {
            componentType: 'input',
            name: 'birthday',
            type: 'date',
            required: true,
            placeholder: 'Enter your birthday',
            label: 'Birthday'
        },
        {
            label: 'Gender',
            name: 'gender',
            componentType: 'select',
            options: [
                { id: 'male', label: 'Male' },
                { id: 'female', label: 'Female' },
                { id: 'other', label: 'Other' }
            ],
            default: defaultGender
        }
    ];
};

export const ChangePasswordFormConfig = [
    {
        componentType: 'input',
        name: 'currentPassword',
        type: 'password',
        required: true,
        placeholder: 'Enter current password',
        label: 'Current Password'
    },
    {
        componentType: 'input',
        name: 'newPassword',
        type: 'password',
        required: true,
        placeholder: 'Enter new password',
        label: 'New Password'
    },
    {
        componentType: 'input',
        name: 'confirmPassword',
        type: 'password',
        required: true,
        placeholder: 'Confirm new password',
        label: 'Confirm Password'
    }
];
