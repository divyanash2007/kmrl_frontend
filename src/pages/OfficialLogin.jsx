import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, KeyRound } from 'lucide-react';
import { officialLogin } from '../api/client';

export default function OfficialLogin() {
  const [safeKey, setSafeKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    if (!safeKey.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await officialLogin(safeKey.trim());
      if (res.authenticated) {
        sessionStorage.setItem('kmrl_safe_key', safeKey.trim());
        navigate('/official/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-light mb-3">
            <ShieldCheck size={24} className="text-teal" />
          </div>
          <h1 className="text-xl font-bold text-navy">Official Portal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter the KMRL Safe Key to access the administration console.
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <div>
            <label htmlFor="safeKey" className="block text-sm font-medium text-gray-700 mb-1">
              Safe Key
            </label>
            <div className="relative">
              <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="safeKey"
                type="password"
                value={safeKey}
                onChange={(e) => setSafeKey(e.target.value)}
                placeholder="Enter KMRL Safe Key"
                className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !safeKey.trim()}
            className="w-full flex items-center justify-center gap-2 bg-navy text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-navy-light disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {loading ? 'Verifying...' : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
}

