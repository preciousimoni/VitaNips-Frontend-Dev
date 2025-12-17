// src/components/routing/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../../utils/analytics';

/**
 * ScrollToTop component that scrolls to the top of the page
 * and tracks page views in Google Analytics whenever the route changes.
 */
const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top when route changes
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        
        // Track page view in Google Analytics
        trackPageView(pathname, document.title);
    }, [pathname]);

    return null;
};

export default ScrollToTop;

