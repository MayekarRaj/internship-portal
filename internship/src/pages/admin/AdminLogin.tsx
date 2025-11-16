import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Building2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loginAdmin, verifyAdmin, clearError } from '@/store/adminAuthSlice';
import type { RootState } from '@/App';

const AdminLogin: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.adminAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Check if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      dispatch(verifyAdmin() as any);
    }
  }, [dispatch]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      window.location.hash = '#admin/dashboard';
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(loginAdmin({ email, password }) as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="w-12 h-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <p className="text-gray-600 mt-2">Getfly Technologies Internship Portal</p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // placeholder="admin@getflytechnologies.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {/* <div className="mt-6 text-center text-sm text-gray-600">
            <p>Default credentials:</p>
            <p className="font-mono text-xs mt-1">
              admin@getflytechnologies.com / admin123
            </p>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
};



export default AdminLogin;

