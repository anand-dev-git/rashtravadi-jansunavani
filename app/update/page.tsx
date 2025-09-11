"use client";
import { useState } from "react";
import AuthGuard from "@/components/auth-guard";

type RegistrationDetails = {
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
  dbEmp?: string;
  whatsapp: string;
  problem_des: string;
};

function UpdatePageContent() {
  const [ticketInput, setTicketInput] = useState("");
  const [details, setDetails] = useState<RegistrationDetails | null>(null);
  const [status, setStatus] = useState(
    "" as
      | ""
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
      setDetails({
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
        dbEmp: r.dbEmp ?? undefined,
        whatsapp: r.phoneNumber ?? "",
        problem_des: r.problem_des ?? "",
      });
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

  async function handleUpdateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!details) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/complaint-records/${encodeURIComponent(details.ticketNumber)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: status || null,
            remarks: remarks || null,
            dbEmp: member || null,
            complaintSource: "Web",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }

      // Show success message or update UI
      alert("Ticket updated successfully!");

      // Optionally refresh the data
      // You could re-fetch the ticket details here if needed
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-50 text-gray-900">
      <section className="mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-semibold">Update Ticket</h1>
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
                  <Detail label="Problem Description" value={details.problem_des} wide />
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
                  <Detail label="Contact number" value={details.whatsapp} />
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleUpdateSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as typeof status)
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="" disabled>
                        Select status
                      </option>
                      <option value="Under Review">Under Review</option>
                      <option value="Work in Progress">Work in Progress</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Wrong Department">Wrong Department</option>
                      <option value="Problem Solved">Problem Solved</option>
                    </select>
                  </div>
{/*                   <div>
                    <label
                      htmlFor="member"
                      className="block text-sm font-medium text-gray-700"
                    >
                      DB Employee Name
                    </label>
                    <input
                      id="member"
                      name="member"
                      type="text"
                      value={member}
                      onChange={(e) => setMember(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div> */}
                </div>
                <div>
                  <label
                    htmlFor="remarks"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Remarks
                  </label>
                  <textarea
                    id="remarks"
                    name="remarks"
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center rounded-md bg-pink-600 px-4 py-2 text-white text-sm font-medium hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Updating..." : "Update"}
                  </button>
                </div>
              </form>
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

export default function UpdatePage() {
  return (
    <AuthGuard>
      <UpdatePageContent />
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
