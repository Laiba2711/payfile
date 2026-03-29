import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Register = ({ onRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', formData);
      if (onRegister) {
        onRegister(response.data.data.user, response.data.token);
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join PayFile and start sharing files"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="First Name" 
            placeholder="John" 
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required 
          />
          <Input 
            label="Last Name" 
            placeholder="Doe" 
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required 
          />
        </div>
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="name@example.com" 
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required 
        />
        <Input 
          label="Password" 
          type="password" 
          placeholder="••••••••" 
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required 
        />
        
        <div className="flex items-center gap-3 py-2">
          <input 
            type="checkbox" 
            id="terms" 
            className="w-4 h-4 rounded border-white/10 bg-white/5 text-payfile-green focus:ring-payfile-green/50" 
            required
          />
          <label htmlFor="terms" className="text-sm text-slate-400">
            I agree to the <a href="#" className="text-white hover:underline">Terms of Service</a>
          </label>
        </div>

        <Button variant="primary" className="w-full py-3.5" disabled={loading}>
          {loading ? 'Creating account...' : 'Get Started'}
        </Button>

        <p className="text-center text-slate-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-white hover:text-payfile-green transition-colors font-medium">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
