import { Navigate, useLocation } from 'react-router-dom';

function CheckAuth({ isAuthenticated, isLoading, user, children }) {
    const location = useLocation();
    console.log(location);

    // If loading, do nothing
    if (isLoading) {
        return null;
    }

    // Redirect unauthenticated users to login unless on login/register pages
    if (!isAuthenticated && !['/auth/login', '/auth/register'].includes(location.pathname)) {
        return <Navigate to='/auth/login' state={{ from: location }} />;
    }

    // Redirect authenticated users away from login/register pages
    if (isAuthenticated && user && ['/auth/login', '/auth/register'].includes(location.pathname)) {
        if (user?.role === 'admin') {
            return (
                <Navigate
                    to={
                        location.state?.from.pathname + location.state?.from.search ||
                        '/admin/dashboard'
                    }
                />
            );
        }
        return <Navigate to={location.state?.from.pathname + location.state?.from.search || '/'} />;
    }

    // Redirect admin users to dashboard if not on an admin page
    if (isAuthenticated && user?.role === 'admin' && !location.pathname.startsWith('/admin')) {
        return <Navigate to='/admin/dashboard' />;
    }

    // Redirect regular users away from admin pages
    if (isAuthenticated && user?.role === 'client' && location.pathname.startsWith('/admin')) {
        return <Navigate to='/unauth-page' />;
    }

    // Render children if no conditions match
    return <>{children}</>;
}

export default CheckAuth;
