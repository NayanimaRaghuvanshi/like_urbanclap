import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { getBooking } from "@/lib/bookings";
import { BASE, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/config";
import { dateLabel, inr, slotLabel } from "@/lib/format";
import { currentPhone, isAdmin } from "@/lib/session";
import { syncDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invoice", robots: { index: false } };

export default async function Invoice({ params }: { params: { id: string } }) {
  await syncDb();
  const b = getBooking(decodeURIComponent(params.id));
  if (!b || (b.customerPhone !== currentPhone() && !isAdmin())) notFound();
  if (b.status !== "completed")
    return <div className="container-x py-16 text-center"><p>The invoice is available once the job is completed.</p><Link className="btn-primary mt-4" href={`/track/${b.id}`}>Back to booking</Link></div>;
  const q = b.quote;
  const done = [...b.timeline].reverse().find((t) => t.status === "completed");
  return (
    <div className="container-x max-w-3xl py-8">
      <div className="mb-4 flex justify-between print:hidden">
        <Link href={`/track/${b.id}`} className="btn-ghost -ml-3">← Back</Link>
        <PrintButton />
      </div>
      <article className="card p-8 print:border-0 print:shadow-none">
        <header className="flex flex-wrap justify-between gap-4 border-b pb-6">
          <div>
            <p className="font-display text-2xl font-bold text-primary">Home<span className="text-secondary">Serv</span></p>
            <p className="text-sm text-ink-muted">{BASE.name}<br />{SUPPORT_PHONE} · {SUPPORT_EMAIL}<br />GSTIN: <i>to be configured</i></p>
          </div>
          <div className="text-right text-sm">
            <p className="text-lg font-bold">TAX INVOICE</p>
            <p>Invoice #: INV-{b.id.replace("HS-", "")}</p>
            <p>Date: {done ? new Date(done.at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) : dateLabel(b.date)}</p>
            <p>Booking: {b.id}</p>
          </div>
        </header>
        <section className="grid gap-4 py-6 text-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold">Billed to</p>
            <p>{b.customerName}<br />{b.customerPhone}{b.customerEmail && <><br />{b.customerEmail}</>}</p>
          </div>
          <div>
            <p className="font-semibold">Service address</p>
            <p>{b.address.line1}, {b.address.building}<br />{b.address.locality} – {b.address.pin}<br />Service date: {dateLabel(b.date)}, {slotLabel(b.slot)}</p>
          </div>
        </section>
        <table className="w-full text-sm">
          <thead className="border-y bg-slate-50 text-left"><tr><th className="p-2">Service (SAC 9987)</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Rate</th><th className="p-2 text-right">Amount</th></tr></thead>
          <tbody>
            {b.items.map((i) => <tr key={i.serviceId} className="border-b"><td className="p-2">{i.name}</td><td className="p-2 text-right">{i.qty}</td><td className="p-2 text-right">{inr(i.price)}</td><td className="p-2 text-right">{inr(i.price * i.qty)}</td></tr>)}
          </tbody>
        </table>
        <dl className="ml-auto mt-4 w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(q.subtotal)}</dd></div>
          {q.visitingCharge > 0 && <div className="flex justify-between"><dt>Visiting charge</dt><dd>{inr(q.visitingCharge)}</dd></div>}
          {q.discount > 0 && <div className="flex justify-between"><dt>{q.discountLabel}</dt><dd>−{inr(q.discount)}</dd></div>}
          <div className="flex justify-between"><dt>Taxable value</dt><dd>{inr(q.taxable)}</dd></div>
          <div className="flex justify-between"><dt>CGST 9%</dt><dd>{inr(q.gst / 2)}</dd></div>
          <div className="flex justify-between"><dt>SGST 9%</dt><dd>{inr(q.gst - Math.round(q.gst / 2))}</dd></div>
          <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Total</dt><dd>{inr(q.total)}</dd></div>
          <div className="flex justify-between text-ink-muted"><dt>Payment</dt><dd>{b.paymentStatus === "paid" ? `Paid (${b.paymentRef})` : "Pending"}</dd></div>
        </dl>
        <p className="mt-8 text-xs text-ink-muted">This is a computer-generated invoice. Spare parts, if any, were billed separately at MRP.</p>
      </article>
    </div>
  );
}
