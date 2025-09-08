"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    constituency: "",
    language: "english",
    gender: "male",
    problem: "Water Supply Dept.",
    awareOfMember: "no" as "yes" | "no",
    memberName: "",
    memberContact: "",
    whatsapp: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCreatedTicket(null);
    setLoading(true);
    try {
      // 1) Get all entries and latest
      const listRes = await fetch("/api/complaint-records", {
        cache: "no-store",
      });
      if (!listRes.ok) throw new Error(`List failed: ${listRes.status}`);
      const list = await listRes.json();
      const last = Array.isArray(list) && list.length > 0 ? list[0] : null;

      // 2) Compute next ticket number (increment numeric part)
      const previous = last?.ticketNumber ?? "0";
      const prevNum = Number(String(previous).replace(/\D+/g, "")) || 0;
      const nextNum = prevNum + 1;
      const ticketNumber = String(nextNum);

      // 3) Current timestamp for createdDate
      const createdDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      // 4) POST to create record
      const payload = {
        ticketNumber,
        address: formData.address,
        constituency: formData.constituency,
        language: formData.language,
        createdDate,
        age: null,
        gender: formData.gender,
        problem: formData.problem,
        pdf_link: "",
        name: formData.name,
        memberName: formData.memberName || null,
        phoneNumber: formData.whatsapp,
        status: null,
        remarks: null,
        memberPhone: formData.memberContact || null,
      };
      const createRes = await fetch("/api/complaint-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!createRes.ok) throw new Error(`Create failed: ${createRes.status}`);
      setCreatedTicket(ticketNumber);
      showToast("success", `Created ticket #${ticketNumber}`);

      // 5) Generate PDF (browser print) with entered information
      const html = buildPrintableHtml({
        ticketNumber,
        name: formData.name,
        address: formData.address,
        constituency: formData.constituency,
        language: formData.language,
        gender: formData.gender,
        problem: formData.problem,
        awareOfMember: formData.awareOfMember,
        memberName: formData.memberName || undefined,
        memberContact: formData.memberContact || undefined,
        whatsapp: formData.whatsapp,
        createdDate,
      });
      const w = window.open("", "_blank", "noopener,noreferrer");
      if (w) {
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
      }

      // 6) Placeholder for Twilio WhatsApp
      sendWhatsAppPlaceholder(formData.whatsapp, ticketNumber);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create record");
      showToast("error", e?.message ?? "Failed to create record");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleAwareOfMemberChange(value: "yes" | "no") {
    setFormData((prev) => ({
      ...prev,
      awareOfMember: value,
      // Clear member fields when switching to no
      memberName: value === "no" ? "" : prev.memberName,
      memberContact: value === "no" ? "" : prev.memberContact,
    }));
  }

  return (
    <div className="bg-gray-50 text-gray-900">
      <section className="mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-semibold">Create Registration</h1>
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={4}
                required
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Constituency */}
            <div>
              <label
                htmlFor="constituency"
                className="block text-sm font-medium text-gray-700"
              >
                Constituency
              </label>
              <input
                id="constituency"
                name="constituency"
                type="text"
                required
                value={formData.constituency}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Whatsapp number */}
            <div>
              <label
                htmlFor="whatsapp"
                className="block text-sm font-medium text-gray-700"
              >
                Whatsapp number
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                inputMode="tel"
                required
                value={formData.whatsapp}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Language */}
            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium text-gray-700"
              >
                Language
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                disabled
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="english">English</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Problem */}
            <div>
              <label
                htmlFor="problem"
                className="block text-sm font-medium text-gray-700"
              >
                Problem
              </label>
              <select
                id="problem"
                name="problem"
                required
                value={formData.problem}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option>Water Supply Dept.</option>
                <option>Solid Wst Mgmt Dept.</option>
                <option>Build. Perm. Dept.</option>
                <option>Street Light Dept.</option>
                <option>Property Tax Dept.</option>
                <option>Police Dept.</option>
                <option>Revenue Dept.</option>
                <option>City Survey Officer</option>
                <option>Stamp & Reg. Dept.</option>
                <option>Slum Rehabilitation</option>
                <option>MSEDCL /Mahavitran</option>
                <option>Co-op Society Dept.</option>
                <option>Health Department</option>
                <option>PMRDA</option>
                <option>Dy. Charity Comm.</option>
                <option>RTO/Transport Dept.</option>
              </select>
            </div>

            {/* Aware of any existing member */}
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700">
                Do you have any reference of Rashtrawadi Congress member?
              </legend>
              <div className="mt-2 flex items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="awareOfMember"
                    value="yes"
                    checked={formData.awareOfMember === "yes"}
                    onChange={() => handleAwareOfMemberChange("yes")}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Yes
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="awareOfMember"
                    value="no"
                    checked={formData.awareOfMember === "no"}
                    onChange={() => handleAwareOfMemberChange("no")}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  No
                </label>
              </div>
            </fieldset>

            {/* Conditional member fields */}
            {formData.awareOfMember === "yes" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="memberName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Member name
                  </label>
                  <input
                    id="memberName"
                    name="memberName"
                    type="text"
                    value={formData.memberName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="memberContact"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Member contact
                  </label>
                  <input
                    id="memberContact"
                    name="memberContact"
                    type="tel"
                    inputMode="tel"
                    value={formData.memberContact}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {createdTicket ? (
              <p className="text-sm text-green-600">
                Created ticket #{createdTicket}
              </p>
            ) : null}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center rounded-md bg-pink-600 px-4 py-2 text-white text-sm font-medium hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </section>
      {/* Snackbar */}
      {toast ? (
        <div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-md px-4 py-2 text-sm shadow-md border ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}

function buildPrintableHtml(data: {
  ticketNumber: string;
  name: string;
  address: string;
  constituency: string;
  language: string;
  gender: string;
  problem: string;
  awareOfMember: "yes" | "no";
  memberName?: string;
  memberContact?: string;
  whatsapp: string;
  createdDate: string;
}) {
  const style = `
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial; padding: 24px; color: #111827; }
      h1 { font-size: 20px; margin: 0 0 16px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
      .row { display: contents; }
      .label { color: #6B7280; font-size: 12px; }
      .value { color: #111827; font-weight: 600; margin-top: 2px; font-size: 14px; }
      .full { grid-column: 1 / -1; }
    </style>
  `;
  const fields = [
    ["Ticket No.", data.ticketNumber],
    ["Created", data.createdDate],
    ["Name", data.name],
    ["Address", data.address, true],
    ["Constituency", data.constituency],
    ["Language", data.language],
    ["Gender", data.gender],
    ["Problem", data.problem, true],
    ["Aware of Member", data.awareOfMember],
    data.memberName ? ["Member Name", data.memberName] : null,
    data.memberContact ? ["Member Contact", data.memberContact] : null,
    ["Whatsapp", data.whatsapp],
  ].filter(Boolean) as Array<[string, string, boolean?]>;

  const detailsHtml = fields
    .map(
      ([label, value, full]) => `
      <div class="row ${full ? "full" : ""}">
        <div class="label">${label}</div>
        <div class="value">${value}</div>
      </div>
    `
    )
    .join("");

  return `
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Ticket ${data.ticketNumber}</title>
        ${style}
      </head>
      <body>
        <h1>Registration Details</h1>
        <div class="grid">${detailsHtml}</div>
      </body>
    </html>
  `;
}

function sendWhatsAppPlaceholder(phone: string, ticket: string) {
  // Placeholder: integrate Twilio WhatsApp API here
  // e.g., call an API route that uses Twilio to send a message
  console.log(
    "[Twilio Placeholder] Send WhatsApp to",
    phone,
    "for ticket",
    ticket
  );
}
