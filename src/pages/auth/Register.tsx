import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Upload } from 'lucide-react';
import Select from 'react-select';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { specializations } from '../../types/counselor';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, loading, error, clearError } = useAuthStore(state => ({
    register: state.register,
    loading: state.loading,
    error: state.error,
    clearError: state.clearError
  }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }

    if (!username.trim()) {
      setPasswordError('Username is required');
      return false;
    }

    if (!bio.trim()) {
      setPasswordError('Bio is required');
      return false;
    }

    if (!fileInputRef.current?.files?.[0]) {
      setPasswordError('Profile image is required');
      return false;
    }

    if (selectedSpecializations.length === 0) {
      setPasswordError('Please select at least one specialization');
      return false;
    }

    if (!agreeToTerms) {
      setPasswordError('Please agree to the terms and conditions');
      return false;
    }

    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const profileImage = fileInputRef.current?.files?.[0];
    if (!profileImage) return;

    await register(
      email,
      password,
      username,
      profileImage,
      bio,
      selectedSpecializations
    );
  };

  const showTermsAndConditions = () => {
    Swal.fire({
      title: '<div class="text-2xl font-bold text-gray-900 mb-4">Terms and Conditions</div>',
      html: `
        <div class="text-left max-h-[70vh] overflow-y-auto px-4 py-2" style="scrollbar-width: thin;">
          <div class="mb-6">
            <h3 class="text-xl font-bold text-blue-700 mb-3 flex items-center">
              <span class="inline-block p-2 bg-blue-100 rounded-full mr-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </span>
              Calm Minds Web App - Counselor Agreement
            </h3>
            <p class="text-gray-600 leading-relaxed">Welcome to the Calm Minds Counselor Web App. These Terms and Conditions govern your use of our platform and services. Please read them carefully.</p>
          </div>

          <div class="space-y-8">
            <div class="p-4 bg-gray-50 rounded-lg">
              <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span class="inline-block p-2 bg-green-100 rounded-full mr-3">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </span>
                1. Eligibility
              </h4>
              <div class="ml-12">
                <p class="text-gray-700 mb-2">To register as a counselor, you must:</p>
                <ul class="list-disc text-gray-600 ml-6 space-y-1">
                  <li>Be a licensed mental health professional or under supervision</li>
                  <li>Provide accurate and verifiable information</li>
                </ul>
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded-lg">
              <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span class="inline-block p-2 bg-blue-100 rounded-full mr-3">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </span>
                2. Account Responsibility
              </h4>
              <div class="ml-12">
                <ul class="list-disc text-gray-600 ml-6 space-y-1">
                  <li>Maintain login credential security</li>
                  <li>Keep profile information current</li>
                  <li>Use platform for professional purposes only</li>
                </ul>
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded-lg">
              <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span class="inline-block p-2 bg-purple-100 rounded-full mr-3">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                  </svg>
                </span>
                3. Platform Usage
              </h4>
              <div class="ml-12">
                <ul class="list-disc text-gray-600 ml-6 space-y-1">
                  <li>Session management and scheduling</li>
                  <li>Secure client communications</li>
                  <li>Access to shared mental health data</li>
                </ul>
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded-lg">
              <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span class="inline-block p-2 bg-yellow-100 rounded-full mr-3">
                  <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                4. Data Protection & Privacy
              </h4>
              <div class="ml-12">
                <ul class="list-disc text-gray-600 ml-6 space-y-1">
                  <li>End-to-end encrypted storage</li>
                  <li>Strict confidentiality policies</li>
                  <li>Data usage restrictions</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 class="text-lg font-semibold text-blue-900 mb-2 flex items-center">
              <span class="inline-block p-2 bg-blue-100 rounded-full mr-3">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </span>
              Contact Us
            </h4>
            <p class="text-blue-800 ml-12">
              For questions about these terms, contact us at:
              <a href="mailto:support@calmmindsapp.com" class="text-blue-600 hover:underline ml-1">support@calmmindsapp.com</a>
            </p>
          </div>
        </div>
      `,
      showCloseButton: true,
      confirmButtonText: 'I Understand',
      confirmButtonColor: '#3B82F6',
      customClass: {
        container: 'terms-modal',
        popup: 'rounded-lg',
        content: 'rounded-lg',
      },
      width: '800px',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <BrainCircuit className="h-16 w-16 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={clearError}
                      className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex justify-center">
              <div className="relative">
                <div 
                  className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile preview" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="mt-2 text-xs text-center text-gray-500">
                  Click to upload profile picture
                </p>
              </div>
            </div>
            
            <Input
              id="username"
              label="Username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
            />
            
            <Input
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              fullWidth
            />
            
            <Input
              id="confirm-password"
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Specializations
              </label>
              <div className="mt-1">
                <Select
                  isMulti
                  options={specializations}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  onChange={setSelectedSpecializations}
                  placeholder="Select your areas of expertise"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Professional Bio
              </label>
              <div className="mt-1">
                <textarea
                  id="bio"
                  rows={4}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Tell us about your experience and approach to counseling"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={showTermsAndConditions}
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  Terms and Conditions
                </button>
              </label>
            </div>
            
            <Button
              type="submit"
              fullWidth
              isLoading={loading}
              disabled={!agreeToTerms}
            >
              Register
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;