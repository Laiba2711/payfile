import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Register = () => {
  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join PayFile and start sharing files"
    >
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" placeholder="John" required />
          <Input label="Last Name" placeholder="Doe" required />
        </div>
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="name@example.com" 
          required 
        />
        <Input 
          label="Password" 
          type="password" 
          placeholder="••••••••" 
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

        <Button variant="primary" className="w-full py-3.5">
          Get Started
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
