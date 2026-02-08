import { useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import GlassWaveOverlay from './image-transition';
import type { GlassWaveHandle } from './image-transition';

/**
 * Maps each nav label to a URL path.
 * Order matches the visual nav bar layout.
 */
const navItems = [
  { label: 'Home',                     path: '/' },
  { label: 'Chat with my Assistant',   path: '/chat' },
  { label: 'About Me',                 path: '/about' },
  { label: 'Blogs',                    path: '/blogs' },
  { label: 'My Works and Experience',  path: '/works' },
  { label: 'Contact Me',               path: '/contact' },
];

export default function SiteLayout() {
  const overlayRef = useRef<GlassWaveHandle>(null);
  const animating  = useRef(false);
  const navigate   = useNavigate();
  const location   = useLocation();

  /** Derive active index from current pathname */
  const activeIdx = navItems.findIndex((n) => n.path === location.pathname);

  const goTo = useCallback(
    (idx: number) => {
      const target = navItems[idx];
      if (animating.current || target.path === location.pathname) return;

      animating.current = true;
      overlayRef.current?.play();

      // Navigate immediately — the overlay covers the swap
      navigate(target.path);

      // Safety: unlock after 2.5s in case onComplete never fires
      setTimeout(() => {
        animating.current = false;
      }, 2500);
    },
    [location.pathname, navigate],
  );

  const handleComplete = useCallback(() => {
    animating.current = false;
  }, []);

  return (
    <div className="glass-wave-demo">
      {/* Current page content rendered by the router */}
      <Outlet />

      {/* Glass-circle distortion overlay */}
      <GlassWaveOverlay
        ref={overlayRef}
        sourceSelector=".liquid-canvas-wrapper canvas"
        duration={1.6}
        onComplete={handleComplete}
        className="glass-wave-canvas"
      />

      {/* Bottom navigation */}
      <nav className="bottom-nav">
        {navItems.map((item, i) => (
          <button
            key={item.path}
            className={`bottom-nav-item ${i === activeIdx ? 'active' : ''}`}
            onClick={() => goTo(i)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
