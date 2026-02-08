import { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';

const DotLottie = lazy(() =>
  import('@lottiefiles/dotlottie-react').then((m) => ({ default: m.DotLottieReact })),
);

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-fullpage">
      <div className="notfound-page__lottie">
        <Suspense fallback={<div style={{ width: 240, height: 240 }} />}>
          <DotLottie
            src="https://lottie.host/01bec518-c6b1-4b97-9100-0bdac34053dc/Z1Sn19O9dV.lottie"
            loop
            autoplay
          />
        </Suspense>
      </div>
      <h1 className="notfound-page__title">Page Not Found</h1>
      <p className="notfound-page__subtitle">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button className="notfound-page__btn" onClick={() => navigate('/')}>
        Go Home
      </button>
    </div>
  );
}
