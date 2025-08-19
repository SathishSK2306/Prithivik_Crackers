// import express from "express";
// import nodemailer from "nodemailer";
// import cors from "cors";
// import dotenv from "dotenv";
// import PDFDocument from "pdfkit";
// import fs from "fs";
// import path from "path";
// // import fetch from "node-fetch";
// // import FormData from "form-data";

// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json());

// // Try to load a Unicode-capable font so the ₹ symbol renders correctly.
// // Falls back to built-in Helvetica and switches currency label to "Rs." if not found.
// const possibleFontPaths = [
//   path.join(process.cwd(), "fonts", "NotoSans-Regular.ttf"),
//   path.join(process.cwd(), "fonts", "DejaVuSans.ttf"),
//   path.join(process.cwd(), "fonts", "NotoSansDevanagari-Regular.ttf"),
// ];
// const unicodeFontPath = possibleFontPaths.find((p) => {
//   try {
//     return fs.existsSync(p);
//   } catch {
//     return false;
//   }
// });

// // WhatsApp Cloud API configuration
// // const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
// // const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
// // const WHATSAPP_DRY_RUN = !WHATSAPP_TOKEN || WHATSAPP_TOKEN === "DUMMY";

// // function normalizePhoneForWhatsApp(input) {
// //   if (!input) return "";
// //   const digits = String(input).replace(/\D+/g, "");
// //   // Default to India country code if none provided and number looks like 10 digits
// //   if (digits.length === 10) return `91${digits}`;
// //   return digits;
// // }

// // async function sendWhatsAppPdf({ pdfBuffer, filename, toPhone, caption }) {
// //   if (WHATSAPP_DRY_RUN) {
// //     return { mocked: true };
// //   }
// //   if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
// //     throw new Error("WhatsApp credentials missing (WHATSAPP_TOKEN/WHATSAPP_PHONE_NUMBER_ID)");
// //   }
// //   const to = normalizePhoneForWhatsApp(toPhone);
// //   if (!to) throw new Error("Recipient phone is empty");

// //   // 1) Upload media to WhatsApp servers
// //   const uploadUrl = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/media`;
// //   const form = new FormData();
// //   form.append("file", pdfBuffer, { filename: filename || "order.pdf", contentType: "application/pdf" });
// //   form.append("type", "application/pdf");
// //   form.append("messaging_product", "whatsapp");

// //   const uploadRes = await fetch(uploadUrl, {
// //     method: "POST",
// //     headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
// //     body: form,
// //   });
// //   const uploadJson = await uploadRes.json();
// //   if (!uploadRes.ok) {
// //     throw new Error(`WhatsApp media upload failed: ${uploadRes.status} ${uploadRes.statusText} ${JSON.stringify(uploadJson)}`);
// //   }
// //   const mediaId = uploadJson.id;

// //   // 2) Send document message
// //   const msgUrl = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
// //   const msgPayload = {
// //     messaging_product: "whatsapp",
// //     to,
// //     type: "document",
// //     document: {
// //       id: mediaId,
// //       filename: filename || "order.pdf",
// //       caption: caption || "Your Prithivik Crackers order estimate",
// //     },
// //   };
// //   const msgRes = await fetch(msgUrl, {
// //     method: "POST",
// //     headers: {
// //       Authorization: `Bearer ${WHATSAPP_TOKEN}`,
// //       "Content-Type": "application/json",
// //     },
// //     body: JSON.stringify(msgPayload),
// //   });
// //   const msgJson = await msgRes.json();
// //   if (!msgRes.ok) {
// //     throw new Error(`WhatsApp message send failed: ${msgRes.status} ${msgRes.statusText} ${JSON.stringify(msgJson)}`);
// //   }
// //   return msgJson;
// // }

// // Mail transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Welcome email
// app.post("/send-welcome", async (req, res) => {
//   const { email, name } = req.body;
//   if (!email) {
//     return res.status(400).json({ message: "Email is required." });
//   }

//   try {
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Welcome to Prithivik Crackers",
//       text: `Welcome to Prithivik Crackers${name ? ", " + name : ""}!`,
//     });
//     res.status(200).json({ message: "Welcome email sent!" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Email failed." });
//   }
// });

// // Order PDF
// app.post("/send-order-pdf", async (req, res) => {
//   try {
//     const { toEmail, customer, items, totals, toWhatsapp } = req.body;
//     if (!toEmail)
//       return res
//         .status(400)
//         .json({ message: "Recipient email is required" });

//     const doc = new PDFDocument({ size: "A4", margin: 28 });
//     let hasUnicodeFont = false;
//     let defaultFontName = "Helvetica";
//     if (unicodeFontPath) {
//       try {
//         doc.registerFont("Unicode", unicodeFontPath);
//         hasUnicodeFont = true;
//         defaultFontName = "Unicode";
//       } catch {
//         // keep fallback
//       }
//     }
//     const formatCurrency = (n) => {
//       const amount = Number(n || 0).toFixed(2);
//       return hasUnicodeFont ? `₹${amount}` : `Rs. ${amount}`;
//     };
//     const chunks = [];
//     doc.on("data", (c) => chunks.push(c));
//     doc.on("end", async () => {
//       const pdfBuffer = Buffer.concat(chunks);
//       // Send email (if email provided)
//       const results = {};
//       if (toEmail) {
//         try {
//           await transporter.sendMail({
//             from: process.env.EMAIL_USER,
//             to: toEmailprocess.env.EMAIL_USER,
//             subject: "Prithivik Crackers - Order Details",
//             text: "Please find your order PDF attached.",
//             attachments: [{ filename: "order.pdf", content: pdfBuffer }],
//           });
//           results.email = "sent";
//         } catch (err) {
//           console.error(err);
//           results.email = "failed";
//         }
//       }
//       // Send WhatsApp (if phone provided)
//       if (toWhatsapp) {
//         try {
//           await sendWhatsAppPdf({
//             pdfBuffer,
//             filename: "order.pdf",
//             toPhone: toWhatsapp,
//             caption: "Your Prithivik Crackers order estimate",
//           });
//           results.whatsapp = "sent";
//         } catch (err) {
//           console.error(err);
//           results.whatsapp = "failed";
//         }
//       }
//       return res.status(200).json({ message: "Order generated", results });
//     });

//     const brand = {
//       primary: "#1A3D63",
//       accent: "#F59E0B",
//       light: "#F6FAFD",
//       zebra: "#F9FAFB",
//       border: "#E5E7EB",
//     };

//     const pageWidth = doc.page.width;
//     const margin = 28;
//     const contentWidth = pageWidth - margin * 2;

//     // Header
//     doc.save();
//     doc.rect(margin, margin, contentWidth, 50).fill(brand.primary);
//     doc
//       .fillColor("#FFFFFF")
//       .fontSize(20)
//       .font("Helvetica-Bold")
//       .text("PRITHIVIK CRACKERS", margin, margin + 14, {
//         width: contentWidth,
//         align: "center",
//       });
//     doc
//       .fontSize(10)
//       .font(defaultFontName)
//       .text("Order Estimate", margin, margin + 36, {
//         width: contentWidth,
//         align: "center",
//       });
//     doc.restore();
//     let cursorY = margin + 60;

//     // Customer details (auto-sized box; wraps long lines)
//     doc.save();
//     const padX = 12;
//     const titleHeight = 20; // includes top padding
//     const lineGap = 4;
//     doc.fillColor("#111827").fontSize(10).font(defaultFontName);
//     const details = [
//       ["Name", customer?.name],
//       ["Email", customer?.email],
//       ["Phone", customer?.phone],
//       ["Address", customer?.address],
//       ["Pincode", customer?.pincode],
//       ["City", customer?.city],
//       ["State", customer?.state],
//     ].filter(([, v]) => !!v);

//     const textWidth = contentWidth - padX * 2;
//     // Measure height needed for all detail lines with wrapping
//     let detailsHeight = 0;
//     details.forEach(([k, v], idx) => {
//       const line = `${k}: ${v}`;
//       const h = doc.heightOfString(line, { width: textWidth });
//       detailsHeight += h + (idx < details.length - 1 ? lineGap : 0);
//     });
//     const minCardHeight = 90;
//     const cardHeight = Math.max(minCardHeight, titleHeight + 8 + detailsHeight + 10);

//     // Draw card background and border
//     doc
//       .fillColor(brand.light)
//       .rect(margin, cursorY, contentWidth, cardHeight)
//       .fill();
//     doc
//       .strokeColor(brand.primary)
//       .lineWidth(1)
//       .rect(margin, cursorY, contentWidth, cardHeight)
//       .stroke();
//     // Title
//     doc
//       .fillColor(brand.primary)
//       .fontSize(12)
//       .font("Helvetica-Bold")
//       .text("Customer Details", margin + 10, cursorY + 10);
//     // Details text
//     doc.fillColor("#111827").fontSize(10).font(defaultFontName);
//     let dy = cursorY + 28;
//     details.forEach(([k, v], idx) => {
//       const line = `${k}: ${v}`;
//       doc.text(line, margin + padX, dy, { width: textWidth });
//       dy += doc.heightOfString(line, { width: textWidth }) + (idx < details.length - 1 ? lineGap : 0);
//     });
//     doc.restore();
//     cursorY += cardHeight + 16;

//     // Table columns
//     const colWidths = [
//       35, // S.No
//       80, // Category
//       150, // Product
//       75, // Actual Price
//       75, // Offer Price
//       45, // Qty
//       contentWidth - (35 + 80 + 150 + 75 + 75 + 45), // Amount
//     ];
//     const colXs = colWidths.map((_, i) =>
//       i === 0
//         ? margin
//         : margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
//     );

//     // Row height calculation
//     const reservedBelow = 110;
//     let rowHeight = 18;
//     const availableForRows = Math.max(
//       0,
//       doc.page.height - margin - reservedBelow - cursorY - rowHeight
//     );
//     if (items.length > 0 && items.length * rowHeight > availableForRows) {
//       rowHeight = Math.max(
//         12,
//         Math.floor(availableForRows / items.length)
//       );
//     }
//     const headerFontSize = rowHeight <= 14 ? 8 : 10;
//     const bodyFontSize = rowHeight <= 14 ? 8 : 9;

//     // Table header
//     doc.save();
//     doc
//       .fillColor(brand.primary)
//       .rect(margin, cursorY, contentWidth, rowHeight)
//       .fill();
//     doc.fillColor("#FFFFFF").fontSize(headerFontSize).font("Helvetica-Bold");
//     [
//       "S.No",
//       "Category",
//       "Product",
//       "Actual Price",
//       "Offer Price",
//       "Qty",
//       "Amount",
//     ].forEach((h, i) => {
//       const align = i >= 3 ? "right" : "left";
//       doc.text(h, colXs[i] + 6, cursorY + rowHeight / 4, {
//         width: colWidths[i] - 12,
//         align,
//       });
//     });
//     doc.restore();
//     cursorY += rowHeight;

//     // Table rows
//     doc.font(defaultFontName).fontSize(bodyFontSize).fillColor("#111827");
//     items.forEach((it, idx) => {
//       if (idx % 2 === 0) {
//         doc.save();
//         doc
//           .fillColor(brand.zebra)
//           .rect(margin, cursorY, contentWidth, rowHeight)
//           .fill();
//         doc.restore();
//       }
//       const amount =
//         Number(it.offerPrice ?? it.price ?? 0) *
//         Number(it.quantity || 0);
//       const rowVals = [
//         String(idx + 1),
//         it.category || "",
//         it.product || it.name || "",
//         formatCurrency(Number(it.actualPrice ?? it.price ?? 0)),
//         formatCurrency(Number(it.offerPrice ?? it.price ?? 0)),
//         String(Number(it.quantity || 0)), // FIXED to prevent "1 11" duplication
//         formatCurrency(amount),
//       ];
//       rowVals.forEach((val, i) => {
//         const align = i >= 3 ? "right" : "left";
//         doc.text(val, colXs[i] + 6, cursorY + rowHeight / 4, {
//           width: colWidths[i] - 12,
//           align,
//         });
//       });
//       cursorY += rowHeight;
//     });

//     // Summary (Final Total removed)
//     cursorY += 10;
//     const summaryH = 60;
//     doc.save();
//     doc
//       .rect(margin, cursorY, contentWidth, summaryH)
//       .strokeColor(brand.primary)
//       .lineWidth(1)
//       .stroke();
//     doc
//       .fillColor(brand.primary)
//       .font("Helvetica-Bold")
//       .fontSize(12)
//       .text("Order Summary", margin + 10, cursorY + 10);
//     doc.font(defaultFontName).fillColor("#111827").fontSize(11);
//     doc.text(
//       `Total Products: ${totals?.totalProducts ?? 0}`,
//       margin + 10,
//       cursorY + 30
//     );
//     const finalTotal = Number(
//       totals?.finalTotal ?? totals?.total ?? totals?.totalPrice ?? 0
//     );
//     doc.text(
//       `Total Price: ${formatCurrency(Number(totals?.totalPrice || 0))}`,
//       margin,
//       cursorY + 30,
//       { width: contentWidth - 10, align: "right" }
//     );
   
//     doc.restore();

//     // Footer
//     doc
//       .fontSize(9)
//       .fillColor("#6B7280")
//       .text(
//         "Thank you for choosing Prithivik Crackers!",
//         margin,
//         doc.page.height - margin - 30,
//         {
//           width: contentWidth,
//           align: "center",
//         }
//       );

//     doc.end();
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ message: "Failed to generate PDF" });
//   }
// });

// // Generate and download the same Order PDF (returns PDF file instead of emailing)
// app.post("/generate-order-pdf", async (req, res) => {
//   try {
//     const { customer, items, totals } = req.body;

//     const doc = new PDFDocument({ size: "A4", margin: 28 });
//     let hasUnicodeFont = false;
//     let defaultFontName = "Helvetica";
//     if (unicodeFontPath) {
//       try {
//         doc.registerFont("Unicode", unicodeFontPath);
//         hasUnicodeFont = true;
//         defaultFontName = "Unicode";
//       } catch {}
//     }
//     const formatCurrency = (n) => {
//       const amount = Number(n || 0).toFixed(2);
//       return hasUnicodeFont ? `₹${amount}` : `Rs. ${amount}`;
//     };

//     const chunks = [];
//     doc.on("data", (c) => chunks.push(c));
//     doc.on("end", async () => {
//       const pdfBuffer = Buffer.concat(chunks);
//       res.setHeader("Content-Type", "application/pdf");
//       res.setHeader(
//         "Content-Disposition",
//         'attachment; filename="order.pdf"'
//       );
//       res.setHeader("Content-Length", String(pdfBuffer.length));
//       return res.status(200).send(pdfBuffer);
//     });

//     const brand = {
//       primary: "#1A3D63",
//       accent: "#F59E0B",
//       light: "#F6FAFD",
//       zebra: "#F9FAFB",
//       border: "#E5E7EB",
//     };

//     const pageWidth = doc.page.width;
//     const margin = 28;
//     const contentWidth = pageWidth - margin * 2;

//     // Header
//     doc.save();
//     doc.rect(margin, margin, contentWidth, 50).fill(brand.primary);
//     doc
//       .fillColor("#FFFFFF")
//       .fontSize(20)
//       .font("Helvetica-Bold")
//       .text("PRITHIVIK CRACKERS", margin, margin + 14, {
//         width: contentWidth,
//         align: "center",
//       });
//     doc
//       .fontSize(10)
//       .font(defaultFontName)
//       .text("Order Estimate", margin, margin + 36, {
//         width: contentWidth,
//         align: "center",
//       });
//     doc.restore();
//     let cursorY = margin + 60;

//     // Customer details (auto-sized)
//     doc.save();
//     const padX = 12;
//     const titleHeight = 20;
//     const lineGap = 4;
//     doc.fillColor("#111827").fontSize(10).font(defaultFontName);
//     const details = [
//       ["Name", customer?.name],
//       ["Email", customer?.email],
//       ["Phone", customer?.phone],
//       ["Address", customer?.address],
//       ["Pincode", customer?.pincode],
//       ["City", customer?.city],
//       ["State", customer?.state],
//     ].filter(([, v]) => !!v);
//     const textWidth = contentWidth - padX * 2;
//     let detailsHeight = 0;
//     details.forEach(([k, v], idx) => {
//       const line = `${k}: ${v}`;
//       const h = doc.heightOfString(line, { width: textWidth });
//       detailsHeight += h + (idx < details.length - 1 ? lineGap : 0);
//     });
//     const minCardHeight = 90;
//     const cardHeight = Math.max(
//       minCardHeight,
//       titleHeight + 8 + detailsHeight + 10
//     );
//     doc.fillColor(brand.light).rect(margin, cursorY, contentWidth, cardHeight).fill();
//     doc.strokeColor(brand.primary).lineWidth(1).rect(margin, cursorY, contentWidth, cardHeight).stroke();
//     doc
//       .fillColor(brand.primary)
//       .fontSize(12)
//       .font("Helvetica-Bold")
//       .text("Customer Details", margin + 10, cursorY + 10);
//     doc.fillColor("#111827").fontSize(10).font(defaultFontName);
//     let dy = cursorY + 28;
//     details.forEach(([k, v], idx) => {
//       const line = `${k}: ${v}`;
//       doc.text(line, margin + padX, dy, { width: textWidth });
//       dy +=
//         doc.heightOfString(line, { width: textWidth }) +
//         (idx < details.length - 1 ? lineGap : 0);
//     });
//     doc.restore();
//     cursorY += cardHeight + 16;

//     // Table columns
//     const colWidths = [35, 80, 150, 75, 75, 45, contentWidth - (35 + 80 + 150 + 75 + 75 + 45)];
//     const colXs = colWidths.map((_, i) =>
//       i === 0 ? margin : margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
//     );

//     // Row heights
//     const reservedBelow = 110;
//     let rowHeight = 18;
//     const availableForRows = Math.max(0, doc.page.height - margin - reservedBelow - cursorY - rowHeight);
//     if ((items || []).length > 0 && (items || []).length * rowHeight > availableForRows) {
//       rowHeight = Math.max(12, Math.floor(availableForRows / (items || []).length));
//     }
//     const headerFontSize = rowHeight <= 14 ? 8 : 10;
//     const bodyFontSize = rowHeight <= 14 ? 8 : 9;

//     // Table header
//     doc.save();
//     doc.fillColor(brand.primary).rect(margin, cursorY, contentWidth, rowHeight).fill();
//     doc.fillColor("#FFFFFF").fontSize(headerFontSize).font("Helvetica-Bold");
//     ["S.No", "Category", "Product", "Actual Price", "Offer Price", "Qty", "Amount"].forEach((h, i) => {
//       const align = i >= 3 ? "right" : "left";
//       doc.text(h, colXs[i] + 6, cursorY + rowHeight / 4, { width: colWidths[i] - 12, align });
//     });
//     doc.restore();
//     cursorY += rowHeight;

//     // Rows
//     doc.font(defaultFontName).fontSize(bodyFontSize).fillColor("#111827");
//     (items || []).forEach((it, idx) => {
//       if (idx % 2 === 0) {
//         doc.save();
//         doc.fillColor(brand.zebra).rect(margin, cursorY, contentWidth, rowHeight).fill();
//         doc.restore();
//       }
//       const amount = Number(it.offerPrice ?? it.price ?? 0) * Number(it.quantity || 0);
//       const rowVals = [
//         String(idx + 1),
//         it.category || "",
//         it.product || it.name || "",
//         formatCurrency(Number(it.actualPrice ?? it.price ?? 0)),
//         formatCurrency(Number(it.offerPrice ?? it.price ?? 0)),
//         String(Number(it.quantity || 0)),
//         formatCurrency(amount),
//       ];
//       rowVals.forEach((val, i) => {
//         const align = i >= 3 ? "right" : "left";
//         doc.text(val, colXs[i] + 6, cursorY + rowHeight / 4, { width: colWidths[i] - 12, align });
//       });
//       cursorY += rowHeight;
//     });

//     // Summary
//     cursorY += 10;
//     const summaryH = 60;
//     doc.save();
//     doc.rect(margin, cursorY, contentWidth, summaryH).strokeColor(brand.primary).lineWidth(1).stroke();
//     doc.fillColor(brand.primary).font("Helvetica-Bold").fontSize(12).text("Order Summary", margin + 10, cursorY + 10);
//     doc.font(defaultFontName).fillColor("#111827").fontSize(11);
//     doc.text(`Total Products: ${totals?.totalProducts ?? 0}`, margin + 10, cursorY + 30);
//     doc.text(`Total Price: ${formatCurrency(Number(totals?.totalPrice || 0))}`, margin, cursorY + 30, { width: contentWidth - 10, align: "right" });
//     doc.restore();

//     // Footer
//     doc.fontSize(9).fillColor("#6B7280").text(
//       "Thank you for choosing Prithivik Crackers!",
//       margin,
//       doc.page.height - margin - 30,
//       { width: contentWidth, align: "center" }
//     );

//     doc.end();
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ message: "Failed to generate PDF" });
//   }
// });

// app.listen(5000, () =>
//   console.log("Server running on port 5000")
// );




// server.js
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Configure Nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use others like SMTP if needed
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail email
    pass: process.env.EMAIL_PASS, // App password from Gmail
  },
});

// Utility function to generate PDF (shared by both routes)
function generateOrderPDF(doc, from, to, items, orderDetails) {
  // Enhanced color palette matching the image
  const brand = {
    primary: "#1A3D63",      // Dark blue header/footer
    secondary: "#4A7FA7",    // Medium blue
    accent: "#F59E0B",       // Golden orange
    success: "#10B981",      // Green
    warning: "#F59E0B",      // Orange
    light: "#F6FAFD",        // Light blue background
    lighter: "#F9FAFB",      // Very light gray
    dark: "#111827",         // Dark text
    gray: "#6B7280",         // Medium gray
    border: "#E5E7EB",       // Light border
    white: "#FFFFFF"         // Pure white
  };

  const margin = 15; // Very small margin
  const contentWidth = doc.page.width - margin * 2;
  const pageHeight = doc.page.height;

  // Helper function for currency formatting
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  // Helper function for drawing rectangles
  const drawRect = (x, y, width, height, fillColor, strokeColor) => {
    doc.save();
    if (fillColor) {
      doc.fillColor(fillColor).rect(x, y, width, height).fill();
    }
    if (strokeColor) {
      doc.strokeColor(strokeColor).lineWidth(1).rect(x, y, width, height).stroke();
    }
    doc.restore();
  };

  // Header Section - ultra compact design
  const headerHeight = 30; // Very small header
  drawRect(margin, margin, contentWidth, headerHeight, brand.primary, brand.primary);
  
  // Company name and tagline (left side)
  doc.save();
  doc.fillColor(brand.white).fontSize(12).font("Helvetica-Bold"); // Small font
  doc.text("PRITHIVIK CRACKERS", margin + 8, margin + 3); // Minimal spacing
  
  doc.fillColor(brand.white).fontSize(6).font("Helvetica"); // Very small font
  doc.text("Lighting Up Your Celebrations", margin + 8, margin + 15); // Minimal spacing
  
  // Order details (right side)
  doc.fillColor(brand.white).fontSize(6).font("Helvetica"); // Very small font
  doc.text(`Order ID: ${orderDetails?.orderId || 'N/A'}`, margin + contentWidth - 70, margin + 5); // Minimal spacing
  doc.text(`Status: ${orderDetails?.status || 'Pending'}`, margin + contentWidth - 70, margin + 12); // Minimal spacing
  doc.restore();

  let cursorY = margin + headerHeight + 8; // Minimal spacing

  // FROM and TO Details Section - ultra compact layout
  const detailsHeight = 45; // Very small height
  const colWidth = (contentWidth - 6) / 2; // Minimal gap
  
  // FROM box (left)
  drawRect(margin, cursorY, colWidth, detailsHeight, brand.white, brand.border);
  doc.save();
  doc.fillColor(brand.dark).fontSize(8).font("Helvetica-Bold"); // Small font
  doc.text("FROM", margin + 4, cursorY + 3); // Minimal spacing
  
  doc.fillColor(brand.dark).fontSize(7).font("Helvetica-Bold"); // Small font
  doc.text(from?.name || "Prithivik Crackers", margin + 4, cursorY + 12); // Minimal spacing
  
  doc.fillColor(brand.gray).fontSize(5).font("Helvetica"); // Very small font
  doc.text(from?.email || "info@prithivikcrackers.com", margin + 4, cursorY + 20); // Minimal spacing
  doc.text(from?.phone || "+91-9876543210", margin + 4, cursorY + 26); // Minimal spacing
  doc.text(from?.address || "Sivakasi, Tamil Nadu", margin + 4, cursorY + 32); // Minimal spacing
  doc.text("India", margin + 4, cursorY + 38); // Minimal spacing
  doc.restore();

  // TO box (right)
  drawRect(margin + colWidth + 6, cursorY, colWidth, detailsHeight, brand.white, brand.border); // Minimal gap
  doc.save();
  doc.fillColor(brand.dark).fontSize(8).font("Helvetica-Bold"); // Small font
  doc.text("TO", margin + colWidth + 10, cursorY + 3); // Minimal spacing
  
  doc.fillColor(brand.dark).fontSize(7).font("Helvetica-Bold"); // Small font
  doc.text(to?.name || "Customer", margin + colWidth + 10, cursorY + 12); // Minimal spacing
  
  doc.fillColor(brand.gray).fontSize(5).font("Helvetica"); // Very small font
  doc.text(to?.email || "", margin + colWidth + 10, cursorY + 20); // Minimal spacing
  doc.text(to?.phone || "", margin + colWidth + 10, cursorY + 26); // Minimal spacing
  doc.text(to?.address || "", margin + colWidth + 10, cursorY + 32); // Minimal spacing
  doc.text(`${to?.city || ""} ${to?.state || ""} ${to?.pincode || ""}`, margin + colWidth + 10, cursorY + 38); // Minimal spacing
  doc.restore();

  cursorY += detailsHeight + 6; // Minimal spacing

  // Items Table - ultra compact design
  const tableHeaderHeight = 15; // Very small header
  const rowHeight = 12; // Very small rows
  
  // Table header
  drawRect(margin, cursorY, contentWidth, tableHeaderHeight, brand.primary, brand.primary);
  doc.save();
  doc.fillColor(brand.white).fontSize(6).font("Helvetica-Bold"); // Very small font
  
  // Column positions - ultra compact layout
  const columns = [
    { x: margin + 2, width: 18, text: "S.No", align: "center" }, // Very small widths
    { x: margin + 25, width: 50, text: "Category", align: "left" },
    { x: margin + 80, width: 80, text: "Product", align: "left" },
    { x: margin + 165, width: 40, text: "Actual", align: "right" },
    { x: margin + 210, width: 40, text: "Offer", align: "right" },
    { x: margin + 255, width: 20, text: "Qty", align: "center" },
    { x: margin + 280, width: 50, text: "Amount", align: "right" }
  ];

  columns.forEach(col => {
    doc.text(col.text, col.x, cursorY + 3, { width: col.width, align: col.align }); // Minimal spacing
  });
  doc.restore();

  cursorY += tableHeaderHeight;

  // Table rows
  (items || []).forEach((item, index) => {
    const isEven = index % 2 === 0;
    const rowColor = isEven ? brand.white : brand.lighter;
    
    drawRect(margin, cursorY, contentWidth, rowHeight, rowColor, brand.border);
    
    doc.save();
    doc.fillColor(brand.dark).fontSize(5).font("Helvetica"); // Very small font
    
    const itemName = item?.product || item?.name || 'Unknown Item';
    const itemQuantity = item?.quantity || 0;
    const itemPrice = item?.offerPrice || item?.price || 0;
    const actualPrice = item?.actualPrice || item?.price || 0;
    const amount = itemPrice * itemQuantity; // Calculate amount correctly
    
    // Truncate long product names
    const truncatedName = itemName.length > 10 ? itemName.substring(0, 8) + '..' : itemName; // Very short
    
    // S.No
    doc.text(String(index + 1), columns[0].x, cursorY + 2, { width: columns[0].width, align: columns[0].align }); // Minimal spacing
    
    // Category
    doc.text(item?.category || "", columns[1].x, cursorY + 2, { width: columns[1].width, align: columns[1].align }); // Minimal spacing
    
    // Product
    doc.text(truncatedName, columns[2].x, cursorY + 2, { width: columns[2].width, align: columns[2].align }); // Minimal spacing
    
    // Actual Price
    doc.text(formatCurrency(actualPrice), columns[3].x, cursorY + 2, { width: columns[3].width, align: columns[3].align }); // Minimal spacing
    
    // Offer Price
    doc.text(formatCurrency(itemPrice), columns[4].x, cursorY + 2, { width: columns[4].width, align: columns[4].align }); // Minimal spacing
    
    // Quantity
    doc.text(String(itemQuantity), columns[5].x, cursorY + 2, { width: columns[5].width, align: columns[5].align }); // Minimal spacing
    
    // Amount (quantity × price)
    doc.text(formatCurrency(amount), columns[6].x, cursorY + 2, { width: columns[6].width, align: columns[6].align }); // Minimal spacing
    
    doc.restore();
    
    cursorY += rowHeight;
  });

  // Order Summary Section - ultra compact design
  cursorY += 4; // Minimal spacing
  const summaryHeight = 35; // Very small height
  
  drawRect(margin, cursorY, contentWidth, summaryHeight, brand.white, brand.border);
  
  doc.save();
  doc.fillColor(brand.dark).fontSize(8).font("Helvetica-Bold"); // Small font
  doc.text("ORDER SUMMARY", margin + 6, cursorY + 4); // Minimal spacing
  
  // Calculate totals correctly
  const totalProducts = (items || []).reduce((sum, item) => sum + (item?.quantity || 0), 0);
  const totalAmount = (items || []).reduce((sum, item) => {
    const price = item?.offerPrice || item?.price || 0;
    const qty = item?.quantity || 0;
    return sum + (price * qty); // Calculate total correctly
  }, 0);
  
  // Summary details (left side)
  doc.fillColor(brand.dark).fontSize(6).font("Helvetica"); // Very small font
  doc.text(`Total Products: ${totalProducts}`, margin + 6, cursorY + 14); // Minimal spacing
  doc.text(`Subtotal: ${formatCurrency(totalAmount)}`, margin + 6, cursorY + 22); // Minimal spacing
  doc.fillColor(brand.warning).fontSize(5).font("Helvetica"); // Very small font
  doc.text("Minimum order value: ₹3,000", margin + 6, cursorY + 30); // Minimal spacing
  
  // Total amount box (right side)
  const totalBoxWidth = 70; // Very small width
  const totalBoxHeight = 25; // Very small height
  const totalBoxX = margin + contentWidth - totalBoxWidth - 6; // Minimal spacing
  const totalBoxY = cursorY + 8; // Minimal spacing
  
  drawRect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight, brand.white, brand.border);
  
  doc.fillColor(brand.dark).fontSize(7).font("Helvetica-Bold"); // Small font
  doc.text(`TOTAL: ${formatCurrency(totalAmount)}`, totalBoxX, totalBoxY + 6, { // Minimal spacing
    width: totalBoxWidth, 
    align: "center" 
  });
  
  doc.restore();

  // Footer Section - ultra compact design
  cursorY = pageHeight - margin - 20; // Very small footer
  
  drawRect(margin, cursorY, contentWidth, 15, brand.primary, brand.primary); // Very small height
  
  doc.save();
  doc.fillColor(brand.white).fontSize(6).font("Helvetica-Bold"); // Very small font
  doc.text("Thank you for choosing Prithivik Crackers!", margin, cursorY + 3, { // Minimal spacing
    width: contentWidth, 
    align: "center" 
  });
  
  doc.fillColor(brand.white).fontSize(5).font("Helvetica"); // Very small font
  doc.text("For any queries, contact us at info@prithivikcrackers.com", margin, cursorY + 9, { // Minimal spacing
    width: contentWidth, 
    align: "center" 
  });
  doc.restore();
}

// Route 1: Send Email with PDF
app.post("/send-order-pdf", async (req, res) => {
  try {
    console.log("Received request body:", JSON.stringify(req.body, null, 2));
    
    const { toEmail, customer, items, totals } = req.body;

    // Validate required fields
    if (!toEmail) {
      console.log("Missing email");
      return res.status(400).json({ error: "Email is required" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log("Missing or empty items array");
      return res.status(400).json({ error: "Items array is required and must not be empty" });
    }

    // Create orderDetails from totals
    const orderDetails = {
      orderId: `ORD-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      status: "Pending",
      total: totals?.finalTotal || totals?.total || 0
    };

    // Create from object (company details)
    const from = {
      name: "Prithivik Crackers",
      email: "info@prithivikcrackers.com",
      phone: "+91-9876543210",
      address: "Sivakasi, Tamil Nadu"
    };

    // Log email configuration status (but don't fail)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("Email configuration missing - will skip email sending");
    }

    const doc = new PDFDocument({ margin: 50 });
    const pdfBuffer = [];

    doc.on("data", (chunk) => pdfBuffer.push(chunk));
    doc.on("end", async () => {
      const finalPdf = Buffer.concat(pdfBuffer);

      // Try to send email, but don't fail if email config is missing
      try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
          console.log("Email configuration missing - skipping email send");
          return res.status(200).json({ 
            message: "Order processed successfully! Email not sent due to missing configuration.",
            orderId: orderDetails.orderId,
            pdfGenerated: true
          });
        }

        // Send to customer
        const customerMailOptions = {
          from: process.env.EMAIL_USER,
          to: toEmail,
          subject: `Order Confirmation - ${orderDetails.orderId}`,
          text: "Please find your order details attached.",
          attachments: [
            {
              filename: `Order_${orderDetails.orderId}.pdf`,
              content: finalPdf,
            },
          ],
        };

        // Send to company
        const companyMailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER, // Send to company email
          subject: `New Order Received - ${orderDetails.orderId}`,
          text: `A new order has been placed by ${customer.name} (${customer.email}). Please find the order details attached.`,
          attachments: [
            {
              filename: `Order_${orderDetails.orderId}.pdf`,
              content: finalPdf,
            },
          ],
        };

        // Send both emails
        await Promise.all([
          transporter.sendMail(customerMailOptions),
          transporter.sendMail(companyMailOptions)
        ]);

        res.status(200).json({ 
          message: "Order confirmation sent to customer and company!", 
          orderId: orderDetails.orderId 
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError.message);
        // Still return success since PDF was generated
        res.status(200).json({ 
          message: "Order processed successfully! Email failed to send.",
          orderId: orderDetails.orderId,
          pdfGenerated: true,
          emailError: emailError.message
        });
      }
    });

    // Generate PDF content
    generateOrderPDF(doc, from, customer, items, orderDetails);
    doc.end();
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Route 2: Generate PDF and Send as Base64 (for WhatsApp)
app.post("/generate-order-pdf", async (req, res) => {
  try {
    const { customer, items, totals } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items array is required and must not be empty" });
    }

    // Create orderDetails from totals
    const orderDetails = {
      orderId: `ORD-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      status: "Pending",
      total: totals?.finalTotal || totals?.total || 0
    };

    // Create from object (company details)
    const from = {
      name: "Prithivik Crackers",
      email: "info@prithivikcrackers.com",
      phone: "+91-9876543210",
      address: "Sivakasi, Tamil Nadu"
    };

    const doc = new PDFDocument({ margin: 50 });
    const pdfBuffer = [];

    doc.on("data", (chunk) => pdfBuffer.push(chunk));
    doc.on("end", () => {
      const finalPdf = Buffer.concat(pdfBuffer);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="order.pdf"');
      res.setHeader("Content-Length", String(finalPdf.length));
      return res.status(200).send(finalPdf);
    });

    generateOrderPDF(doc, from, customer, items, orderDetails);
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Server is running!", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
