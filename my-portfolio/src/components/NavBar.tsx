import { Button } from "./ui/button";
import { Github, Mail, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const NavBar = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = saved ? saved === "dark" : prefersDark;
    setIsDark(initialDark);
    if (initialDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const next = !isDark;
    setIsDark(next);
    if (next) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 flex h-20 items-center justify-between text-foreground">
        <div className="flex items-center space-x-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
              <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Ch Varun</h2>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a href="#home" className="text-base md:text-lg font-semibold text-foreground/80 transition-colors hover:text-primary">
            Home
          </a>
          <a href="#skills" className="text-base md:text-lg font-semibold text-foreground/80 transition-colors hover:text-primary">
            Skills
          </a>
          <a href="#experience" className="text-base md:text-lg font-semibold text-foreground/80 transition-colors hover:text-primary">
            Experience
          </a>
          <a href="#projects" className="text-base md:text-lg font-semibold text-foreground/80 transition-colors hover:text-primary">
            Projects
          </a>
          <a href="#contact" className="text-base md:text-lg font-semibold text-foreground/80 transition-colors hover:text-primary">
            Contact
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href="https://github.com/TheCoder30ec4" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github className="h-5 w-5" />
            </a>
          </Button>
          <Button size="lg" asChild>
            <a href="#contact">
              <Mail className="mr-2 h-5 w-5" />
              Let's Talk
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;