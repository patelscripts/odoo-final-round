import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();
  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4">
        <Link to="/" className="font-heading text-2xl font-semibold text-ink tracking-tight">
          PeoplePay<span className="text-primary">360</span>
        </Link>

        <div className="flex items-center gap-6">
          {!isLoginPage && !isSignupPage && (
            <a
              href="#flow"
              className="hidden sm:inline text-sm text-ink-muted hover:text-ink transition-colors"
            >
              How it works
            </a>
          )}
          <Link to={isLoginPage ? "/signup" : "/login"} className="btn-primary text-sm">
            {isLoginPage ? "Sign up" : "Sign in"}
          </Link>
        </div>
      </nav>
    </header>
  );
}