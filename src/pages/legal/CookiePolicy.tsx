import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-primary/5 px-8 py-12 text-center border-b border-gray-100">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-xl shadow-sm mb-6">
              <GlobeAltIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              This policy explains how we use cookies and similar technologies to recognize you when you visit our website.
            </p>
            <p className="text-sm text-gray-500 mt-4">Last Updated: December 7, 2025</p>
          </div>

          <div className="p-8 md:p-12 prose prose-lg max-w-none text-gray-600">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What are cookies?</h2>
              <p>
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Why do we use cookies?</h2>
              <p>
                We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
              <div className="space-y-6 mt-4">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Essential Cookies</h3>
                  <p className="text-sm">These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Performance & Analytics Cookies</h3>
                  <p className="text-sm">These cookies collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Functionality Cookies</h3>
                  <p className="text-sm">These cookies are used to enhance the performance and functionality of our Website but are non-essential to their use.</p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How can I control cookies?</h2>
              <p>
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. In addition, most advertising networks offer you a way to opt out of targeted advertising.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Updates to this policy</h2>
              <p>
                We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CookiePolicy;
