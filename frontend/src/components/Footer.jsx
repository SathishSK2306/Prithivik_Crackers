// src/components/Footer.js
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#0A1931] text-white py-4 mt-10">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <p className="text-sm">
          © It's created by <span></span>
          <a
            href="https://sathish-portfolio-next.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#4FD1C5] hover:underline"
          >
            SathishSK
          </a>
        </p>
        <p className="text-xs mt-1 text-gray-300">All Rights Reserved 2025.</p>
      </div>
    </footer>
  );
};

export default Footer;
