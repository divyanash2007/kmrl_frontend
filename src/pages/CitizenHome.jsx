import { useState } from 'react';
import { Send, MapPin, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { createGuestSession, submitTicket } from '../api/client';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';

export default function CitizenHome() {
  const [query, setQuery] = useState('');
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function captureGPS() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setGpsEnabled(true);
      },
      () => setGpsEnabled(false),
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (query.trim().length < 5) {
      setError('Please describe your query in at least 5 characters.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const session = await createGuestSession();
      const payload = {
        query_text: query.trim(),
        guest_session_id: session.id,
        ...(coords && {
          user_latitude: coords.latitude,
          user_longitude: coords.longitude,
          location_accuracy: coords.accuracy,
        }),
      };
      const ticket = await submitTicket(payload);
      setResult(ticket);
      setQuery('');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function copyTicketId() {
    if (result?.id) {
      navigator.clipboard.writeText(result.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Raise a Query or Grievance</h1>
        <p className="text-sm text-gray-500 mt-1">
          Describe your concern. Our AI system will classify, prioritize, and provide instant guidance based on official KMRL policies.
        </p>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
            Your Query
          </label>
          <textarea
            id="query"
            rows={4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., The escalator at Edappally station is not working..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none"
            disabled={loading}
          />
        </div>

        {/* GPS Toggle */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={captureGPS}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors ${
              gpsEnabled
                ? 'border-teal bg-teal-light text-teal-dark'
                : 'border-gray-300 text-gray-500 hover:border-teal hover:text-teal'
            }`}
          >
            <MapPin size={13} />
            {gpsEnabled ? 'GPS Captured' : 'Attach Location (optional)'}
          </button>

          {gpsEnabled && coords && (
            <span className="text-[11px] text-gray-400">
              {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)} (±{coords.accuracy.toFixed(0)}m)
            </span>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || query.trim().length < 5}
          className="w-full flex items-center justify-center gap-2 bg-teal text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {loading ? 'Processing with AI...' : 'Submit Query'}
        </button>
      </form>

      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          {/* Ticket Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-navy">{result.id}</h2>
                <button onClick={copyTicketId} className="text-gray-400 hover:text-teal" title="Copy Ticket ID">
                  {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Save this ID to track your query later</p>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={result.priority} />
              <StatusBadge status={result.status} />
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-gray-50 rounded-md p-2.5">
              <span className="text-gray-400 block">Category</span>
              <span className="font-medium text-gray-700">{result.predicted_category}</span>
            </div>
            <div className="bg-gray-50 rounded-md p-2.5">
              <span className="text-gray-400 block">Confidence</span>
              <span className="font-medium text-gray-700">{(result.classification_confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="bg-gray-50 rounded-md p-2.5">
              <span className="text-gray-400 block">SLA</span>
              <span className="font-medium text-gray-700">{result.sla_hours} hours</span>
            </div>
          </div>

          {/* AI Response */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1.5">AI Resolution & Guidance</h3>
            <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {result.ai_response}
            </div>
          </div>

          {result.requires_human_intervention && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
              ⚠️ This ticket has been automatically escalated to the KMRL official intervention queue for immediate attention.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

