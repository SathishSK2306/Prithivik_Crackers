import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const OrderForm = ({ onSubmit, cart, total, discount, final }) => {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
  });

  // Backend API base (Render)
  const API_BASE = "https://prithivik-crackers.onrender.com";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (final < 3000) {
      alert(
        `Minimum order value is ₹3000. Your order total is ₹${final.toFixed(
          2
        )}.`
      );
      return;
    }
    if (!formValues.email) {
      alert("Please enter a valid email.");
      return;
    }

    // Build items and totals for PDF
    const items = (cart || []).map((it) => ({
      category: it.category || "",
      product: it.product || it.name || "",
      actualPrice: Number(it.actualPrice ?? it.price ?? 0),
      offerPrice: Number(it.offerPrice ?? it.price ?? 0),
      quantity: Number(it.quantity || 0),
    }));
    const totals = {
      totalProducts: (cart || []).reduce(
        (s, it) => s + Number(it.quantity || 0),
        0
      ),
      totalPrice: Number(total || 0),
      finalTotal: Number(final || 0),
      total: Number(final || 0),
    };

    try {
      await axios.post(`${API_BASE}/send-order-pdf`, {
        toEmail: formValues.email,
        customer: formValues,
        items,
        totals,
      });
      alert("Order PDF emailed!");
    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to email PDF. Proceeding with order."
      );
    }

    onSubmit(formValues);
  };

  const downloadPDF = async () => {
    if (final < 3000) {
      alert("Minimum order value is ₹3000 to download estimate.");
      return;
    }
    if (!cart || cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    // Build items and totals exactly like the email route
    const items = (cart || []).map((it) => ({
      category: it.category || "",
      product: it.product || it.name || "",
      actualPrice: Number(it.actualPrice ?? it.price ?? 0),
      offerPrice: Number(it.offerPrice ?? it.price ?? 0),
      quantity: Number(it.quantity || 0),
    }));
    const totals = {
      totalProducts: (cart || []).reduce(
        (s, it) => s + Number(it.quantity || 0),
        0
      ),
      totalPrice: Number(total || 0),
      finalTotal: Number(final || 0),
      total: Number(final || 0),
    };

    try {
      const response = await axios.post(
        `${API_BASE}/generate-order-pdf`,
        { customer: formValues, items, totals },
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "order.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message || err?.message || "Failed to download PDF"
      );
    }
  };

  return (
    <div className="w-full px-4">
      <div className="max-w-4xl mx-auto p-8 bg-[#F6FAFD] rounded border border-[#1A3D63] shadow">
        <h2 className="text-2xl mb-6 font-bold text-center text-[#1A3D63]">
          Place Your Details
        </h2>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          <input
            className="border p-3 rounded"
            name="name"
            value={formValues.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />
          <input
            className="border p-3 rounded"
            name="email"
            value={formValues.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            className="border p-3 rounded"
            name="phone"
            value={formValues.phone}
            onChange={handleChange}
            placeholder="Whatsapp"
            required
          />
          <input
            className="border p-3 rounded"
            name="address"
            value={formValues.address}
            onChange={handleChange}
            placeholder="Address"
            required
          />
          <input
            className="border p-3 rounded"
            name="pincode"
            value={formValues.pincode}
            onChange={handleChange}
            placeholder="Pincode"
            required
          />
          <input
            className="border p-3 rounded"
            name="city"
            value={formValues.city}
            onChange={handleChange}
            placeholder="City"
            required
          />
          <input
            className="border p-3 rounded"
            name="state"
            value={formValues.state}
            onChange={handleChange}
            placeholder="State"
            required
          />

          <div className="md:col-span-2 flex flex-col md:flex-row gap-4 items-center">
            <button
              type="submit"
              className={`w-full py-3 rounded text-white ${
                final >= 3000
                  ? "bg-[#1A3D63] hover:bg-[#12314f]"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={final < 3000}
            >
              {final < 3000
                ? `Need ₹${(3000 - final).toFixed(2)} more`
                : "Place the Order"}
            </button>

            <button
              type="button"
              onClick={downloadPDF}
              className={`w-full py-3 rounded text-white ${
                final >= 3000
                  ? "bg-green-700 hover:bg-green-800"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={final < 3000}
            >
              Download Estimate
            </button>
          </div>

          <div className="md:col-span-2 text-sm text-gray-500 mt-2">
            * Minimum order value is ₹3000
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
