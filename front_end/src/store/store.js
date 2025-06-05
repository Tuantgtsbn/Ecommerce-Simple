import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-slice';
import adminProductsReducer from './admin/products-slice/index.jsx';
import adminContactReducer from './admin/contact-slice/index.jsx';
import adminOrderReducer from './admin/order-slice/index.jsx';
import adminUserReducer from './admin/user-slice/index.jsx';
import shoppingProductsReducer from './shop/products-slice';
import shoppingCartReducer from './shop/cart-slice';
import shoppingAddressReducer from './shop/address-slice';
import shoppingOrderReducer from './shop/order-slice';
import shoppingReviewReducer from './shop/review-slice';
import shoppingCategoryReducer from './shop/category-slice';
const store = configureStore({
    reducer: {
        auth: authReducer,
        adminProducts: adminProductsReducer,
        adminContacts: adminContactReducer,
        adminOrders: adminOrderReducer,
        adminUsers: adminUserReducer,
        shoppingProducts: shoppingProductsReducer,
        shoppingCart: shoppingCartReducer,
        shoppingAddress: shoppingAddressReducer,
        shoppingOrder: shoppingOrderReducer,
        shoppingReview: shoppingReviewReducer,
        shoppingCategory: shoppingCategoryReducer
    }
});

export default store;
