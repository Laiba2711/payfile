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
      subtitle="Join PayFile today to start selling files"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold uppercase tracking-wide animate-fade-in">
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
          placeholder="john@example.com" 
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
            className="w-4 h-4 rounded border-gray-300 bg-payfile-cream/50 text-payfile-maroon focus:ring-payfile-gold" 
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-400 font-medium">
            I accept the <a href="#" className="text-payfile-amber hover:underline hover:text-payfile-maroon transition-colors">Terms of Service</a>
          </label>
        </div>

        <Button variant="primary" className="w-full py-4 font-black shadow-lg shadow-payfile-amber/20" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>

        <p className="text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-payfile-maroon hover:text-payfile-gold transition-colors ml-1 underline decoration-payfile-gold/30 underline-offset-4">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
