// src/components/routing/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls to the top of the page
 * whenever the route changes.
 */
const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top when route changes
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, [pathname]);

    return null;
};

export default ScrollToTop;

