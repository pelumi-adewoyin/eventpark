import { useState, useEffect, useCallback } from 'react';
import {
  BarChart2, TrendingUp, Users2, AlertCircle, RefreshCw, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { events, invoices, budget } from '../../../lib/api';
import { useNavigate } from 'react-router-dom';

const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');

function fmtShort(n) {
  const num = Number(n || 0);
  if (num >= 1_000_000) return `₦${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `₦${(num / 1_000).toFixed(0)}K`;
  return `₦${num.toLocaleString()}`;
}

function pct(part, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

function ProgressBar({ value, max, color = 'bg-orange-500' }) {
  const width = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

function EmptyCard({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <Icon className="w-8 h-8 text-gray-300" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

export default function CorporateReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgId = user?.orgId;

  const [eventList, setEventList] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);
  const [budgetMap, setBudgetMap] = useState({}); // eventId → budget summary
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!orgId) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);

      const [evRes, invRes] = await Promise.allSettled([
        events.list(),
        invoices.list(orgId),
      ]);

      const evList = evRes.status === 'fulfilled'
        ? (Array.isArray(evRes.value) ? evRes.value : evRes.value?.events || [])
        : [];
      const invList = invRes.status === 'fulfilled'
        ? (Array.isArray(invRes.value) ? invRes.value : invRes.value?.invoices || [])
        : [];

      setEventList(evList);
      setInvoiceList(invList);

      // Fetch budget summaries for each event
      const summaries = {};
      await Promise.allSettled(
        evList.slice(0, 10).map(async ev => {
          try {
            const s = await budget.summary(ev.id);
            summaries[ev.id] = s;
          } catch {
            // no budget for this event
          }
        })
      );
      setBudgetMap(summaries);
    } catch (err) {
      setError(err.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Vendor spend aggregation from invoices
  const vendorSpend = (() => {
    const map = {};
    invoiceList
      .filter(inv => (inv.status || '').toLowerCase() === 'paid')
      .forEach(inv => {
        const name = inv.vendor_name || inv.vendor_id || 'Unknown vendor';
        map[name] = (map[name] || 0) + Number(inv.total || inv.amount || 0);
      });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  })();

  // Event spend summary from budget map
  const eventSpendRows = eventList.map(ev => {
    const s = budgetMap[ev.id];
    const budgetTotal = s?.total_budget ?? s?.budget ?? 0;
    const committed = s?.committed ?? s?.total_committed ?? 0;
    const paid = s?.paid ?? s?.total_paid ?? 0;
    const remaining = Math.max(0, budgetTotal - paid);
    return { id: ev.id, title: ev.title || ev.name, budgetTotal, committed, paid, remaining };
  }).filter(r => r.budgetTotal > 0 || r.paid > 0);

  const hasAnyData = eventList.length > 0 || invoiceList.length > 0;

  return (
    <div className="p-4 sm:p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Reports</h2>
          <p className="text-sm text-gray-400 mt-0.5">Spend summaries, vendor analysis, and budget variance.</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors bg-white">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-gray-600">{error}</p>
          <button onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {!loading && !error && !hasAnyData && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
            <BarChart2 className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">Reports populate as you use EventPark</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Once you have events, vendor bookings, and invoices, this page will show spend summaries, vendor analysis, and budget variance reports.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/events')}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors">
            Create your first event
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {!loading && !error && hasAnyData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Card 1: Event Spend Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-gray-900 text-sm">Event Spend Summary</h3>
            </div>
            {eventSpendRows.length === 0 ? (
              <EmptyCard icon={TrendingUp} message="No budgets set up yet. Add budgets to your events to see spend here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50">
                      <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Event</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500">Budget</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500">Paid</th>
                      <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500">Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {eventSpendRows.map(row => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-800 max-w-[130px] truncate text-xs">{row.title}</td>
                        <td className="px-3 py-3 text-right text-gray-600 text-xs">{fmtShort(row.budgetTotal)}</td>
                        <td className="px-3 py-3 text-right text-green-600 font-semibold text-xs">{fmtShort(row.paid)}</td>
                        <td className="px-5 py-3 text-right text-gray-700 font-semibold text-xs">{fmtShort(row.remaining)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Card 2: Vendor Spend */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Users2 className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-gray-900 text-sm">Vendor Spend</h3>
            </div>
            {vendorSpend.length === 0 ? (
              <EmptyCard icon={Users2} message="No paid invoices yet. Spend by vendor will appear here." />
            ) : (
              <div className="p-5 space-y-4">
                {vendorSpend.map(([name, amount]) => {
                  const maxSpend = vendorSpend[0][1];
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[60%]">{name}</span>
                        <span className="text-sm font-bold text-gray-900">{fmtShort(amount)}</span>
                      </div>
                      <ProgressBar value={amount} max={maxSpend} color="bg-orange-500" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 3: Budget vs Actual */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-gray-900 text-sm">Budget vs Actual</h3>
            </div>
            {eventSpendRows.length === 0 ? (
              <EmptyCard icon={BarChart2} message="Set budgets on your events to compare plan vs actual spend." />
            ) : (
              <div className="p-5 space-y-5">
                {eventSpendRows.map(row => (
                  <div key={row.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700 truncate max-w-[55%]">{row.title}</span>
                      <span className="text-xs text-gray-500">
                        {pct(row.paid, row.budgetTotal)}% used
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-14">Budget</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-gray-300 rounded-full w-full" />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 w-16 text-right">{fmtShort(row.budgetTotal)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-14">Paid</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${row.paid > row.budgetTotal ? 'bg-red-500' : 'bg-orange-500'}`}
                            style={{ width: `${Math.min(100, pct(row.paid, row.budgetTotal))}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold w-16 text-right ${row.paid > row.budgetTotal ? 'text-red-600' : 'text-orange-600'}`}>
                          {fmtShort(row.paid)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 4: Monthly Spend Trend — placeholder */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-gray-900 text-sm">Monthly Spend Trend</h3>
            </div>
            <div className="flex flex-col items-center gap-3 py-14 text-center px-6">
              <div className="flex items-end gap-1.5 h-16 opacity-20">
                {[30, 55, 40, 70, 50, 85, 60].map((h, i) => (
                  <div
                    key={i}
                    className="w-6 bg-orange-500 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <p className="text-sm font-semibold text-gray-500">Chart coming soon</p>
              <p className="text-xs text-gray-400">
                Monthly spend trend will display here once you have sufficient transaction history.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
