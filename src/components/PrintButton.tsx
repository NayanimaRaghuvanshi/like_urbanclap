"use client";
export function PrintButton() {
  return <button className="btn-primary print:hidden" onClick={() => window.print()}>Download / Print PDF</button>;
}
