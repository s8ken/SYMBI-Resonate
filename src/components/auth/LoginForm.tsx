import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Card, CardHeader, CardContent, CardFooter } from '../ui';
import { useToast } from '../ui/Toast';
import { AuthService } from '../../lib/auth/auth-service';
import { Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  authService: AuthService;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ authService, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { user, error } = await authService.signIn({ email, password });

      if (error) {
        setError(error.message);
        addToast({
          title: 'Login Failed',
          description: error.message,
          variant: 'danger',
        });
        return;
      }

      if (user) {
        addToast({
          title: 'Welcome Back!',
          description: 'You have successfully logged in.',
          variant: 'success',
        });
        onSuccess?.();
        navigate('/');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <Card className="w-full max-w-md" variant="elevated">
        <CardHeader
          title="Welcome Back"
          description="Sign in to your SYMBI Resonate account"
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
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              required
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              required
              disabled={isLoading}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700"
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center text-neutral-600 dark:text-neutral-400 w-full">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              Sign up
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};