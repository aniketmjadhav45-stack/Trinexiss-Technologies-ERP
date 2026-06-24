import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Sparkles, 
  Terminal, 
  ArrowRight,
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Info,
  Briefcase,
  Layers,
  Camera,
  Check
} from 'lucide-react';
import { UserSession, Employee } from '../types.ts';

// Preset credentials for easy developer evaluation
const LOGIN_PRESETS = [
  {
    name: 'Sweta Singh',
    email: 'sweta.s@trinexiss.tech',
    role: 'Admin' as const,
    subtitle: 'Full Enterprise & Personnel Admin'
  },
  {
    name: 'Shweta Dwivedi',
    email: 'shweta.d@trinexiss.tech',
    role: 'Admin' as const,
    subtitle: 'Full Enterprise & Personnel Admin'
  },
  {
    name: 'Sunita Dwivedi',
    email: 'sunita.d@trinexiss.tech',
    role: 'Admin' as const,
    subtitle: 'Full Enterprise & Personnel Admin'
  },
  {
    name: 'Manju Shukla',
    email: 'manju.s@trinexiss.tech',
    role: 'Admin' as const,
    subtitle: 'Full Enterprise & Personnel Admin'
  },
  {
    name: 'Aniket Jadhav',
    email: 'aniket.j@trinexiss.tech',
    role: 'Admin' as const,
    subtitle: 'Full Enterprise & Personnel Admin'
  }
];

interface AuthProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset' | 'verify' | 'accept-invite'>('login');
  
  // Input form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'Founder' | 'Admin' | 'AI Engineer' | 'Employee'>('Employee');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [verifyCode, setVerifyCode] = useState('123456');

  // Accept invitation state
  const [activeInvite, setActiveInvite] = useState<any>(null);
  const [pastedToken, setPastedToken] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=face');

  // Predefined avatar choices for easy profile photo setup
  const AVATAR_PRESETS = [
    { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=face', name: 'Female PM' },
    { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face', name: 'Male Developer' },
    { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=128&h=128&fit=crop&crop=face', name: 'Female UI' },
    { url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop&crop=face', name: 'Male QA' },
    { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face', name: 'Female Eng' },
    { url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=128&h=128&fit=crop&crop=face', name: 'Male Architect' }
  ];

  // Check URL parameters for invitation on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const inviteToken = params.get('invite');
      if (inviteToken) {
        checkAndLoadInvite(inviteToken);
      }
    } catch (e) {
      console.warn('Could not read window search params:', e);
    }
  }, []);

  const checkAndLoadInvite = (token: string) => {
    try {
      const stored = localStorage.getItem('trinexiss_invites');
      const invites = stored ? JSON.parse(stored) : [];
      const match = invites.find((inv: any) => inv.token === token);
      
      if (match) {
        if (match.status === 'Invited') {
          setActiveInvite(match);
          setMode('accept-invite');
          setFullName(match.fullName);
          setEmail(match.email);
          setInfoMessage(`Secure invitation detected for ${match.fullName}. Formulate your personal login keys below to finalize activation.`);
          setError('');
        } else {
          setError(`This invitation link is no longer pending (Current Status: ${match.status}).`);
        }
      } else {
        setError('The invitation token entered is invalid or has expired.');
      }
    } catch (e) {
      setError('An error occurred while loading invitation details.');
    }
  };
  
  // Track registered simulated users in memory/localStorage to persist registration
  const getRegisteredUsers = (): any[] => {
    try {
      const stored = localStorage.getItem('trinexiss_auth_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveRegisteredUser = (user: any) => {
    try {
      const users = getRegisteredUsers();
      users.push(user);
      localStorage.setItem('trinexiss_auth_users', JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save user', e);
    }
  };

  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    let timer: any = null;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCountdown]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          if (data.code === 'UNVERIFIED') {
            setEmail(data.email);
            setMode('verify');
            setVerifyCode('');
            setResendCountdown(60);
            setInfoMessage(`Verification code sent to ${data.email}. Code is ${data.simulatedCode || 'issued'}. Please enter it below to verify your email.`);
            return;
          }
          throw new Error(data.error || 'Login failed.');
        }
        return data;
      })
      .then(data => {
        if (data && data.success && data.session) {
          onLoginSuccess(data.session);
        }
      })
      .catch(err => {
        setError(err.message);
      });
  };

  const handleAcceptInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    
    if (!password || !confirmPassword || !contact) {
      setError('Please fill out all required fields.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Prepare full invitation details to construct the user
    const payload = {
      fullName: activeInvite.fullName,
      email: activeInvite.email.toLowerCase(),
      designation: activeInvite.designation,
      department: activeInvite.department,
      contact: contact,
      password: password,
      profilePhoto: profilePhoto,
      token: activeInvite.token
    };

    fetch('/api/auth/accept-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to accept invitation.');
        return data;
      })
      .then(data => {
        if (data.success) {
          // Update invite local status for UI consistency
          try {
            const storedInvites = localStorage.getItem('trinexiss_invites');
            const invites = storedInvites ? JSON.parse(storedInvites) : [];
            const updatedInvites = invites.map((inv: any) => {
              if (inv.token === activeInvite.token) {
                return { ...inv, status: 'Active' };
              }
              return inv;
            });
            localStorage.setItem('trinexiss_invites', JSON.stringify(updatedInvites));
          } catch {}

          // Transition to verify mode
          setEmail(activeInvite.email.toLowerCase());
          setMode('verify');
          setVerifyCode('');
          setResendCountdown(60);
          setInfoMessage(`Invitation accepted successfully! Enter the 6-digit verification code sent to your email (${activeInvite.email}). Simulated code: ${data.simulatedCode}`);
          
          // Clear URL parameter
          if (window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      })
      .catch(err => {
        setError(err.message);
      });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all mandatory parameters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, contact, password, role })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed.');
        return data;
      })
      .then(data => {
        if (data.success) {
          setEmail(email.toLowerCase());
          setMode('verify');
          setVerifyCode('');
          setResendCountdown(60);
          setInfoMessage(`Successfully registered! A 6-digit verification code has been generated. Simulated code: ${data.simulatedCode}`);
        }
      })
      .catch(err => {
        setError(err.message);
      });
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!verifyCode || verifyCode.length !== 6) {
      setError('Please input a valid 6-digit verification code.');
      return;
    }

    fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: verifyCode })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Verification failed.');
        return data;
      })
      .then(data => {
        if (data.success && data.session) {
          onLoginSuccess(data.session);
        }
      })
      .catch(err => {
        setError(err.message);
      });
  };

  const handleResendCode = () => {
    setError('');
    setInfoMessage('');

    if (!email) {
      setError('No active email target found for resending.');
      return;
    }

    fetch('/api/auth/resend-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Resend failed.');
        return data;
      })
      .then(data => {
        if (data.success) {
          setResendCountdown(60);
          setInfoMessage(`A fresh 6-digit verification code has been generated. Simulated code: ${data.simulatedCode} (Attempt ${data.resendAttempts}/3)`);
        }
      })
      .catch(err => {
        setError(err.message);
      });
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }
    setMode('reset');
    setInfoMessage(`Simulation parameters active: A secure password reset token has been dispatched to ${email}. Please formulate your new login keys.`);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) {
      setError('Passwords cannot be empty and must match.');
      return;
    }

    // Password reset override
    const users = getRegisteredUsers();
    const updatedUsers = users.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, password };
      }
      return u;
    });
    localStorage.setItem('trinexiss_auth_users', JSON.stringify(updatedUsers));

    setMode('login');
    setInfoMessage('Your simulated credentials security values have been successfully rotated. Try logging in now.');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Upper Brand Badge */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex items-center justify-center bg-slate-900 text-emerald-400 p-3.5 rounded-3xl shadow-md border border-slate-800">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Trinexiss Core</h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Enterprise Operations Ledger (ERP + CRM)</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
          
          {/* Messages & Prompts */}
          {error && (
            <div className="bg-rose-50 border border-rose-250 p-3 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 font-semibold">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 font-semibold">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* MODE: LOGIN VIEW */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Corporate Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@trinexiss.tech"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    className="pl-9 w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-semibold focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Security Code/Password</label>
                  <button 
                    type="button" 
                    onClick={() => setMode('forgot')}
                    className="text-[10px] font-bold text-indigo-600 hover:underline"
                  >
                    Forgot Credentials?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-9 pr-9 w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-semibold focus:outline-none focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-1.5 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98"
              >
                <span>Authorize & Access ERP</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <div className="text-center text-xs pt-2">
                <span className="text-slate-400">New system manager? </span>
                <button 
                  type="button" 
                  onClick={() => { setMode('signup'); setError(''); setInfoMessage(''); }}
                  className="font-bold text-indigo-600 hover:underline"
                >
                  Create company account
                </button>
              </div>

              <div className="text-center text-xs border-t border-slate-100 pt-3 mt-1">
                <span className="text-slate-400">Received an employee invite? </span>
                <button 
                  type="button" 
                  onClick={() => { setMode('accept-invite'); setError(''); setInfoMessage('Paste your unique invitation token code to retrieve authorization parameters.'); }}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Activate via Invite Code
                </button>
              </div>
            </form>
          )}

          {/* MODE: SIGNUP VIEW */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 col-span-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Your Full Name *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Aniket Jadhav"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="pl-9 w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-semibold focus:outline-none hover:bg-slate-50/30"
                    />
                  </div>
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Contact Phone</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      placeholder="+91 98765 00000"
                      value={contact}
                      onChange={e => setContact(e.target.value)}
                      className="pl-9 w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Corporate Email Address *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="aniket@trinexiss.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-9 w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">System Role Authorization *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-bold focus:outline-none text-slate-700"
                >
                  <option value="Employee">Employee (View assigned + Edit task status)</option>
                  <option value="Admin">Admin (Access CRUD parameters for employee & CRM)</option>
                  <option value="AI Engineer">AI Engineer (Track models & optimization logs)</option>
                  <option value="Founder">Founder (Full operations access + global view)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-1.5 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98"
              >
                <span>Register Simulated Profile</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <div className="text-center text-xs pt-1">
                <span className="text-slate-400">Already registered? </span>
                <button 
                  type="button" 
                  onClick={() => { setMode('login'); setError(''); setInfoMessage(''); }}
                  className="font-bold text-indigo-600 hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* MODE: ACCEPT INVITATION INPUT SCREEN (If no active invite is loaded yet) */}
          {mode === 'accept-invite' && !activeInvite && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Enter Your Invitation Token</h3>
                <p className="text-xs text-slate-500">Provide the secure token generated by your Administrator to retrieve and activate your account.</p>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Invitation Code</label>
                <input
                  type="text"
                  placeholder="e.g., inv_shweta_1234"
                  value={pastedToken}
                  onChange={e => setPastedToken(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center font-mono font-bold tracking-widest focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setInfoMessage(''); }}
                  className="flex-1 py-2 border border-slate-200 text-slate-650 text-xs font-bold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => checkAndLoadInvite(pastedToken.trim())}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition active:scale-95"
                >
                  Retrieve Invite
                </button>
              </div>
            </div>
          )}

          {/* MODE: ACCEPT INVITATION PROFILE SETUP SCREEN */}
          {mode === 'accept-invite' && activeInvite && (
            <form onSubmit={handleAcceptInvite} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-left space-y-1">
                <p className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">🔒 Authorized Corporate Invitation</p>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  You have been invited by the Administrator to join <strong className="text-slate-900">Trinexiss Technologies</strong> as a <strong className="text-slate-900">{activeInvite.designation}</strong> in the <strong className="text-slate-900">{activeInvite.department}</strong> department.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Your Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    disabled
                    value={activeInvite.fullName}
                    className="pl-9 w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Corporate Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    disabled
                    value={activeInvite.email}
                    className="pl-9 w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Contact Number *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    className="pl-9 w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Profile Photo Avatar Preset Selection */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Select Profile Photo *</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((avatar, idx) => {
                    const isSelected = profilePhoto === avatar.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfilePhoto(avatar.url)}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition active:scale-95 ${
                          isSelected ? 'border-emerald-500 scale-105 shadow-xs' : 'border-transparent hover:border-slate-300'
                        }`}
                        title={avatar.name}
                      >
                        <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white font-black" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Custom Photo URL Input */}
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Camera className="h-4 w-4" />
                  </span>
                  <input
                    type="url"
                    placeholder="Or enter custom image URL..."
                    value={profilePhoto}
                    onChange={e => setProfilePhoto(e.target.value)}
                    className="pl-9 w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[10px] font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Create Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95"
              >
                Activate Account & Log In
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setInfoMessage(''); setActiveInvite(null); }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD VIEW */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide your corporate email coordinates below to issue a simulated reset secure token.
              </p>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Registered Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g., aniket.j@trinexiss.tech"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-semibold focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setInfoMessage(''); }}
                  className="flex-1 py-2 border border-slate-200 text-slate-650 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
                >
                  Dispatched Token
                </button>
              </div>
            </form>
          )}

          {/* MODE: RESET PASSWORD */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-slate-500">Formulate your fresh authorization credentials.</p>
              
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Define New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Confirm Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Reset & Finalize Security Parameters
              </button>
            </form>
          )}

          {/* MODE: EMAIL VERIFICATION VIEW */}
          {mode === 'verify' && (
            <form onSubmit={handleVerificationSubmit} className="space-y-4 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-950">Confirm Verification Code</h3>
                <p className="text-xs text-slate-500">
                  Enter the 6-digit code sent to <strong className="text-slate-800">{email}</strong>.
                </p>
                {infoMessage && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-150 p-2.5 rounded-xl text-left font-medium leading-relaxed">
                    {infoMessage}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">6-Digit Code</label>
                <input
                  type="text"
                  required
                  placeholder="••••••"
                  maxLength={6}
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value)}
                  className="text-center font-mono text-lg tracking-widest w-full max-w-[160px] mx-auto bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setInfoMessage(''); }}
                  className="flex-1 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition active:scale-95"
                >
                  Verify Account
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={resendCountdown > 0}
                  onClick={handleResendCode}
                  className={`text-xs font-bold ${resendCountdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-emerald-600 hover:text-emerald-800 hover:underline'}`}
                >
                  {resendCountdown > 0 
                    ? `Resend Code in ${resendCountdown}s` 
                    : 'Resend Verification Code'
                  }
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* QUICK PRESETS SIMULATION ZONE */}
      {(mode === 'login' || mode === 'signup') && (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-100/50 rounded-2xl border border-slate-200/60 p-4 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-500 animate-pulse" />
              <span>Instant Simulation Profiles</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-left">
              {LOGIN_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`preset-auth-btn-${p.role.toLowerCase().replace(' ', '-')}`}
                  onClick={() => {
                    onLoginSuccess({
                      fullName: p.name,
                      email: p.email,
                      role: p.role,
                      isVerified: true
                    });
                  }}
                  className="bg-white hover:bg-slate-50 border border-slate-200/70 p-2.5 rounded-xl transition duration-150 text-[11px] font-semibold text-slate-700 shadow-2xs hover:border-indigo-500 active:scale-95 text-left"
                >
                  <p className="font-bold text-slate-900 text-xs leading-tight">{p.name}</p>
                  <p className="text-[9px] text-indigo-600 mt-0.5 font-bold uppercase">{p.role}</p>
                  <p className="text-[9px] text-slate-400 leading-tight font-medium mt-0.5 line-clamp-1">{p.subtitle}</p>
                </button>
              ))}
            </div>
            
            <p className="text-[9px] text-slate-400 text-center flex items-center justify-center gap-1">
              <Info className="h-2.5 w-2.5 shrink-0" />
              <span>Roles adjust dashboard widgets and editing boundaries as requested.</span>
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
