"use client";

import { useState } from "react";

export default function TestWhatsToolPage() {
  const [phoneNumber, setPhoneNumber] = useState("9191998811531");
  const [message, setMessage] = useState(
    "Test message from Rashtrawadi Jansunavani System"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/send-whatstool-whatsapp", {
        method: "GET",
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/send-whatstool-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          message,
          testMode: true,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendCustomMessage = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/send-whatstool-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          message,
          testMode: false,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 WhatsTool Business API Test
          </h1>

          <div className="space-y-6">
            {/* Connection Test */}
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">1️⃣ Connection Test</h2>
              <p className="text-gray-600 mb-4">
                Test the connection to WhatsTool Business API
              </p>
              <button
                onClick={testConnection}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
              >
                {loading ? "Testing..." : "Test Connection"}
              </button>
            </div>

            {/* Message Test */}
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">2️⃣ Message Test</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (with country code)
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9191998811531"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={sendTestMessage}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                  >
                    {loading ? "Sending..." : "Send Test Message"}
                  </button>

                  <button
                    onClick={sendCustomMessage}
                    disabled={loading}
                    className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                  >
                    {loading ? "Sending..." : "Send Custom Message"}
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {result && (
              <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">📊 Results</h2>
                <div
                  className={`p-4 rounded-lg ${
                    result.success
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
