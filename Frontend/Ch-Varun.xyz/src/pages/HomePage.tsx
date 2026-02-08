import PongText from '../components/ui/pong-text';

export default function HomePage() {
  return (
    <>
      {/* Visible hero is handled by PongText, but include a semantic H1 for SEO */ }
      <h1 className="sr-only">Varun Chaduvula — AI Engineer & Developer</h1>
      <PongText className="pong-canvas" />
    </>
  );
}
