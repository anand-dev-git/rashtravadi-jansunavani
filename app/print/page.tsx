"use client";
import { useState } from "react";
import AuthGuard from "@/components/auth-guard";
import { generateTicketPDF, generatePrintableHTML } from "@/lib/pdf-generator";

type RegistrationDetails = {
  status: string;
  member: string;
  remarks: string;
  ticketNumber: string;
  name: string;
  address: string;
  constituency: string;
  language: string;
  gender: string;
  problem: string;
  awareOfMember: "yes" | "no";
  memberName?: string;
  dbEmp?: string;
  memberContact?: string;
  whatsapp: string;
};

function PrintPageContent() {
  const [ticketInput, setTicketInput] = useState("");
  const [details, setDetails] = useState<RegistrationDetails | null>(null);
  const [status, setStatus] = useState(
    "Under Review" as
      | "Closed"
      | "Under Review"
      | "Work in Progress"
      | "Rejected"
      | "Wrong Department"
      | "Problem Solved"
  );
  const [remarks, setRemarks] = useState("");
  const [member, setMember] = useState("");
  const [notFound, setNotFound] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ticket = ticketInput.trim();
    if (!ticket) return;
    setNotFound(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/complaint-records/${encodeURIComponent(ticket)}`,
        { cache: "no-store" }
      );
      if (res.status === 404) {
        setDetails(null);
        setNotFound("Ticket not found");
        return;
      }
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const r = await res.json();
      const nextDetails: RegistrationDetails = {
        ticketNumber: r.ticketNumber,
        name: r.name ?? "",
        address: r.address ?? "",
        constituency: r.constituency ?? "",
        language: r.language ?? "",
        gender: r.gender ?? "",
        problem: r.problem ?? "",
        awareOfMember: r.memberName ? "yes" : "no",
        memberName: r.memberName ?? undefined,
        memberContact: r.memberPhone ?? undefined,
        whatsapp: r.phoneNumber ?? "",
        status: r.status ?? "",
        member: r.memberName ?? "",
        remarks: r.remarks ?? "",
      };
      setDetails(nextDetails);
      if (typeof r.status === "string") setStatus(r.status as typeof status);
      setMember(r.dbEmp ?? "");
      setRemarks(r.remarks ?? "");
    } catch {
      setDetails(null);
      setNotFound("Ticket not found");
    } finally {
      setLoading(false);
    }
  }

  async function handlePrintClick() {
    if (!details) return;

    // Prepare ticket data for PDF generation
    const ticketData = {
      ticketNumber: details.ticketNumber,
      name: details.name,
      address: details.address,
      constituency: details.constituency,
      language: details.language,
      gender: details.gender,
      problem: details.problem,
      status: status,
      awareOfMember: details.awareOfMember,
      memberName: details.memberName,
      memberContact: details.memberContact,
      whatsapp: details.whatsapp,
      createdDate: new Date().toLocaleString(),
      remarks: remarks,
      dbEmployee: member,
    };

    // Generate and download PDF
    await generateTicketPDF(ticketData, true);

    // Also open printable HTML version
    const html = generatePrintableHTML(ticketData, true);
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  }

  return (
    <div className="bg-gray-50 text-gray-900">
      <section className="mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-semibold">Print Ticket</h1>
          <form className="mt-6 flex gap-3" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Enter ticket number"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              required
              className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-md bg-pink-600 px-4 py-2 text-white text-sm font-medium hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Submit"}
            </button>
          </form>

          {details ? (
            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Ticket Details</h2>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <Detail label="Ticket No." value={details.ticketNumber} />
                  <Detail label="Name" value={details.name} />
                  <Detail label="Address" value={details.address} wide />
                  <Detail label="Constituency" value={details.constituency} />
                  <Detail label="Language" value={details.language} />
                  <Detail label="Gender" value={details.gender} />
                  <Detail label="Problem" value={details.problem} wide />
                  <Detail
                    label="Aware of Member"
                    value={details.awareOfMember}
                  />
                  {details.awareOfMember === "yes" ? (
                    <>
                      {details.memberName ? (
                        <Detail
                          label="Member Name"
                          value={details.memberName}
                        />
                      ) : null}
                      {details.memberContact ? (
                        <Detail
                          label="Member Contact"
                          value={details.memberContact}
                        />
                      ) : null}
                    </>
                  ) : null}
                  <Detail label="Whatsapp" value={details.whatsapp} />
                  <Detail label="Status" value={details.status} />
                  <Detail label="DB Employee Name" value={details.member} />
                  <Detail label="Remarks" value={details.remarks} />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handlePrintClick}
                  className="inline-flex items-center rounded-md bg-pink-600 px-4 py-2 text-white text-sm font-medium hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Print
                </button>
              </div>
            </div>
          ) : null}
          {!details && notFound ? (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {notFound}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default function PrintPage() {
  return (
    <AuthGuard>
      <PrintPageContent />
    </AuthGuard>
  );
}

function Detail({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <div className="text-gray-500">{label}</div>
      <div className="mt-0.5 font-medium text-gray-900">{value}</div>
    </div>
  );
}
