import jsPDF from "jspdf";
import { loadLogoAsBase64, FALLBACK_LOGO } from "./logo-loader";

interface TicketData {
  ticketNumber: string;
  name: string;
  address: string;
  constituency: string;
  language: string;
  gender: string;
  age?: string;
  problem: string;
  status: string;
  awareOfMember: "yes" | "no";
  memberName?: string;
  memberContact?: string;
  whatsapp: string;
  createdDate: string;
  remarks?: string;
  dbEmployee?: string;
}

export async function generateTicketPDF(
  data: TicketData,
  isUpdate = false
): Promise<void> {
  const doc = new jsPDF();

  // Set font
  doc.setFont("helvetica");

  // Colors
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [52, 73, 94]; // Dark gray
  const lightGray = [149, 165, 166]; // Light gray

  // Header with logo only

  // Load and add logo
  try {
    const logoBase64 = await loadLogoAsBase64();
    if (logoBase64) {
      // Add logo image
      doc.addImage(logoBase64, "PNG", 10, 5, 25, 25);
    } else {
      // Fallback to simple logo
      doc.addImage(FALLBACK_LOGO, "PNG", 10, 5, 25, 25);
    }
  } catch (error) {
    console.log("Logo not available, using text placeholder");
    // Add logo placeholder
    doc.setFillColor(255, 255, 255);
    doc.rect(10, 5, 25, 25, "F");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(8);
    doc.text("RJS", 18, 18);
  }

  // Main title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Rashtrawadi Jansunavani", 45, 15);

  // Subtitle
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(isUpdate ? "Ticket Details" : "Registration Details", 45, 22);

  // Ticket number in header
  doc.setFontSize(10);
  doc.text(`Ticket: ${data.ticketNumber}`, 150, 20);

  // Reset text color
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

  // Content area - start below header
  let yPosition = 50;

  // Basic Information Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Basic Information", 20, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  // Create two columns
  const leftColumn = 20;
  const rightColumn = 110;
  const lineHeight = 6;

  // Left column fields
  const leftFields = [
    ["Name:", data.name],
    ["Address:", data.address],
    ["Constituency:", data.constituency],
    ["Language:", data.language],
    ["Gender:", data.gender],
    ...(data.age ? [["Age:", data.age]] : []),
  ];

  // Right column fields
  const rightFields = [
    ["Created Date:", data.createdDate],
    ["Problem:", data.problem],
    ["Status:", data.status || "Not Set"],
    ["WhatsApp:", data.whatsapp],
    ["Aware of DB Employee:", data.awareOfMember],
  ];

  // Add member fields if applicable
  if (data.memberName) {
    rightFields.push(["DB Employee Name:", data.memberName]);
  }
  if (data.memberContact) {
    rightFields.push(["DB Employee Contact:", data.memberContact]);
  }
  if (data.dbEmployee) {
    rightFields.push(["DB Employee:", data.dbEmployee]);
  }

  // Print left column
  leftFields.forEach(([label, value]) => {
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(label, leftColumn, yPosition);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

    // Handle long text wrapping with smaller max width
    const maxWidth = 70;
    const lines = doc.splitTextToSize(value, maxWidth);
    doc.text(lines, leftColumn + 25, yPosition);

    yPosition += Math.max(lines.length * lineHeight, lineHeight + 3);
  });

  // Reset y position for right column
  yPosition = 58;

  // Print right column
  rightFields.forEach(([label, value]) => {
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(label, rightColumn, yPosition);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

    // Handle long text wrapping with smaller max width
    const maxWidth = 70;
    const lines = doc.splitTextToSize(value, maxWidth);
    doc.text(lines, rightColumn + 25, yPosition);

    yPosition += Math.max(lines.length * lineHeight, lineHeight + 3);
  });

  // Add remarks section if it's an update
  if (isUpdate && data.remarks) {
    yPosition = Math.max(yPosition, 120);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Remarks", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text("Remarks:", 20, yPosition);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

    const remarksLines = doc.splitTextToSize(data.remarks, 160);
    doc.text(remarksLines, 20, yPosition + 4);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text("Generated on: " + new Date().toLocaleString(), 20, pageHeight - 20);
  doc.text("Rashtrawadi Jansunavani System", 20, pageHeight - 15);

  // Save the PDF
  const fileName = `ticket_${data.ticketNumber}_${
    isUpdate ? "details" : "registration"
  }.pdf`;
  doc.save(fileName);
}

export async function generateTicketPDFBase64(
  data: TicketData,
  isUpdate = false
): Promise<string> {
  const doc = new jsPDF();

  // Set font
  doc.setFont("helvetica");

  // Colors
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [52, 73, 94]; // Dark gray
  const lightGray = [149, 165, 166]; // Light gray

  // Header with logo only

  // Load and add logo
  try {
    const logoBase64 = await loadLogoAsBase64();
    if (logoBase64) {
      // Add logo image
      doc.addImage(logoBase64, "PNG", 10, 5, 25, 25);
    } else {
      // Fallback to simple logo
      doc.addImage(FALLBACK_LOGO, "PNG", 10, 5, 25, 25);
    }
  } catch (error) {
    console.log("Logo not available, using text placeholder");
    // Add logo placeholder
    doc.setFillColor(255, 255, 255);
    doc.rect(10, 5, 25, 25, "F");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(8);
    doc.text("RJS", 18, 18);
  }

  // Main title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Rashtrawadi Jansunavani", 45, 15);

  // Subtitle
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(isUpdate ? "Ticket Details" : "Registration Details", 45, 22);

  // Ticket number in header
  doc.setFontSize(10);
  doc.text(`Ticket: ${data.ticketNumber}`, 150, 20);

  // Reset text color
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

  // Content area - start below header
  let yPosition = 50;

  // Basic Information Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Basic Information", 20, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  // Create two columns
  const leftColumn = 20;
  const rightColumn = 110;
  const lineHeight = 6;

  // Left column fields
  const leftFields = [
    ["Name:", data.name],
    ["Address:", data.address],
    ["Constituency:", data.constituency],
    ["Language:", data.language],
    ["Gender:", data.gender],
    ...(data.age ? [["Age:", data.age]] : []),
  ];

  // Right column fields
  const rightFields = [
    ["Created Date:", data.createdDate],
    ["Problem:", data.problem],
    ["Status:", data.status || "Not Set"],
    ["WhatsApp:", data.whatsapp],
    ["Aware of DB Employee:", data.awareOfMember],
  ];

  // Add member fields if applicable
  if (data.memberName) {
    rightFields.push(["DB Employee Name:", data.memberName]);
  }
  if (data.memberContact) {
    rightFields.push(["DB Employee Contact:", data.memberContact]);
  }
  if (data.dbEmployee) {
    rightFields.push(["DB Employee:", data.dbEmployee]);
  }

  // Print left column
  leftFields.forEach(([label, value]) => {
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(label, leftColumn, yPosition);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

    // Handle long text wrapping with smaller max width
    const maxWidth = 70;
    const lines = doc.splitTextToSize(value, maxWidth);
    doc.text(lines, leftColumn + 25, yPosition);

    yPosition += Math.max(lines.length * lineHeight, lineHeight + 3);
  });

  // Reset y position for right column
  yPosition = 58;

  // Print right column
  rightFields.forEach(([label, value]) => {
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(label, rightColumn, yPosition);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

    // Handle long text wrapping with smaller max width
    const maxWidth = 70;
    const lines = doc.splitTextToSize(value, maxWidth);
    doc.text(lines, rightColumn + 25, yPosition);

    yPosition += Math.max(lines.length * lineHeight, lineHeight + 3);
  });

  // Add remarks section if it's an update
  if (isUpdate && data.remarks) {
    yPosition = Math.max(yPosition, 120);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Remarks", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text("Remarks:", 20, yPosition);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

    const remarksLines = doc.splitTextToSize(data.remarks, 160);
    doc.text(remarksLines, 20, yPosition + 4);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text("Generated on: " + new Date().toLocaleString(), 20, pageHeight - 20);
  doc.text("Rashtrawadi Jansunavani System", 20, pageHeight - 15);

  // Return base64 string instead of saving
  return doc.output("datauristring").split(",")[1]; // Remove data:application/pdf;base64, prefix
}

export function generatePrintableHTML(
  data: TicketData,
  isUpdate = false
): string {
  const style = `
    <style>
      @media print {
        body { margin: 0; }
        .no-print { display: none; }
      }
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        padding: 20px; 
        color: #2c3e50; 
        line-height: 1.6;
        max-width: 800px;
        margin: 0 auto;
      }
      .header { 
        background: #2980b9; 
        color: white; 
        padding: 20px; 
        margin: -20px -20px 20px -20px;
        border-radius: 8px 8px 0 0;
        display: flex;
        align-items: center;
        gap: 15px;
      }
      .logo { 
        width: 40px; 
        height: 40px; 
        background: white; 
        border-radius: 4px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        flex-shrink: 0;
      }
      .logo img { 
        width: 30px; 
        height: 30px; 
        object-fit: contain;
      }
      .logo-text { 
        color: #2980b9; 
        font-weight: bold; 
        font-size: 12px;
      }
      .header-content { 
        flex: 1;
      }
      .header h1 { 
        margin: 0; 
        font-size: 20px; 
        font-weight: bold;
      }
      .header-subtitle { 
        margin: 0; 
        font-size: 14px; 
        opacity: 0.9;
      }
      .ticket-number { 
        font-size: 14px; 
        font-weight: 500;
        margin-top: 5px;
      }
      .content { 
        display: grid; 
        grid-template-columns: 1fr 1fr; 
        gap: 20px; 
        margin-bottom: 20px;
      }
      .field { 
        margin-bottom: 15px; 
      }
      .label { 
        color: #7f8c8d; 
        font-size: 12px; 
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 5px;
      }
      .value { 
        color: #2c3e50; 
        font-weight: 500; 
        font-size: 14px;
        word-wrap: break-word;
      }
      .full-width { 
        grid-column: 1 / -1; 
      }
      .section { 
        margin-top: 30px; 
        padding-top: 20px;
        border-top: 2px solid #ecf0f1;
      }
      .section h2 { 
        color: #2980b9; 
        font-size: 18px; 
        margin-bottom: 15px;
        font-weight: bold;
      }
      .remarks { 
        background: #f8f9fa; 
        padding: 15px; 
        border-radius: 5px; 
        border-left: 4px solid #2980b9;
      }
      .footer { 
        margin-top: 40px; 
        padding-top: 20px; 
        border-top: 1px solid #ecf0f1; 
        text-align: center; 
        color: #7f8c8d; 
        font-size: 12px;
      }
      .print-button {
        background: #2980b9;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        margin: 20px 0;
        display: inline-block;
        text-decoration: none;
      }
      .print-button:hover {
        background: #1f5f8b;
      }
    </style>
  `;

  const fields = [
    { label: "Name", value: data.name },
    { label: "Address", value: data.address, fullWidth: true },
    { label: "Constituency", value: data.constituency },
    { label: "Language", value: data.language },
    { label: "Gender", value: data.gender },
    ...(data.age ? [{ label: "Age", value: data.age }] : []),
    { label: "Problem", value: data.problem, fullWidth: true },
    { label: "Status", value: data.status || "Not Set" },
    { label: "WhatsApp", value: data.whatsapp },
    { label: "Aware of DB Employee", value: data.awareOfMember },
  ];

  // Add member fields if applicable
  if (data.memberName) {
    fields.push({ label: "DB Employee Name", value: data.memberName });
  }
  if (data.memberContact) {
    fields.push({ label: "DB Employee Contact", value: data.memberContact });
  }
  if (data.dbEmployee) {
    fields.push({ label: "DB Employee", value: data.dbEmployee });
  }

  const fieldsHtml = fields
    .map(
      (field) => `
      <div class="field ${field.fullWidth ? "full-width" : ""}">
        <div class="label">${field.label}</div>
        <div class="value">${field.value}</div>
      </div>
    `
    )
    .join("");

  const remarksSection =
    isUpdate && data.remarks
      ? `
    <div class="section">
      <h2>Remarks</h2>
      <div class="remarks">${data.remarks}</div>
    </div>
  `
      : "";

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Ticket ${data.ticketNumber}</title>
        ${style}
      </head>
      <body>
        <div class="header">
          <div class="logo">
            <img src="/logo.png" alt="Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div class="logo-text" style="display: none;">RJS</div>
          </div>
          <div class="header-content">
            <h1>Rashtrawadi Jansunavani</h1>
            <div class="header-subtitle">${
              isUpdate ? "Ticket Details" : "Registration Details"
            }</div>
          </div>
          <div class="ticket-number">Ticket: ${data.ticketNumber}</div>
        </div>
        
        <div class="content">
          ${fieldsHtml}
        </div>
        
        ${remarksSection}
        
        <div class="footer">
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Rashtrawadi Jansunavani System</p>
        </div>
        
        <div class="no-print">
          <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
        </div>
      </body>
    </html>
  `;
}
