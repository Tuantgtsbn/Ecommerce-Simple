import Footer from './footer.jsx';
import Header from './header.jsx';
import { Outlet } from 'react-router-dom';
function Layout() {
    return (
        <div className='flex flex-col bg-white overflow-hidden min-h-screen'>
            {/* common header */}
            <Header />
            <main className='flex flex-1 flex-col w-full'>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default Layout;
