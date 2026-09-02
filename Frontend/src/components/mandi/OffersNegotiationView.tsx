import React, { useState } from 'react';
import {
  FileCheck2,
  Lock,
  ArrowRight,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  DollarSign,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { Offer, SmartDeal } from '../../types/mandi';

interface OffersNegotiationViewProps {
  offers: Offer[];
  onAcceptOffer: (offer: Offer) => void;
  onCounterOffer: (offerId: string, counterPrice: number, counterQty: number) => void;
}

export function OffersNegotiationView({
  offers,
  onAcceptOffer,
  onCounterOffer,
}: OffersNegotiationViewProps) {
  const [selectedOffer, setSelectedOffer] = useState<Offer>(offers[0]);
  const [counterPrice, setCounterPrice] = useState<number>(2900);
  const [counterQty, setCounterQty] = useState<number>(100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-forest" />
            My Offers & Digital Negotiation Timeline
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-ivory-200/70 mt-0.5">
            Every price or term adjustment creates an audited agreement version.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-forest bg-forest/10 px-3 py-1.5 rounded-xl border border-forest/20 self-start sm:self-auto">
          {offers.length} Active Negotiations
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Offers List */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted font-mono">
            Offers Inbox
          </h3>

          {offers.map((ofr) => (
            <div
              key={ofr.id}
              onClick={() => setSelectedOffer(ofr)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedOffer.id === ofr.id
                  ? 'bg-forest/10 dark:bg-forest/20 border-forest text-charcoal dark:text-ivory-100 shadow-sm'
                  : 'bg-white dark:bg-[#17211d] border-ivory-300 dark:border-[#26362f] hover:border-forest/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xs font-mono font-bold text-forest uppercase bg-forest/10 px-2 py-0.5 rounded">
                  {ofr.crop}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ofr.status === 'Countered'
                      ? 'bg-amber-100 text-amber-800'
                      : ofr.status === 'Accepted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-ivory-200 text-charcoal-muted'
                  }`}
                >
                  {ofr.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-charcoal dark:text-ivory-100 mt-2">
                {ofr.buyerName}
              </h4>

              <div className="flex items-baseline justify-between pt-2 border-t border-ivory-200 dark:border-[#26362f] mt-2">
                <span className="text-xs text-charcoal-muted font-mono">{ofr.quantityQuintals} Quintals</span>
                <span className="text-base font-extrabold font-mono text-forest">
                  ₹{ofr.offeredPricePerQuintal}/q
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Active Negotiation & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {selectedOffer && (
            <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card space-y-6">
              {/* Offer Header Detail */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 dark:border-[#26362f] pb-4">
                <div>
                  <span className="text-2xs font-mono text-charcoal-muted uppercase block">Buyer Offer Details</span>
                  <h3 className="text-xl font-bold text-charcoal dark:text-ivory-100">
                    {selectedOffer.buyerName}
                  </h3>
                  <span className="text-xs text-charcoal-muted font-mono">{selectedOffer.crop} • {selectedOffer.quantityQuintals} Quintals</span>
                </div>

                <div className="text-right">
                  <span className="text-2xs text-charcoal-muted font-mono block">Current Offered Price</span>
                  <span className="text-2xl font-extrabold font-mono text-forest">
                    ₹{selectedOffer.offeredPricePerQuintal} <span className="text-xs text-charcoal-muted font-normal">/ quintal</span>
                  </span>
                </div>
              </div>

              {/* Offer Terms Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-ivory-100/50 dark:bg-charcoal/40 p-4 rounded-xl">
                <div>
                  <span className="text-2xs text-charcoal-muted block">Quality Specs</span>
                  <span className="font-bold text-charcoal dark:text-ivory-100">{selectedOffer.qualityCondition}</span>
                </div>
                <div>
                  <span className="text-2xs text-charcoal-muted block">Pickup Terms</span>
                  <span className="font-bold text-charcoal dark:text-ivory-100">{selectedOffer.pickupType}</span>
                </div>
                <div>
                  <span className="text-2xs text-charcoal-muted block">Payment Terms</span>
                  <span className="font-bold text-charcoal dark:text-ivory-100">Within {selectedOffer.paymentTermsDays} Days</span>
                </div>
                <div>
                  <span className="text-2xs text-charcoal-muted block">Transport</span>
                  <span className="font-bold text-forest">{selectedOffer.transportResponsibility}</span>
                </div>
              </div>

              {/* Versioned Negotiation Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted font-mono flex items-center gap-1.5">
                  <History className="w-4 h-4 text-forest" />
                  Negotiation History Audit Log
                </h4>

                <div className="space-y-2 relative border-l-2 border-ivory-300 dark:border-[#26362f] ml-3 pl-4">
                  {selectedOffer.negotiationTimeline.map((item, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <span className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-forest border-2 border-white dark:border-[#17211d]" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold font-mono text-charcoal dark:text-ivory-100">
                          Version {item.version.toFixed(1)} ({item.by === 'buyer' ? 'Buyer Proposal' : 'Farmer Counter'})
                        </span>
                        <span className="text-2xs text-charcoal-muted font-mono">{item.timestamp}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-ivory-100/50 dark:bg-charcoal/40 text-xs flex justify-between items-center font-mono">
                        <span>Price: <strong>₹{item.price}/q</strong> | Qty: <strong>{item.quantity} q</strong></span>
                        <span className="text-2xs text-charcoal-muted italic">{item.notes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Counter Offer Input Panel */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                  Submit Counter Offer Proposal
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-2xs font-semibold text-charcoal-muted block mb-1">
                      Counter Price (₹ / quintal)
                    </label>
                    <input
                      type="number"
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-white dark:bg-[#17211d] font-mono font-bold text-xs text-charcoal dark:text-ivory-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-2xs font-semibold text-charcoal-muted block mb-1">
                      Quantity (quintals)
                    </label>
                    <input
                      type="number"
                      value={counterQty}
                      onChange={(e) => setCounterQty(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-white dark:bg-[#17211d] font-mono font-bold text-xs text-charcoal dark:text-ivory-100 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onCounterOffer(selectedOffer.id, counterPrice, counterQty)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-300 bg-white dark:bg-[#17211d] text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Counter Offer (v1.3)
                  </button>

                  <button
                    type="button"
                    onClick={() => onAcceptOffer(selectedOffer)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 transition-all shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Accept Terms & Lock Smart Deal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
