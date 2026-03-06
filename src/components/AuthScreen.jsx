import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase.js';
import { theme } from '../theme-globals.js';
import { T, DARK_BG } from '../constants/styles.js';

const googleProvider = new GoogleAuthProvider();

function getAuthError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential': return 'Invalid email or password';
    case 'auth/wrong-password': return 'Incorrect password';
    case 'auth/email-already-in-use': return 'Email already registered';
    case 'auth/invalid-email': return 'Invalid email address';
    case 'auth/weak-password': return 'Password must be at least 6 characters';
    case 'auth/too-many-requests': return 'Too many attempts — try again later';
    case 'auth/network-request-failed': return 'Network error — check your connection';
    case 'auth/popup-blocked': return 'Popup blocked — allow popups and try again';
    default: return 'Something went wrong — try again';
  }
}

const inp = {
  width: '100%',
  padding: '10px 14px',
  fontSize: 14,
  fontFamily: 'JetBrains Mono, monospace',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  color: '#e8e0d0',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

export function AuthScreen({ onGuestPlay }) {
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const clearErr = () => setError('');

  const handleSignIn = async () => {
    if (!email || !password) { setError('Email and password required'); return; }
    setLoading(true); clearErr();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in Casino.jsx handles the rest
    } catch (e) {
      setError(getAuthError(e.code));
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!displayName.trim()) { setError('Display name required'); return; }
    if (displayName.trim().length > 20) { setError('Display name max 20 characters'); return; }
    if (!email) { setError('Email required'); return; }
    if (!password) { setError('Password required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); clearErr();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: displayName.trim() });
      // onAuthStateChanged in Casino.jsx handles the rest
    } catch (e) {
      setError(getAuthError(e.code));
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true); clearErr();
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged in Casino.jsx handles the rest
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        setError(getAuthError(e.code));
      }
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) { setError('Enter your email address first'); return; }
    setLoading(true); clearErr();
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setLoading(false);
    } catch (e) {
      setError(getAuthError(e.code));
      setLoading(false);
    }
  };

  const onKey = (e, action) => { if (e.key === 'Enter') action(); };

  const accent = theme.accent || '#d4af37';

  return (
    <div style={{
      minHeight: '100vh', background: DARK_BG, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', fontFamily: T.serif, color: T.text,
      padding: '20px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 360, animation: 'fadeIn 0.4s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 className="anim-shimmer-title" style={{
            fontSize: 28, fontWeight: 900, margin: '0 0 6px', letterSpacing: 4,
            background: `linear-gradient(135deg, ${accent}, ${accent}cc, ${accent})`,
            backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', color: 'transparent',
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
          }}>OBSIDIAN LOUNGE</h1>
          <div style={{ fontSize: 9, letterSpacing: 3, color: T.dim, fontFamily: T.mono }}>
            {tab === 'reset' ? 'RESET PASSWORD' : tab === 'signup' ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
          </div>
        </div>

        {/* Tab switcher */}
        {tab !== 'reset' && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4 }}>
            {[['signin', 'Sign In'], ['signup', 'Sign Up']].map(([id, label]) => (
              <button key={id} onClick={() => { setTab(id); clearErr(); setError(''); }}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                  fontFamily: T.mono, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: tab === id ? `${accent}22` : 'transparent',
                  color: tab === id ? accent : T.muted,
                  outline: tab === id ? `1px solid ${accent}44` : 'none',
                }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: '20px 20px 16px',
        }}>
          {tab === 'reset' ? (
            resetSent ? (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✉️</div>
                <div style={{ fontSize: 13, color: '#22c55e', fontFamily: T.mono, marginBottom: 6 }}>Reset email sent!</div>
                <div style={{ fontSize: 10, color: T.dim, fontFamily: T.mono, marginBottom: 16 }}>Check {email} for the link</div>
                <button onClick={() => { setTab('signin'); setResetSent(false); clearErr(); }}
                  style={{ fontSize: 11, color: accent, fontFamily: T.mono, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: 1 }}>
                  Back to Sign In
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 11, color: T.dim, fontFamily: T.mono, marginBottom: 4, lineHeight: 1.5 }}>
                  Enter your email and we'll send a password reset link.
                </div>
                <input type="email" placeholder="Email" value={email}
                  onChange={e => { setEmail(e.target.value); clearErr(); }}
                  onKeyDown={e => onKey(e, handleReset)}
                  style={inp} autoFocus />
                {error && <div style={{ fontSize: 10, color: '#ef4444', fontFamily: T.mono }}>{error}</div>}
                <button onClick={handleReset} disabled={loading}
                  style={{
                    padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: T.mono,
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#1a1a2e',
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                    letterSpacing: 1,
                  }}>
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
                <button onClick={() => { setTab('signin'); clearErr(); }}
                  style={{ fontSize: 10, color: T.muted, fontFamily: T.mono, background: 'none', border: 'none', cursor: 'pointer' }}>
                  ← Back to Sign In
                </button>
              </div>
            )
          ) : tab === 'signup' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input type="text" placeholder="Display name" value={displayName} maxLength={20}
                onChange={e => { setDisplayName(e.target.value); clearErr(); }}
                onKeyDown={e => onKey(e, handleSignUp)}
                style={inp} autoFocus />
              <input type="email" placeholder="Email" value={email}
                onChange={e => { setEmail(e.target.value); clearErr(); }}
                onKeyDown={e => onKey(e, handleSignUp)}
                style={inp} />
              <input type="password" placeholder="Password (min 6 characters)" value={password}
                onChange={e => { setPassword(e.target.value); clearErr(); }}
                onKeyDown={e => onKey(e, handleSignUp)}
                style={inp} />
              {error && <div style={{ fontSize: 10, color: '#ef4444', fontFamily: T.mono }}>{error}</div>}
              <button onClick={handleSignUp} disabled={loading}
                style={{
                  padding: '11px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: T.mono,
                  background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#1a1a2e',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                  letterSpacing: 2, textTransform: 'uppercase', marginTop: 2,
                }}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: 9, color: T.dim, fontFamily: T.mono }}>OR</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>
              <button onClick={handleGoogle} disabled={loading}
                style={{
                  padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: T.mono,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: T.text, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          ) : (
            // Sign In tab
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input type="email" placeholder="Email" value={email}
                onChange={e => { setEmail(e.target.value); clearErr(); }}
                onKeyDown={e => onKey(e, handleSignIn)}
                style={inp} autoFocus />
              <input type="password" placeholder="Password" value={password}
                onChange={e => { setPassword(e.target.value); clearErr(); }}
                onKeyDown={e => onKey(e, handleSignIn)}
                style={inp} />
              {error && <div style={{ fontSize: 10, color: '#ef4444', fontFamily: T.mono }}>{error}</div>}
              <button onClick={handleSignIn} disabled={loading}
                style={{
                  padding: '11px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: T.mono,
                  background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#1a1a2e',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                  letterSpacing: 2, textTransform: 'uppercase', marginTop: 2,
                }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <button onClick={() => { setTab('reset'); clearErr(); }}
                style={{ fontSize: 10, color: T.muted, fontFamily: T.mono, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right' }}>
                Forgot password?
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: 9, color: T.dim, fontFamily: T.mono }}>OR</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>
              <button onClick={handleGoogle} disabled={loading}
                style={{
                  padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: T.mono,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: T.text, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          )}
        </div>

        {/* Guest play */}
        {tab !== 'reset' && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button onClick={onGuestPlay}
              style={{ fontSize: 11, color: T.dim, fontFamily: T.mono, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: 1 }}>
              Play as Guest — no account needed
            </button>
            {tab === 'signin' && (
              <div style={{ marginTop: 4, fontSize: 9, color: '#2a2318', fontFamily: T.mono }}>
                Guest progress saves locally only
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
