import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

function ScrollToTop() {
    const { pathname, search } = useLocation();
    const navigationType = useNavigationType();

    useEffect(() => {
        // Only scroll to top if it's a PUSH navigation
        if (navigationType === 'PUSH') {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        }

        // For POP navigation (back/forward), restore the scroll position
        if (navigationType === 'POP') {
            const savedPosition = window.history.state?.scrollY || 0;
            window.scrollTo({
                top: savedPosition,
                left: 0,
                behavior: 'smooth'
            });
        }
    }, [pathname, search, navigationType]);

    // Save scroll position before leaving the page
    useEffect(() => {
        const handleScroll = () => {
            const currentState = window.history.state || {};
            window.history.replaceState(
                {
                    ...currentState,
                    scrollY: window.scrollY
                },
                ''
            );
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return null;
}

export default ScrollToTop;
