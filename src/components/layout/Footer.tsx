import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PaperAirplaneIcon 
} from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 mt-auto rounded-t-[3rem] relative overflow-hidden">
        {/* Decorative elements - Subtle gradients for light theme */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 pointer-events-none opacity-50" />
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-accent/5 rounded-full blur-3xl translate-y-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column (Larger focus) */}
          <div className="lg:col-span-5 pr-8">
            <Link to="/" className="inline-block group mb-8">
                <div className="flex items-center gap-3">
                    {/* Logo on light background - no white box needed if logo is dark/colored */}
                    <img src="/logo.png" alt="VitaNips" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
                    <span className="text-3xl font-display font-medium tracking-tight text-primary-900">
                        VitaNips
                    </span>
                </div>
            </Link>
            <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-md font-light">
              Health without the Wahala. Stop treating your health like a hustle. Skip the traffic and queues—access verified doctors and medications from your phone.
            </p>
            
            {/* Newsletter Input */}
            <div className="relative max-w-sm">
                <input 
                    type="email" 
                    placeholder="Subscribe to our newsletter" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-full py-3.5 pl-6 pr-14 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                />
                <button className="absolute right-2 top-2 p-1.5 bg-primary-900 hover:bg-primary-800 text-white rounded-full transition-colors shadow-lg shadow-primary-900/10">
                    <PaperAirplaneIcon className="h-4 w-4" />
                </button>
            </div>
          </div>
          
          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-display font-medium text-primary-900 mb-6">Platform</h3>
            <ul className="space-y-4">
              <li><Link to="/dashboard" className="text-gray-500 hover:text-primary-900 transition-colors text-sm font-medium hover:tracking-wide duration-300 block">Dashboard</Link></li>
              <li><Link to="/appointments" className="text-gray-500 hover:text-primary-900 transition-colors text-sm font-medium hover:tracking-wide duration-300 block">Appointments</Link></li>
              <li><Link to="/prescriptions" className="text-gray-500 hover:text-primary-900 transition-colors text-sm font-medium hover:tracking-wide duration-300 block">Prescriptions</Link></li>
              <li><Link to="/doctors" className="text-gray-500 hover:text-primary-900 transition-colors text-sm font-medium hover:tracking-wide duration-300 block">Find Doctors</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-lg font-display font-medium text-primary-900 mb-6">Company</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-gray-500 hover:text-primary-900 transition-colors text-sm font-medium hover:tracking-wide duration-300 block">About Us</Link></li>
              <li><Link to="/careers" className="text-gray-500 hover:text-primary-900 transition-colors text-sm font-medium hover:tracking-wide duration-300 block">Careers</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-primary-900 transition-colors text-sm font-medium hover:tracking-wide duration-300 block">Contact</Link></li>
              <li><Link to="/help" className="text-gray-500 hover:text-primary-900 transition-colors text-sm font-medium hover:tracking-wide duration-300 block">Support</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
             <h3 className="text-lg font-display font-medium text-primary-900 mb-6">Contact</h3>
             <ul className="space-y-4">
                <li className="flex items-start gap-3">
                    <span className="text-gray-500 text-sm">123 Health Avenue,<br/>Wellness District, NY 10012</span>
                </li>
                 <li className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm hover:text-primary-900 transition-colors">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm hover:text-primary-900 transition-colors">info@vitanips.com</span>
                </li>
             </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 font-medium">
            &copy; {currentYear} VitaNips Healthcare Inc.
          </p>
          
          <div className="flex gap-6 text-sm text-gray-500">
             <Link to="/privacy" className="hover:text-primary-900 transition-colors">Privacy</Link>
             <Link to="/terms" className="hover:text-primary-900 transition-colors">Terms</Link>
             <Link to="/cookies" className="hover:text-primary-900 transition-colors">Cookies</Link>
          </div>

          <div className="flex space-x-4">
            <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-primary-900 hover:bg-gray-100 transition-all transform hover:-translate-y-1">
              <span className="sr-only">Twitter</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
            </a>
            <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-primary-900 hover:bg-gray-100 transition-all transform hover:-translate-y-1">
              <span className="sr-only">Facebook</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
            </a>
            <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-primary-900 hover:bg-gray-100 transition-all transform hover:-translate-y-1">
              <span className="sr-only">Instagram</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.153-1.772c-.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.48 2h.08zm-5.233 7.803c-1.144 0-2.063.926-2.063 2.065 0 1.138.926 2.063 2.063 2.063.926 0 1.855-.678 1.855-1.855 0-1.338-.012-2.419-.012-2.747 0-.268.18-.58.688-.482.103-.253.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338.012 2.419.012 2.747 0 .268.18.58.688.482zM12 7a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
