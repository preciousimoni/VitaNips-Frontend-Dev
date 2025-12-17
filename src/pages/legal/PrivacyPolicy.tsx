import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header variant="landing" />
      
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-primary/5 px-8 py-12 text-center border-b border-gray-100">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-xl shadow-sm mb-6">
              <ShieldCheckIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your privacy is our priority. This policy outlines how VitaNips collects, uses, and protects your personal health information.
            </p>
            <p className="text-sm text-gray-500 mt-4">Last Updated: December 7, 2025</p>
          </div>

          <div className="p-8 md:p-12 prose prose-lg max-w-none text-gray-600">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p>
                VitaNips ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our healthcare management services.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <p>We collect information that identifies, relates to, describes, references, is capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or device ("personal information").</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Personal Identifiers:</strong> Name, email address, phone number, date of birth.</li>
                <li><strong>Protected Health Information (PHI):</strong> Medical history, prescriptions, insurance details, and other health-related data.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, operating system, and usage data.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>To provide and manage your account and our services.</li>
                <li>To facilitate appointments with healthcare providers.</li>
                <li>To process prescription orders and refills.</li>
                <li>To communicate with you regarding your health and our services.</li>
                <li>To improve our platform and user experience.</li>
                <li>To comply with legal obligations, including HIPAA regulations.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our services is at your own risk.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Sharing Your Information</h2>
              <p>
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Healthcare Providers:</strong> Doctors and pharmacies you interact with on the platform.</li>
                <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (e.g., payment processing, data hosting).</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your data. Please contact us to exercise these rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
              <p>
                If you have questions or comments about this policy, you may email us at <a href="mailto:support@vitanips.com" className="text-primary hover:underline">support@vitanips.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
