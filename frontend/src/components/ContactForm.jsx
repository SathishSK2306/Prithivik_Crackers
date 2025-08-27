import React, { useState } from "react";
import axios from "axios";

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter email");
    try {
      setIsSending(true);
      await axios.post(`${API_BASE}/send-welcome`, { email, name });
      alert("Welcome email sent!");
      setName("");
      setEmail("");
    } catch (err) {
      alert(
        err?.response?.data?.message || err?.message || "Failed to send email"
      );
    } finally {
      setIsSending(false);
    }
  };
  return (
    <div className="bg-[#1A3D63] text-white py-12 px-4 sm:px-8 md:px-16 lg:px-32 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-5xl mx-auto bg-white text-gray-900 rounded-2xl shadow-lg p-8 flex flex-col md:flex-row gap-8 relative">
        {/* 🗺️ Google Map Section */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-center mb-6 text-[#1A3D63]">
            Our Location
          </h2>
          <div className="w-full h-96 rounded-xl overflow-hidden shadow-md border border-gray-300">
            <iframe
              title="Prithivik Crackers Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d233.858773729539!2d77.79156041240681!3d9.376034537297508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b06c9aaafadc54d%3A0x4500c10f796eec5e!2s9QGR%2BCJ8%2C%20Vijayakarisalkulam%20-%20Thayilpatti%20Rd%2C%20Tamil%20Nadu%20626128!5e1!3m2!1sen!2sin!4v1753259340647!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* 🧾 Contact Info + Welcome Email Section */}
        <div className="flex-1 flex flex-col justify-center items-center bg-[#f5f7fa] rounded-xl p-6 shadow-inner text-center gap-4">
          <h3 className="text-xl font-semibold text-[#1A3D63] mb-2">
            PRITHIVIK CRACKERS
          </h3>
          <p className="mb-1">
            1/214, North Street,
            <br />
            Madathupatti, Sivakasi, Virudhunagar 626 128
          </p>
          <p className="mb-1">
            WhatsApp:{" "}
            <a
              href="tel:7904648644"
              className="text-blue-600 hover:underline font-semibold"
            >
              7904648644
            </a>
          </p>
          <p>
            Email:{" "}
            <a
              href="mailto:prithivikcrackers@gmail.com"
              className="text-blue-600 hover:underline font-semibold"
            >
              prithivikcrackers@gmail.com
            </a>
          </p>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm grid grid-cols-1 gap-3 text-left"
          >
            <input
              className="border p-3 rounded"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border p-3 rounded"
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className={`w-full py-3 rounded text-white ${
                isSending ? "bg-gray-400" : "bg-[#1A3D63] hover:bg-[#12314f]"
              }`}
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send Welcome Email"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
