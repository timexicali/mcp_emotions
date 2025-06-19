import React from 'react';
import { Link } from 'react-router-dom';

const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            How we protect and handle your data
          </p>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                At EmotionWise, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, and safeguard your data when you use our emotion detection service.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Email address (for account creation and authentication)</li>
                    <li>Password (encrypted and securely stored)</li>
                    <li>Account preferences and settings</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Usage Data</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Text content you submit for emotion analysis</li>
                    <li>Emotion detection results and confidence scores</li>
                    <li>Session information and timestamps</li>
                    <li>Feedback and ratings you provide</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Technical Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>IP address and location data</li>
                    <li>Browser type and version</li>
                    <li>Device information and operating system</li>
                    <li>Usage patterns and analytics data</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Service Provision</h3>
                  <p className="text-blue-800">
                    To provide emotion detection services, process your requests, and deliver accurate results.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Account Management</h3>
                  <p className="text-green-800">
                    To create and manage your account, authenticate your identity, and provide customer support.
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Service Improvement</h3>
                  <p className="text-purple-800">
                    To improve our AI models, enhance accuracy, and develop new features based on usage patterns.
                  </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">Communication</h3>
                  <p className="text-orange-800">
                    To send important updates, security notifications, and respond to your inquiries.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Encryption</h3>
                    <p className="text-gray-700">
                      All data is encrypted in transit using TLS/SSL protocols and at rest using industry-standard encryption.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Access Control</h3>
                    <p className="text-gray-700">
                      Strict access controls and authentication mechanisms protect your data from unauthorized access.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Regular Audits</h3>
                    <p className="text-gray-700">
                      We conduct regular security audits and assessments to maintain the highest security standards.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Data Minimization</h3>
                    <p className="text-gray-700">
                      We only collect and retain the minimum amount of data necessary to provide our services.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sharing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share data only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our platform (hosting, analytics, etc.)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-2">Access & Portability</h3>
                  <p className="text-indigo-800">
                    You can access your data and request a copy of your information in a portable format.
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Deletion</h3>
                  <p className="text-red-800">
                    You can request deletion of your account and associated data at any time.
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Correction</h3>
                  <p className="text-yellow-800">
                    You can update or correct your personal information through your account settings.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Opt-out</h3>
                  <p className="text-green-800">
                    You can opt out of non-essential communications and data processing activities.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> privacy@emotionwise.ai</p>
                  <p><strong>Response Time:</strong> We aim to respond to all privacy inquiries within 48 hours.</p>
                </div>
              </div>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. 
                We will notify you of any material changes by posting the updated policy on our website and updating the "Last Updated" date.
              </p>
            </section>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 