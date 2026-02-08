import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function AboutPage() {
  return (
    <div className="page-panel notfound-page">
      <div className="notfound-page__lottie">
        <DotLottieReact
          src="https://lottie.host/01bec518-c6b1-4b97-9100-0bdac34053dc/Z1Sn19O9dV.lottie"
          loop
          autoplay
        />
      </div>
      <h2 className="notfound-page__title">Coming Soon</h2>
      <p className="notfound-page__subtitle">
        This page is under construction. Check back later.
      </p>
    </div>
  );
}
