import { testWhatsToolConnection, sendTestMessage } from "../lib/whatstool";

async function testWhatsToolIntegration() {
  console.log("🧪 Testing WhatsTool Business API Integration...\n");

  // Test 1: Connection Test
  console.log("1️⃣ Testing API Connection...");
  const connectionResult = await testWhatsToolConnection();

  if (connectionResult.success) {
    console.log("✅ Connection successful!");
    console.log(
      "📊 Response data:",
      JSON.stringify(connectionResult.data, null, 2)
    );
  } else {
    console.log("❌ Connection failed:", connectionResult.error);
    return;
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 2: Send Test Message
  console.log("2️⃣ Testing Message Sending...");
  const testPhoneNumber = "9191998811531"; // Replace with your test number

  console.log(`📱 Sending test message to: ${testPhoneNumber}`);
  const messageResult = await sendTestMessage(testPhoneNumber);

  if (messageResult.success) {
    console.log("✅ Test message sent successfully!");
    console.log("📨 Message ID:", messageResult.messageId);
    console.log(
      "📊 Response data:",
      JSON.stringify(messageResult.data, null, 2)
    );
  } else {
    console.log("❌ Test message failed:", messageResult.error);
  }

  console.log("\n" + "=".repeat(50) + "\n");
  console.log("🎉 WhatsTool integration test completed!");
}

// Run the test
testWhatsToolIntegration().catch(console.error);
