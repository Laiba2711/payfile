import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters long');
    }

    setLoading(true);

    try {
      await axios.patch(`/api/auth/reset-password/${token}`, {
        password: formData.password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Set New Password" 
      subtitle="Enter your new password below"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black uppercase tracking-widest animate-fade-in shadow-sm">
            {error}
          </div>
        )}
        
        {success ? (
          <div className="space-y-6 text-center animate-fade-up">
            <div className="p-6 bg-green-50 border border-green-100 rounded-3xl text-green-600">
                <p className="text-sm font-black uppercase tracking-widest mb-2 text-green-700">Success!</p>
                <p className="text-xs font-bold opacity-80">Your password has been updated. Redirecting to login...</p>
            </div>
            <Link to="/login">
                <Button variant="secondary" className="w-full py-4 text-sm font-bold">Go to Login Now</Button>
            </Link>
          </div>
        ) : (
          <>
            <Input 
              label="New Password" 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required 
            />
            <Input 
              label="Confirm New Password" 
              type="password" 
              placeholder="••••••••" 
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required 
            />

            <Button 
                variant="primary" 
                className="w-full py-4 font-black shadow-lg shadow-payfile-amber/20 mt-4" 
                loading={loading}
                type="submit"
            >
              Update Password
            </Button>
          </>
        )}
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
