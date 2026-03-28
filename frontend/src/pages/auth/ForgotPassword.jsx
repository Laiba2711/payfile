import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPassword = () => {
  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="We'll send you a link to reset your password"
    >
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="name@example.com" 
          required 
        />

        <Button variant="primary" className="w-full py-3.5">
          Send Reset Link
        </Button>

        <p className="text-center">
          <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
            Back to login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
