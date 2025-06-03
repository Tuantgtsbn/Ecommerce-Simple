import './App.css';
import { Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loading from '@components/common/Loading/Loading';
import { useSelector, useDispatch } from 'react-redux';
import ShoppingLayout from '@components/shopping-view/layout';
import CheckAuth from '@components/common/checkAuth';
import { lazy } from 'react';
import { checkAuth as checkAuthentication } from './store/auth-slice';
import AdminLayout from '@components/admin-view/layout';
import AuthLayout from '@components/auth-view/layout';
import AdminProducts from './pages/admin-view/products';
import AdminOrders from './pages/admin-view/order';
import ShoppingSearch from './pages/shopping-view/search';
import OrderSuccessPage from './pages/shopping-view/order-success';
import DetailProduct from './pages/shopping-view/detail-product';

const AccountShoppingPage = lazy(() => import('./pages/shopping-view/account'));
const ShoppingHome = lazy(() => import('@/pages/shopping-view/home'));
const ShoppingListing = lazy(() => import('@/pages/shopping-view/listing'));
const AdminDashboard = lazy(() => import('@/pages/admin-view/dashboard'));
const AdminContact = lazy(() => import('@/pages/admin-view/contact'));
const AuthLogin = lazy(() => import('@/pages/auth/login'));
const AuthRegister = lazy(() => import('@/pages/auth/register'));
const PageNotFound = lazy(() => import('@/pages/not-found'));
const CheckoutShoppingPage = lazy(() => import('@/pages/shopping-view/checkout'));
const PayPalReturnPage = lazy(() => import('@/pages/shopping-view/paypal-return'));
const PayPalCancelPage = lazy(() => import('@/pages/shopping-view/paypal-cancel'));
const ContactPage = lazy(() => import('@/pages/shopping-view/contact'));
const AboutlPage = lazy(() => import('@/pages/shopping-view/about'));
const HomeBlogPage = lazy(() => import('@/pages/shopping-view/homeblog'));
const DetailPostPage = lazy(() => import('@/pages/shopping-view/detailPost'));
const SearchBlogPage = lazy(() => import('@/pages/shopping-view/searchblog'));
const PostByCategoryPage = lazy(() => import('@/pages/shopping-view/postByCategory'));
function App() {
    const { user, isLoading, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    useEffect(() => {
        async function checkAuthPeople() {
            try {
                const response = await dispatch(checkAuthentication()).unwrap();
                console.log(response);
                // const a = await dispatch(getProfile(response.user.id)).unwrap();
                // console.log(a);
            } catch (error) {
                console.log(error);
            }
        }
        checkAuthPeople();
    }, [dispatch]);
    if (isLoading) return <Loading className='h-screen' />;
    return (
        <>
            <Routes>
                <Route
                    path='/'
                    element={
                        <CheckAuth
                            isLoading={isLoading}
                            user={user}
                            isAuthenticated={isAuthenticated}
                        >
                            <ShoppingLayout />
                        </CheckAuth>
                    }
                >
                    <Route index element={<ShoppingHome />} />
                    <Route path='listing' element={<ShoppingListing />} />
                    <Route path='account' element={<AccountShoppingPage />} />
                    <Route path='checkout' element={<CheckoutShoppingPage />} />
                    <Route path='checkout/success' element={<OrderSuccessPage />} />
                    <Route path='shop/paypal-return' element={<PayPalReturnPage />} />
                    <Route path='shop/paypal-cancel' element={<PayPalCancelPage />} />
                    <Route path='search' element={<ShoppingSearch />} />
                    <Route path='about' element={<AboutlPage />} />
                    <Route path='contact' element={<ContactPage />} />
                    <Route path='product/:id' element={<DetailProduct />} />
                    <Route path='*' element={<PageNotFound />} />
                    <Route path='blog' element={<HomeBlogPage />} />
                    <Route path='blog' element={<HomeBlogPage />} />
                    <Route path='blog/:slug' element={<DetailPostPage />} />
                    <Route path='blog/search' element={<SearchBlogPage />} />
                    <Route path='blog/category/:name' element={<PostByCategoryPage />} />
                </Route>
                <Route
                    path='/admin'
                    element={
                        <CheckAuth
                            isLoading={isLoading}
                            user={user}
                            isAuthenticated={isAuthenticated}
                        >
                            <AdminLayout />
                        </CheckAuth>
                    }
                >
                    <Route path='dashboard' element={<AdminDashboard />} />
                    <Route path='products' element={<AdminProducts />} />
                    <Route path='orders' element={<AdminOrders />} />
                    <Route path='contact' element={<AdminContact />} />
                    <Route path='*' element={<PageNotFound />} />
                </Route>
                <Route
                    path='/auth'
                    element={
                        <CheckAuth
                            isLoading={isLoading}
                            isAuthenticated={isAuthenticated}
                            user={user}
                        >
                            <AuthLayout />
                        </CheckAuth>
                    }
                >
                    <Route path='login' element={<AuthLogin />} />
                    <Route path='register' element={<AuthRegister />} />
                </Route>
            </Routes>
        </>
    );
}

export default App;
