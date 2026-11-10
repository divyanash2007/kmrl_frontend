import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Loader2, ThumbsUp, HandHelping, MessageSquare } from 'lucide-react';
import { trackTicket, submitFeedback } from '../api/client';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';

export default function TrackQuery() {
  const { ticketId: paramId } = useParams();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState(paramId || '');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (paramId) handleSearch(paramId);
  }, [paramId]);

  async function handleSearch(id) {
    const target = (id || searchId).trim();
    if (!target) return;
    setLoading(true);
    setError('');
    setTicket(null);

    try {
      const data = await trackTicket(target);
      setTicket(data);
      if (!paramId) navigate(`/track/${target}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFeedback(satisfied) {
    if (!ticket) return;
    setFeedbackLoading(true);
    try {
      const updated = await submitFeedback(ticket.id, {
        is_user_satisfied: satisfied,
        user_feedback_comment: feedbackComment || null,
      });
      setTicket(updated);
      setFeedbackComment('');
    } catch (err) {
      setError(err.message);
    } finally {
      setFeedbackLoading(false);
    }
  }

  const showFeedback =
    ticket &&
    ticket.is_user_satisfied === null &&
    !['OFFICIAL_RESOLVED', 'CLOSED'].includes(ticket.status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Track Your Query</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter your ticket ID to view the resolution status and AI guidance.
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value.toUpperCase())}
          placeholder="e.g. KMRL-2026-X8F2"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading || !searchId.trim()}
          className="flex items-center gap-1.5 bg-teal text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-teal-dark disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          Search
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Ticket Detail */}
      {ticket && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy">{ticket.id}</h2>
              <p className="text-xs text-gray-400">
                Submitted {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          {/* Original Query */}
          <div className="bg-gray-50 rounded-md p-3">
            <span className="text-xs text-gray-400 block mb-1">Your Query</span>
            <p className="text-sm text-gray-700">{ticket.query_text}</p>
          </div>

          {/* Meta Row */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-gray-50 rounded-md p-2.5">
              <span className="text-gray-400 block">Category</span>
              <span className="font-medium text-gray-700">{ticket.predicted_category}</span>
            </div>
            <div className="bg-gray-50 rounded-md p-2.5">
              <span className="text-gray-400 block">Confidence</span>
              <span className="font-medium text-gray-700">{(ticket.classification_confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="bg-gray-50 rounded-md p-2.5">
              <span className="text-gray-400 block">SLA</span>
              <span className="font-medium text-gray-700">{ticket.sla_hours} hours</span>
            </div>
          </div>

          {/* AI Response */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1.5">AI Resolution & Guidance</h3>
            <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {ticket.ai_response}
            </div>
          </div>

          {/* Official Notes */}
          {ticket.official_notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h3 className="text-sm font-semibold text-blue-700 mb-1">Official Resolution Notes</h3>
              <p className="text-sm text-blue-600">{ticket.official_notes}</p>
              <p className="text-xs text-blue-400 mt-1">
                Resolved by {ticket.official_id} on {new Date(ticket.resolved_at).toLocaleString()}
              </p>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Was this helpful?</h3>
              <textarea
                rows={2}
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Optional: Tell us more..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleFeedback(true)}
                  disabled={feedbackLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <ThumbsUp size={14} /> Satisfied
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  disabled={feedbackLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  <HandHelping size={14} /> Need Human Help
                </button>
              </div>
            </div>
          )}

          {/* Feedback State Shown */}
          {ticket.is_user_satisfied !== null && (
            <div className={`rounded-md p-3 text-sm ${ticket.is_user_satisfied ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
              <MessageSquare size={14} className="inline mr-1" />
              {ticket.is_user_satisfied
                ? 'You marked this as resolved. Thank you for using CiviSeva!'
                : 'Escalated to KMRL officials. You will receive a resolution update.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

