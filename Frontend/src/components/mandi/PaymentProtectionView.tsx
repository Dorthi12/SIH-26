import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  DollarSign,
  Truck,
  FileCheck,
  Info,
  RefreshCw,
} from 'lucide-react';
import type { SmartDeal, PaymentProtectionState } from '../../types/mandi';

interface PaymentProtectionViewProps {
  deals: SmartDeal[];
}

export function PaymentProtectionView({ deals }: PaymentProtectionViewProps) {
  const [activeDealState, setActiveDealState] = useState<PaymentProtectionState>('Payment Protected');
  const [disputeOpened, setDisputeOpened] = useState(false);

  const steps: PaymentProtectionState[] = [
    'Pending',
    'Protection Requested',
    'Payment Protected',
    'Awaiting Delivery',
    'Delivery Submitted',
    'Delivery Confirmed',
    'Release Pending',
    'Payment Released',
  ];

  const currentStepIdx = steps.indexOf(activeDealState);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Demo Escrow Legal Notice Banner ─────────────────────────────── */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 shadow-card flex items-start gap-4">
        <Lock className="w-6 h-6 text-amber shrink-0 mt-1" />
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-charcoal dark:text-ivory-100">
              🔒 Demo Payment Protection Escrow Workflow
            </span>
            <span className="bg-amber text-charcoal text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase">
              Prototype Simulator
            </span>
          </div>
          <p className="text-charcoal-muted dark:text-ivory-200/80 leading-relaxed">
            "Production implementation requires a regulated payment/escrow banking partner under RBI guidelines. Agrisense provides automated multi-party state tracking and evidence verification."
          </p>
        </div>
      </div>

      {/* ── Active Deal Escrow Pipeline ─────────────────────────────────── */}
      <div className="bg-white dark:bg-[#17211d] rounded-3xl border border-ivory-300 dark:border-[#26362f] p-6 lg:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 dark:border-[#26362f] pb-4">
          <div>
            <span className="text-2xs font-mono font-bold text-forest uppercase">Escrow Case ID: ESC-9901</span>
            <h3 className="text-xl font-bold text-charcoal dark:text-ivory-100">
              Deal: 150 Quintals Wheat (HD-2967)
            </h3>
            <p className="text-xs text-charcoal-muted font-mono">
              Total Protected Value: <strong className="text-amber">₹4,30,500</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xs text-charcoal-muted font-mono block">Current Escrow State</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              {activeDealState}
            </span>
          </div>
        </div>

        {/* Visual Multi-step State Pipeline */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted font-mono">
            Payment Protection Step Pipeline
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {steps.map((step, idx) => {
              const isDone = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div
                  key={step}
                  className={`p-2.5 rounded-xl border text-center text-xs space-y-1 transition-all ${
                    isCurrent
                      ? 'bg-forest text-white border-forest shadow-md font-bold'
                      : isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'bg-ivory-100/50 dark:bg-charcoal/30 border-ivory-200 dark:border-[#26362f] text-charcoal-muted opacity-60'
                  }`}
                >
                  <span className="text-[10px] font-mono block font-bold">Step {idx + 1}</span>
                  <span className="text-[11px] leading-tight block">{step}</span>
                  {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-600 mx-auto" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* State Simulation Controls */}
        <div className="p-5 rounded-2xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-forest" />
              Simulate Payment Escrow State Transitions
            </h4>
            <span className="text-2xs font-mono text-charcoal-muted">Prototype Interactive Controls</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveDealState('Payment Protected')}
              className="px-3.5 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 transition-all shadow-sm"
            >
              1. Protect Funds (Buyer Deposited)
            </button>

            <button
              type="button"
              onClick={() => setActiveDealState('Delivery Submitted')}
              className="px-3.5 py-2 rounded-xl bg-amber text-charcoal text-xs font-bold hover:bg-amber-400 transition-all shadow-sm"
            >
              2. Submit Produce Delivery
            </button>

            <button
              type="button"
              onClick={() => setActiveDealState('Delivery Confirmed')}
              className="px-3.5 py-2 rounded-xl border border-ivory-300 bg-white dark:bg-[#17211d] text-charcoal text-xs font-semibold hover:border-forest/30 transition-all"
            >
              3. Confirm Delivery (Buyer)
            </button>

            <button
              type="button"
              onClick={() => setActiveDealState('Payment Released')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
            >
              4. Release Payment to Farmer
            </button>
          </div>
        </div>

        {/* Escrow Audit Log */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted font-mono">
            Protected Escrow Audit Trail
          </h4>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-900 dark:text-emerald-200 flex justify-between">
              <span>✓ 2026-09-02 11:30 — Buyer deposited ₹4,30,500 into simulated escrow buffer.</span>
              <span className="font-bold">VERIFIED</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-900 dark:text-emerald-200 flex justify-between">
              <span>✓ 2026-09-02 14:10 — Transport truck dispatches 150 quintals from Barabanki Plot A.</span>
              <span className="font-bold">IN TRANSIT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
