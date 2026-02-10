'use client';

import React, { useMemo, useState } from 'react';
import LoadingSpinner from '../UI/LoadingSpinner';
import { postApi } from '@/lib/api';
import { validatePassword } from '@/lib/helpers/password';
import { Eye, EyeOff } from 'lucide-react';

interface ChangePasswordModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

type FieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  form?: string;
};

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const CHANGE_PASSWORD_ENDPOINT = '/auth/change-password';

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const fieldErrors: FieldErrors = useMemo(() => {
    const errors: FieldErrors = {};

    if (!currentPassword) {
      errors.currentPassword = 'Current password is required.';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required.';
    } else {
      const passwordValidation = validatePassword(newPassword, MIN_PASSWORD_LENGTH);
      if (!passwordValidation.isValid) {
        errors.newPassword = passwordValidation.errorMessage || 'Invalid password.';
      } else if (newPassword.length > MAX_PASSWORD_LENGTH) {
        errors.newPassword = `New password must be at most ${MAX_PASSWORD_LENGTH} characters.`;
      } else if (currentPassword && newPassword === currentPassword) {
        errors.newPassword = 'New password must be different from current password.';
      }
    }

    if (!confirmNewPassword) {
      errors.confirmNewPassword = 'Please confirm the new password.';
    } else if (newPassword && confirmNewPassword !== newPassword) {
      errors.confirmNewPassword = 'Passwords do not match.';
    }

    return errors;
  }, [confirmNewPassword, currentPassword, newPassword]);

  const isFormValid = useMemo(() => {
    return (
      !fieldErrors.currentPassword &&
      !fieldErrors.newPassword &&
      !fieldErrors.confirmNewPassword
    );
  }, [fieldErrors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSaving) return;

    setIsSaving(true);
    setServerError(null);

    try {
      await postApi<void>(CHANGE_PASSWORD_ENDPOINT, {
        currentPassword,
        newPassword,
        confirmPassword: confirmNewPassword
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to change password.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden bg-white rounded-lg text-left shadow-xl transition-all w-full max-w-lg my-8 sm:w-full">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          {serverError && <p className="text-red-500 mb-4">{serverError}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-input w-full pr-16"
                  autoComplete="current-password"
                  disabled={isSaving}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.currentPassword && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input w-full pr-16"
                  autoComplete="new-password"
                  disabled={isSaving}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.newPassword ? (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.newPassword}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Minimum {MIN_PASSWORD_LENGTH} characters, no spaces, and include uppercase, lowercase, number, and special character.
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmNewPassword">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmNewPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="form-input w-full pr-16"
                  autoComplete="new-password"
                  disabled={isSaving}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.confirmNewPassword && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmNewPassword}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!isFormValid || isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner className="!items-center" />
                    Saving...
                  </span>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
     </div>
    </div>
  );
};

export default ChangePasswordModal;
