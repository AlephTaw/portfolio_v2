"use client";

import { useState } from "react";
import { adminLabelClass } from "./admin-styles";

export function PaymentSection() {
  const [paymentMethod, setPaymentMethod] = useState(false);

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={adminLabelClass}>Payment Method</h2>
          <p className="mt-2 text-sm leading-6 text-white/45">Used for your subscription and in-game purchases.</p>
        </div>
        <button
          className="shrink-0 border border-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-white hover:text-black"
          onClick={() => setPaymentMethod((current) => !current)}
          type="button"
        >
          {paymentMethod ? "Change" : "Add Payment Method"}
        </button>
      </div>
      <p className="mt-5 py-4 text-sm italic text-white/45">
        {paymentMethod ? "Visa ending in 4242 · Expires 12/28" : "No payment method added."}
      </p>
    </section>
  );
}
