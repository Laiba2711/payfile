import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Read ?redirect= query param so we can bounce back after login
  const redirectTo = new URLSearchParams(location.search).get('redirect') || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', formData);
      onLogin(response.data.data.user, response.data.token, redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Login" 
      subtitle="Sign in to your account to continue"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold uppercase tracking-wide animate-fade-in shadow-sm">
            {error}
          </div>
        )}
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="Enter your email" 
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required 
        />
        <div className="space-y-2">
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required 
          />
          <div className="flex justify-end pr-1">
            <Link 
              to="/forgot-password" 
              className="text-[10px] font-black text-payfile-amber uppercase tracking-widest hover:text-payfile-maroon transition-all"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button variant="primary" className="w-full py-4 mt-2 font-black shadow-lg shadow-payfile-amber/20" loading={loading}>
          Login
        </Button>

        <p className="text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest py-4">
          Don't have an account?{' '}
          <Link
            to={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : '/register'}
            className="text-payfile-maroon hover:text-payfile-gold transition-colors ml-1 underline decoration-payfile-gold/30 underline-offset-4"
          >
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
