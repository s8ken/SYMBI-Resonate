import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Card, CardHeader, CardContent, CardFooter } from '../ui';
import { useToast } from '../ui/Toast';
import { AuthService } from '../../lib/auth/auth-service';
import { Mail, Lock, User, Building, AlertCircle, CheckCircle } from 'lucide-react';

interface SignUpFormProps {
  authService: AuthService;
  onSuccess?: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ authService, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organization: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (passwordStrength < 3) {
      setError('Please use a stronger password');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { user, error } = await authService.signUp({
        email: formData.email,
        password: formData.password,
        metadata: {
          fullName: formData.fullName,
          organization: formData.organization,
        },
      });

      if (error) {
        setError(error.message);
        addToast({
          title: 'Sign Up Failed',
          description: error.message,
          variant: 'danger',
        });
        return;
      }

      if (user) {
        addToast({
          title: 'Account Created!',
          description: 'Please check your email to verify your account.',
          variant: 'success',
        });
        onSuccess?.();
        navigate('/verify-email');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      addToast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-danger-500';
    if (passwordStrength <= 3) return 'bg-warning-500';
    return 'bg-success-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4 py-8">
      <Card className="w-full max-w-md" variant="elevated">
        <CardHeader
          title="Create Account"
          description="Sign up for SYMBI Resonate"
        />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-danger-600" />
                <p className="text-sm text-danger-700 dark:text-danger-400">{error}</p>
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="John Doe"
              leftIcon={<User className="w-5 h-5" />}
              disabled={isLoading}
            />

            <Input
              label="Organization (Optional)"
              type="text"
              value={formData.organization}
              onChange={(e) => handleChange('organization', e.target.value)}
              placeholder="Your Company"
              leftIcon={<Building className="w-5 h-5" />}
              disabled={isLoading}
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              required
              disabled={isLoading}
            />

            <div>
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                required
                disabled={isLoading}
              />
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      Password strength:
                    </span>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 2 ? 'text-danger-600' :
                      passwordStrength <= 3 ? 'text-warning-600' :
                      'text-success-600'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                formData.confirmPassword && formData.password === formData.confirmPassword ? (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                ) : null
              }
              required
              disabled={isLoading}
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 rounded border-neutral-300 dark:border-neutral-700"
              />
              <label className="text-sm text-neutral-600 dark:text-neutral-400">
                I agree to the{' '}
                <a href="/terms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center text-neutral-600 dark:text-neutral-400 w-full">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              Sign in
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};