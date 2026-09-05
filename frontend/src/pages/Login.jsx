import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { loginUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await loginUser(formData);
      login({ name: data.name, email: data.email, role: data.role, employee: data.employee }, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="block text-center mb-10">
          <span className="font-heading text-3xl font-semibold text-ink tracking-tight">
            PeoplePay<span className="text-primary">360</span>
          </span>
        </Link>

        <div className="card shadow-sm">
          <h2 className="text-2xl mb-1 text-center">Welcome back</h2>
          <p className="text-sm mb-7 text-center">Sign in to manage your HR and payroll.</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-md bg-warning/10 border border-warning/30 text-sm text-warning">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-9"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-sm text-center mt-7">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:text-primary-dark">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}