import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Users, CheckCircle2, AlertCircle, Clock, Loader2,
  MapPin, FileText, LogOut, RefreshCw,
} from 'lucide-react';
import { getAnalytics, getEscalationQueue, resolveTicket } from '../api/client';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';

export default function OfficialDashboard() {
  const navigate = useNavigate();
  const safeKey = sessionStorage.getItem('kmrl_safe_key');

  const [analytics, setAnalytics] = useState(null);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [resolveModal, setResolveModal] = useState(null);
  const [resolveForm, setResolveForm] = useState({ official_id: '', official_notes: '' });
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveError, setResolveError] = useState('');

  useEffect(() => {
    if (!safeKey) { navigate('/official'); return; }
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [analyticsData, queueData] = await Promise.all([
        getAnalytics(safeKey),
        getEscalationQueue(safeKey),
      ]);
      setAnalytics(analyticsData);
      setQueue(queueData);
    } catch {
      sessionStorage.removeItem('kmrl_safe_key');
      navigate('/official');
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve() {
    if (!resolveModal || !resolveForm.official_id || !resolveForm.official_notes) return;
    setResolveLoading(true);
    setResolveError('');
    try {
      await resolveTicket(resolveModal.id, {
        official_id: resolveForm.official_id.trim(),
        official_notes: resolveForm.official_notes.trim(),
        outcome: 'OFFICIAL_RESOLVED',
      }, safeKey);
      setResolveModal(null);
      setResolveForm({ official_id: '', official_notes: '' });
      await loadData();
    } catch (err) {
      setResolveError(err.message || 'Failed to record resolution.');
    } finally {
      setResolveLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('kmrl_safe_key');
    navigate('/official');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 size={28} className="animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Official Dashboard</h1>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="flex items-center gap-1 text-xs text-gray-500 hover:text-teal px-2 py-1 rounded border border-gray-200 hover:border-teal transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 px-2 py-1 rounded border border-gray-200 hover:border-red-300 transition-colors">
            <LogOut size={12} /> Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'queue', label: 'Escalation Queue', icon: AlertCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-teal text-teal'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={15} /> {tab.label}
            {tab.id === 'queue' && queue && (
              <span className="ml-1 bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {queue.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Queries', value: analytics.total_queries, icon: Users, color: 'text-navy' },
              { label: 'Auto-Resolved', value: analytics.auto_resolved_count, icon: CheckCircle2, color: 'text-teal' },
              { label: 'Escalated', value: analytics.escalated_count, icon: AlertCircle, color: 'text-red-600' },
              { label: 'FCR Rate', value: `${analytics.first_contact_resolution_rate}%`, icon: Clock, color: 'text-green-600' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <kpi.icon size={15} className={kpi.color} />
                  <span className="text-xs text-gray-500">{kpi.label}</span>
                </div>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Breakdowns */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">By Category</h3>
              <div className="space-y-2">
                {Object.entries(analytics.category_breakdown).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate">{cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal rounded-full"
                          style={{ width: `${analytics.total_queries ? (count / analytics.total_queries) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">By Priority</h3>
              <div className="space-y-2">
                {Object.entries(analytics.priority_breakdown).map(([pri, count]) => (
                  <div key={pri} className="flex items-center justify-between text-sm">
                    <PriorityBadge priority={pri} />
                    <span className="text-xs text-gray-500 font-medium">{count}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3">
                <h4 className="text-xs text-gray-400 mb-2">By Status</h4>
                {Object.entries(analytics.status_breakdown).map(([st, count]) => (
                  <div key={st} className="flex items-center justify-between text-sm mb-1">
                    <StatusBadge status={st} />
                    <span className="text-xs text-gray-500 font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escalation Queue Tab */}
      {activeTab === 'queue' && queue && (
        <div className="space-y-3">
          {queue.items.length === 0 ? (
            <div className="text-center text-gray-400 py-12 text-sm">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400" />
              No tickets in queue. All clear!
            </div>
          ) : (
            queue.items.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy text-sm">{ticket.id}</span>
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ticket.predicted_category} · {new Date(ticket.created_at).toLocaleString()}
                    </p>
                  </div>
                  {ticket.user_latitude && (
                    <a
                      href={`https://www.google.com/maps?q=${ticket.user_latitude},${ticket.user_longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-teal hover:underline"
                    >
                      <MapPin size={11} /> GPS
                    </a>
                  )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{ticket.query_text}</p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setResolveModal(ticket);
                      setResolveError('');
                    }}
                    className="flex items-center gap-1 text-xs bg-navy text-white px-3 py-1.5 rounded-md hover:bg-navy-light transition-colors"
                  >
                    <FileText size={12} /> Resolve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setResolveModal(null)}>
          <div className="bg-white rounded-lg w-full max-w-md p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-navy">Resolve {resolveModal.id}</h2>
            <p className="text-sm text-gray-500 line-clamp-3">{resolveModal.query_text}</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Official ID / Badge</label>
              <input
                type="text"
                value={resolveForm.official_id}
                onChange={(e) => setResolveForm({ ...resolveForm, official_id: e.target.value })}
                placeholder="e.g. KMRL-OFFICER-409"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes</label>
              <textarea
                rows={3}
                value={resolveForm.official_notes}
                onChange={(e) => setResolveForm({ ...resolveForm, official_notes: e.target.value })}
                placeholder="Describe the investigation and resolution actions taken..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal resize-none"
              />
            </div>

            {resolveError && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {resolveError}
              </p>
            )}

            <div className="flex gap-2">
              <button onClick={() => setResolveModal(null)} className="flex-1 text-sm px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={resolveLoading || !resolveForm.official_id.trim() || !resolveForm.official_notes.trim()}
                className="flex-1 flex items-center justify-center gap-1 text-sm bg-teal text-white px-3 py-2 rounded-md hover:bg-teal-dark disabled:opacity-50 transition-colors"
              >
                {resolveLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

