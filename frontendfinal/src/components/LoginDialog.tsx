import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Mail, Lock, User, Eye, EyeOff, Leaf } from 'lucide-react';
import { useAuth } from './AuthContext';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const { login, signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    diet_preference: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Django backend URL
  const API_BASE = 'http://127.0.0.1:8000'; // change if backend runs elsewhere

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      console.log('📡 Sending login request...');
      const response = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('❌ Server login error:', errText);
        throw new Error('Invalid credentials or server error');
      }

      const data = await response.json();
      console.log('✅ Login success:', data);
      login(loginData.email, loginData.password); // call context
      alert('Login successful!');
      onClose();
    } catch (err) {
      console.error('🚨 Error connecting to server:', err);
      setError('Unable to connect to server. Please check backend or credentials.');
    } finally {
      setLoading(false);
    }
  };

const sendWelcomeEmail = async (email: string, username: string) => {
  try {
    const response = await fetch(`${API_BASE}/api/send-welcome-email/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        username: username
      }),
    });

    if (!response.ok) {
      console.error('Welcome email failed to send');
    } else {
      console.log('Welcome email sent successfully');
    }
  } catch (err) {
    console.error('Error sending welcome email:', err);
  }
};

// Update the success part of handleSignup function:
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  if (signupData.password !== signupData.confirmPassword) {
    alert('Passwords do not match!');
    return;
  }
  setLoading(true);
  try {
    console.log('📡 Sending signup request...');
    const response = await fetch(`${API_BASE}/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: signupData.username,
        email: signupData.email,
        password: signupData.password,
        diet_preference: signupData.diet_preference,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('❌ Server signup error:', errText);
      throw new Error('Signup failed');
    }

    const data = await response.json();
    console.log('✅ Signup success:', data);
    
    // Send welcome email after successful signup
    await sendWelcomeEmail(signupData.email, signupData.username);
    
    signup(signupData.username, signupData.email, signupData.password);
    alert('Signup successful! Welcome email sent.');
    onClose();
  } catch (err) {
    console.error('🚨 Error connecting to server:', err);
    setError('Unable to connect to server. Please check backend or URL.');
  } finally {
    setLoading(false);
  }
};
  const handleSocialLogin = () => {
    signup('Social User', 'social@example.com', 'social');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-primary">Welcome to COOKMATE</DialogTitle>
          <DialogDescription className="text-center">
            Join our community of smart home cooks
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* LOGIN TAB */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Please wait...' : 'Login'}
              </Button>
            </form>

            
          </TabsContent>

          {/* SIGNUP TAB */}
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter a username"
                    className="pl-10"
                    value={signupData.username}
                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    className="pl-10"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    className="pl-10"
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData({ ...signupData, confirmPassword: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diet">Diet Preference</Label>
                <div className="relative">
                  <Leaf className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <select
                    id="diet"
                    className="pl-10 w-full border rounded-md py-2 bg-background text-foreground"
                    value={signupData.diet_preference}
                    onChange={(e) =>
                      setSignupData({ ...signupData, diet_preference: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Diet</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="non-vegetarian">Non-Vegetarian</option>
                    <option value="keto">Keto</option>
                  </select>
                </div>
              </div>

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Please wait...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        
      </DialogContent>
    </Dialog>
  );
}