import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LiquidGradient from './components/ui/flow-gradient-hero-section'
import SiteLayout from './components/ui/demo'
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import AboutPage from './pages/AboutPage'
import BlogsPage from './pages/BlogsPage'
import WorksPage from './pages/WorksPage'
import ContactPage from './pages/ContactPage'
import NotFound from './components/ui/not-found'

function App() {
  return (
    <BrowserRouter>
      {/* Persistent animated gradient background — fixed behind everything */}
      <LiquidGradient asBackground />

      {/* All page content sits on top of the gradient */}
      <div className="app-content-over-gradient">
        <Routes>
          {/* Layout route — wraps all pages with nav bar + glass overlay */}
          <Route element={<SiteLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Catch-all 404 — outside the layout (no nav bar) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
