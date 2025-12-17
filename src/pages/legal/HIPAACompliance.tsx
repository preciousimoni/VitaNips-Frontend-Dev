import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { LockClosedIcon } from '@heroicons/react/24/outline';

const HIPAACompliance: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-primary/5 px-8 py-12 text-center border-b border-gray-100">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-xl shadow-sm mb-6">
              <LockClosedIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">HIPAA Compliance</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              VitaNips is fully committed to compliance with the Health Insurance Portability and Accountability Act (HIPAA) to ensure the security and privacy of your health information.
            </p>
          </div>

          <div className="p-8 md:p-12 prose prose-lg max-w-none text-gray-600">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
              <p>
                As a healthcare technology provider, we understand the critical importance of protecting sensitive patient data. We have implemented robust administrative, physical, and technical safeguards to ensure the confidentiality, integrity, and availability of Protected Health Information (PHI).
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Measures</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Data Encryption</h3>
                  <p className="text-sm">All PHI is encrypted both in transit (using TLS 1.2+) and at rest (using AES-256 encryption) to prevent unauthorized access.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Access Controls</h3>
                  <p className="text-sm">Strict role-based access controls ensure that only authorized personnel and healthcare providers can access patient data.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Audit Logs</h3>
                  <p className="text-sm">We maintain detailed audit logs of all system activity to monitor access and detect any potential security incidents.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Regular Audits</h3>
                  <p className="text-sm">We conduct regular security risk assessments and compliance audits to identify and address potential vulnerabilities.</p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Associate Agreements (BAA)</h2>
              <p>
                We enter into Business Associate Agreements (BAAs) with all our partners and vendors who handle PHI on our behalf, ensuring that they also adhere to strict HIPAA compliance standards.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Rights</h2>
              <p>
                Under HIPAA, you have specific rights regarding your health information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>The right to access and obtain a copy of your health records.</li>
                <li>The right to request corrections to your health records.</li>
                <li>The right to request restrictions on how your information is used or shared.</li>
                <li>The right to receive a notice of our privacy practices.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Officer</h2>
              <p>
                If you have any questions about our HIPAA compliance or wish to exercise your rights, please contact our Privacy Officer at <a href="mailto:support@vitanips.com" className="text-primary hover:underline">support@vitanips.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HIPAACompliance;
