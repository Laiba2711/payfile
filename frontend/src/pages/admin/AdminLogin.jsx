import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AuthLayout from '../../components/auth/AuthLayout';

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.data.user.role !== 'admin') {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }
        onLogin(data.data.user, data.token);
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Admin Login"
      subtitle="Authorized Access Only"
      image="/auth-login.png"
      imagePosition="left"
    >
      <div className="relative z-10">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl mb-8 text-[11px] font-black uppercase tracking-wide flex items-center gap-3 animate-fade-in shadow-sm">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@payfile.net"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-5 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-payfile-amber/20 mt-4"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                Login to Dashboard
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>
        </form>

        <div className="mt-12 text-center">
          <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Secure Admin Access &bull; SSL Encrypted</span>
        </div>
      </div>
    </AuthLayout>
  );
};

export default AdminLogin;
