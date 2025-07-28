import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Building2, Users, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const { login, user, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  if (user && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const demoUsers = [
    { email: 'admin@company.com', role: 'Administrator', password: 'admin123' },
    { email: 'data@company.com', role: 'Data Team', password: 'data123' },
    { email: 'presales@company.com', role: 'Pre-Sales Team', password: 'presales123' },
    { email: 'sales@company.com', role: 'Sales Team', password: 'sales123' },
    { email: 'implementation@company.com', role: 'Implementation', password: 'impl123' },
    { email: 'finance@company.com', role: 'Finance Team', password: 'finance123' }
  ];

  const fillDemoUser = (email: string, password: string) => {
    setFormData({ email, password });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <Building2 className="h-10 w-10" />
            <h1 className="text-3xl font-bold">Enterprise CRM</h1>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Streamline Your Sales Process with Advanced CRM
            </h2>
            <p className="text-xl text-blue-100">
              Manage leads, opportunities, and customer relationships with enterprise-grade tools and integrations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-blue-200" />
            <div>
              <h3 className="font-semibold">Role-Based Access</h3>
              <p className="text-blue-200">Secure permissions for every team member</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <TrendingUp className="h-8 w-8 text-blue-200" />
            <div>
              <h3 className="font-semibold">Advanced Analytics</h3>
              <p className="text-blue-200">Real-time insights and reporting</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-blue-200" />
            <div>
              <h3 className="font-semibold">Enterprise Security</h3>
              <p className="text-blue-200">Bank-level security and compliance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your Enterprise CRM account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Users */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Demo Users</CardTitle>
              <CardDescription>
                Click any user below to auto-fill login credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {demoUsers.map((user, index) => (
                  <button
                    key={index}
                    onClick={() => fillDemoUser(user.email, user.password)}
                    className="flex items-center justify-between p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{user.role}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {user.password}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-500">
            <p>© 2024 Enterprise CRM. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;