import { useMemo, useState } from 'react';
import { Bot, Loader2, Send, ShieldCheck, Sparkles } from 'lucide-react';
import type { WorkOrder } from '@/services/auditService';

interface Props {
  workOrders: WorkOrder[];
  selectedWork?: WorkOrder | null;
}

const QUICK_PROMPTS = [
  'Summarize the highest-risk cases and explain why they need attention first.',
  'Explain the financial and progress signals for the riskiest project.',
  'What should an audit officer verify before taking action?',
];

function compactRecord(work: WorkOrder) {
  return {
    work_id: work.work_id,
    title: work.work_title || 'Monitored work',
    constituency: work.constituency,
    budget: work.budget,
    expenditure: work.total_expenditure,
    payments: work.total_payments_released,
    physical_progress: work.physical_progress_percentage,
    expected_progress: work.expected_progress_percentage,
    delay_days: work.delay_days,
    risk_score: work.risk_score,
    risk_level: work.risk_level,
    status: work.status,
    is_demo_data: work.is_demo_data,
  };
}

export function AuditCopilot({ workOrders, selectedWork }: Props) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const context = useMemo(() => {
    const records = selectedWork ? [selectedWork, ...workOrders.filter((w) => w.work_id !== selectedWork.work_id)] : workOrders;
    return records.slice(0, 12).map(compactRecord);
  }, [selectedWork, workOrders]);

  const ask = async (prompt = question) => {
    const clean = prompt.trim();
    if (!clean || busy) return;
    setBusy(true);
    setError('');
    setAnswer('');
    try {
      const response = await fetch('/api/audit-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: clean, selectedWork: selectedWork ? compactRecord(selectedWork) : null, records: context }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'The AI service could not answer this request.');
      setAnswer(String(payload.answer || 'No answer was returned.'));
      setQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The AI service is unavailable.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-50 p-2"><Bot className="h-5 w-5 text-emerald-700" /></div>
            <div>
              <div className="flex items-center gap-2"><h2 className="text-sm font-bold text-slate-900">AI Audit Copilot</h2><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-emerald-700">LLM</span></div>
              <p className="mt-1 text-[10px] text-slate-500">Gemini-powered investigation assistant grounded only in the records supplied to DRISHTI.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-600" />No government record is invented by the assistant.</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button key={prompt} type="button" onClick={() => void ask(prompt)} disabled={busy} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-50">
            {prompt}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void ask(); }} placeholder="Ask about risk, expenditure, delay, evidence or the next audit step…" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
        <button type="button" onClick={() => void ask()} disabled={!question.trim() || busy} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Ask
        </button>
      </div>

      {busy && <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-800"><Sparkles className="mr-2 inline h-4 w-4" />Analysing the supplied audit context…</div>}
      {error && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">{error}<div className="mt-1 text-[10px] text-rose-600">Add the server-side GEMINI_API_KEY environment variable to enable the live LLM.</div></div>}
      {answer && <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700"><Sparkles className="h-3.5 w-3.5" />Grounded AI response</div><div className="whitespace-pre-wrap text-xs leading-6 text-slate-700">{answer}</div></div>}
    </section>
  );
}
