import { Suspense, lazy } from 'react';

const DotLottie = lazy(() =>
  import('@lottiefiles/dotlottie-react').then((m) => ({ default: m.DotLottieReact })),
);

export default function ContactPage() {
  return (
    <div className="page-panel contact-page">
      <div className="contact-page__lottie">
        <Suspense fallback={<div style={{ width: 200, height: 200 }} />}>
          <DotLottie
            src="https://lottie.host/8cf4ba71-e5fb-44f3-8134-178c4d389417/0CCsdcgNIP.json"
            loop
            autoplay
          />
        </Suspense>
      </div>
      <h2 className="contact-page__title">Get in Touch</h2>
      <p className="contact-page__subtitle">
        Have a project in mind or just want to say hi? Drop me a message.
      </p>
      <a href="mailto:hello@chvarun.xyz" className="contact-page__cta">
        hello@chvarun.xyz
      </a>
    </div>
  );
}
