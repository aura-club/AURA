import { useState } from 'react';
import { sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function usePasswordReset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sendResetEmail = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      });
      setSuccess(true);
      return true;
    } catch (err: any) {
      let errorMessage = 'Failed to send reset email';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyResetCode = async (code: string) => {
    try {
      await verifyPasswordResetCode(auth, code);
      return true;
    } catch (err) {
      setError('Invalid or expired reset code');
      return false;
    }
  };

  const resetPassword = async (code: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await confirmPasswordReset(auth, code, newPassword);
      setSuccess(true);
      return true;
    } catch (err: any) {
      let errorMessage = 'Failed to reset password';
      
      if (err.code === 'auth/invalid-action-code') {
        errorMessage = 'Reset link is invalid or expired';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendResetEmail,
    verifyResetCode,
    resetPassword,
    loading,
    error,
    success,
  };
}
