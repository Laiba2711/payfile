import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
    navigate('/dashboard');
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Enter your details to access your account"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="name@example.com" 
          required 
        />
        <div className="space-y-1">
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            required 
          />
          <div className="flex justify-end">
            <Link 
              to="/forgot-password" 
              className="text-sm text-payfile-green hover:underline transition-all"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button variant="primary" className="w-full py-3.5 mt-2">
          Sign In
        </Button>

        <p className="text-center text-slate-500 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-white hover:text-payfile-green transition-colors font-medium">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
