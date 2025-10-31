import React from 'react';

function Footer() {
  return (
    <footer className="bg-green-900 text-white py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Info */}
        <div>
          <h2 className="text-2xl font-bold mb-3">
            EduSpark <span role="img" aria-label="cap">🎓</span>
          </h2>
          <p className="text-sm text-gray-200">
            EduSpark is a smart school management platform built to simplify admin workflows, student records, and communication. From government to private institutions — we bring efficiency and innovation to every school.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-200">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/about" className="hover:text-white">About</a></li>
            <li><a href="/features" className="hover:text-white">Features</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
          <p className="text-gray-200 text-sm">
            📍 EduSpark HQ, Digital Campus Road, India<br />
            📧 support@eduspark.in<br />
            ☎️ +91-98765-43210
          </p>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="mt-10 text-center text-gray-400 text-sm border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} EduSpark. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
