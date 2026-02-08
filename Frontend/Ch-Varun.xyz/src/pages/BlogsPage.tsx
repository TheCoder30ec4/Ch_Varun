import { Suspense, lazy } from 'react';

const DotLottie = lazy(() =>
  import('@lottiefiles/dotlottie-react').then((m) => ({ default: m.DotLottieReact })),
);

export default function BlogsPage() {
  return (
    <div className="page-panel notfound-page">
      <div className="notfound-page__lottie">
        <Suspense fallback={<div style={{ width: 200, height: 200 }} />}>
          <DotLottie
            src="https://lottie.host/01bec518-c6b1-4b97-9100-0bdac34053dc/Z1Sn19O9dV.lottie"
            loop
            autoplay
          />
        </Suspense>
      </div>
      <h2 className="notfound-page__title">Coming Soon</h2>
      <p className="notfound-page__subtitle">
        This page is under construction. Check back later.
      </p>
    </div>
  );
}
