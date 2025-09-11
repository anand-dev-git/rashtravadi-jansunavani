"use client";
import { useState } from "react";
import AuthGuard from "@/components/auth-guard";
import { generateTicketPDF, generatePrintableHTML } from "@/lib/pdf-generator";
import {
  getEnglishProblems,
  normalizeProblemForStorage,
} from "@/lib/translation-dictionary";

function RegisterPageContent() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    constituency: "hadapsar",
    language: "english",
    gender: "male",
    age: "",
    problem: "",
    awareOfMember: "no" as "yes" | "no",
    memberName: "",
    memberPhone: "",
    phoneNumber: "",
    status: "",
    remarks: "",
    complaintSource: "Web",
    problem_des: "",
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
      // 1) Get next ticket number from API
      const ticketRes = await fetch("/api/ticket-number", {
        cache: "no-store",
      });
      if (!ticketRes.ok)
        throw new Error(`Ticket number generation failed: ${ticketRes.status}`);
      const { ticketNumber } = await ticketRes.json();

      // 2) Current timestamp for createdDate
      const createdDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      // 3) POST to create record
      const payload = {
        ticketNumber,
        address: formData.address,
        constituency: formData.constituency,
        language: formData.language,
        createdDate,
        age: formData.age,
        gender: formData.gender,
        problem: normalizeProblemForStorage(formData.problem),
        pdf_link: "",
        name: formData.name,
        memberName: formData.memberName || null,
        phoneNumber: formData.phoneNumber,
        status: null,
        remarks: null,
        memberPhone: formData.memberPhone || null,
        complaintSource: formData.complaintSource,
        problem_des: formData.problem_des,
      };
      const createRes = await fetch("/api/complaint-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!createRes.ok) throw new Error(`Create failed: ${createRes.status}`);
      setCreatedTicket(ticketNumber);
      showToast("success", `Created ticket #${ticketNumber}`);

      // 5) Generate PDF with entered information
      const ticketData = {
        ticketNumber,
        name: formData.name,
        address: formData.address,
        constituency: formData.constituency,
        language: formData.language,
        gender: formData.gender,
        age: formData.age,
        problem: normalizeProblemForStorage(formData.problem),
        status: formData.status,
        awareOfMember: formData.awareOfMember,
        memberName: formData.memberName || undefined,
        memberContact: formData.memberPhone || undefined,
        whatsapp: formData.phoneNumber,
        createdDate,
        problem_des: formData.problem_des,
      };

      // Generate and download PDF
      await generateTicketPDF(ticketData, false);

      // Send WhatsApp message with PDF
      try {
        const whatsappResponse = await fetch("/api/send-whatsapp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: formData.phoneNumber,
            ticketNumber: ticketNumber,
            ticketData: ticketData,
          }),
        });

        const whatsappResult = await whatsappResponse.json();

        if (whatsappResult.success) {
          showToast("success", "WhatsApp message sent successfully!");
        } else {
          showToast(
            "error",
            `WhatsApp message failed: ${whatsappResult.error}`
          );
          // Don't fail the registration if WhatsApp fails
        }
      } catch (whatsappError) {
        showToast(
          "error",
          `WhatsApp sending error: ${
            whatsappError instanceof Error
              ? whatsappError.message
              : "Unknown error"
          }`
        );
        // Don't fail the registration if WhatsApp fails
      }

      // Also open printable HTML version
      const html = generatePrintableHTML(ticketData, false);
      const w = window.open("", "_blank", "noopener,noreferrer");
      if (w) {
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
      }

      // Show success message with WhatsApp info
      showToast(
        "success",
        `Registration successful! Ticket: ${ticketNumber}. WhatsApp message with PDF has been sent to ${formData.phoneNumber}`
      );
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
      memberContact: value === "no" ? "" : prev.memberPhone,
    }));
  }

  return (
    <div className="bg-gray-50 text-gray-900">
      <section className="mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-semibold">Register a complaint</h1>
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
                placeholder="Enter your full name"
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
                placeholder="Enter your complete address"
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
              <select
                id="constituency"
                name="constituency"
                required
                value={formData.constituency}
                onChange={handleChange}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="hadapsar">Hadapsar</option>
              </select>
            </div>

            {/* Contact number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Contact number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                inputMode="tel"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
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

            {/* Age */}
            <div>
              <label
                htmlFor="age"
                className="block text-sm font-medium text-gray-700"
              >
                Age
              </label>
              <select
                id="age"
                name="age"
                required
                value={formData.age}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="" disabled>
                  Select age range
                </option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-50">36-50</option>
                <option value="51-65">51-65</option>
                <option value="65+">65+</option>
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
                <option value="" disabled>
                  Select problem department
                </option>
                {getEnglishProblems().map((problem) => (
                  <option key={problem} value={problem}>
                    {problem}
                  </option>
                ))}
              </select>
            </div>

            {/* Problem Description */}
            <div>
              <label
                htmlFor="problem_des"
                className="block text-sm font-medium text-gray-700"
              >
                Problem Description
              </label>
              <textarea
                id="problem_des"
                name="problem_des"
                rows={3}
                required
                value={formData.problem_des}
                onChange={handleChange}
                placeholder="Describe your problem"
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Aware of any existing DB Employee */}
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700">
                Do you have any reference of Rashtrawadi Congress Member?
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
                    Party Member Name
                  </label>
                  <input
                    id="memberName"
                    name="memberName"
                    type="text"
                    value={formData.memberName}
                    onChange={handleChange}
                    placeholder="Enter party member name"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="memberPhone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Party Member Contact
                  </label>
                  <input
                    id="memberPhone"
                    name="memberPhone"
                    type="tel"
                    inputMode="tel"
                    value={formData.memberPhone}
                    onChange={handleChange}
                    placeholder="Enter party member contact"
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

export default function RegisterPage() {
  return (
    <AuthGuard>
      <RegisterPageContent />
    </AuthGuard>
  );
}
