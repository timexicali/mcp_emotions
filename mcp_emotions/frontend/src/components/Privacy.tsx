import React from 'react';

const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy for EmotionWise.ai</h1>
        <div className="text-sm text-gray-500 mb-6">Effective Date: {today}</div>
        <p className="mb-6 text-gray-700">EmotionWise.ai (“we”, “us”, or “our”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our web and mobile applications.</p>
        <hr className="my-6" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">1. Information We Collect</h2>
        <ul className="list-disc pl-6 mb-6 text-gray-700">
          <li>Account Information: Your email address and hashed password.</li>
          <li>Emotion Input Data: Text you enter into the platform for analysis.</li>
          <li>Analysis Results: Detected emotions, sarcasm flags, and session metadata.</li>
          <li>Device and Usage Info: IP address, browser type, operating system, timestamps.</li>
        </ul>
        <hr className="my-6" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 mb-6 text-gray-700">
          <li>Provide emotion detection and related services.</li>
          <li>Improve system performance and model accuracy.</li>
          <li>Communicate with you, including sending email verifications or alerts.</li>
          <li>Ensure the security and integrity of the service.</li>
        </ul>
        <p className="mb-6 text-gray-700">We do not sell or rent your personal data.</p>
        <hr className="my-6" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">3. Data Storage and Retention</h2>
        <ul className="list-disc pl-6 mb-6 text-gray-700">
          <li>Your data is securely stored on servers hosted by Amazon Web Services (AWS Lightsail) in the United States.</li>
          <li>Passwords are stored using industry-standard hashing algorithms.</li>
          <li>Session and emotion data may be retained for research or service improvement.</li>
          <li>You may request deletion of your account and data by contacting us.</li>
        </ul>
        <hr className="my-6" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">4. Sharing of Data</h2>
        <ul className="list-disc pl-6 mb-6 text-gray-700">
          <li>With email service providers to send validation emails.</li>
          <li>With law enforcement when required by applicable law.</li>
          <li>Internally for technical support and system maintenance.</li>
        </ul>
        <hr className="my-6" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">5. Your Rights</h2>
        <ul className="list-disc pl-6 mb-6 text-gray-700">
          <li>Access your personal data.</li>
          <li>Correct or update information.</li>
          <li>Request deletion of your account and associated data.</li>
          <li>Withdraw consent for optional data usage.</li>
        </ul>
        <hr className="my-6" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">6. Cookies and Tracking</h2>
        <p className="mb-6 text-gray-700">We may use basic cookies or analytics tools to understand usage patterns and improve service. You can opt out of cookies through your browser settings.</p>
        <hr className="my-6" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">7. Children's Privacy</h2>
        <p className="mb-6 text-gray-700">EmotionWise.ai is not intended for children under 13 years of age. We do not knowingly collect data from children.</p>
        <hr className="my-6" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">8. Security Practices</h2>
        <p className="mb-6 text-gray-700">We use encryption, strict access controls, and monitoring to protect user data. However, no system is 100% secure. Users are encouraged to use strong passwords.</p>
        <hr className="my-6" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">9. Changes to this Policy</h2>
        <p className="mb-6 text-gray-700">We may update this Privacy Policy from time to time. We will notify users via the website or app when significant changes are made.</p>
        <hr className="my-6" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">10. Contact Us</h2>
        <p className="mb-2 text-gray-700">For any privacy-related concerns or requests, please contact:</p>
        <ul className="list-disc pl-6 mb-6 text-gray-700">
          <li>Email: <a href="mailto:support@emotionwise.ai" className="text-indigo-600 hover:underline">support@emotionwise.ai</a></li>
          <li>Website: <a href="https://emotionwise.ai" className="text-indigo-600 hover:underline">https://emotionwise.ai</a></li>
        </ul>
        <hr className="my-6" />
        <p className="text-gray-700">Thank you for trusting EmotionWise.ai to support your emotional insights journey.</p>
      </div>
    </div>
  );
} 