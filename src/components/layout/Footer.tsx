import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-6 group">
              <img src="/logo.png" alt="VitaNips" className="h-8 w-auto transition-transform group-hover:scale-105" />
              <span className="ml-2 text-xl font-bold text-gray-900">Vita<span className="text-primary">Nips</span></span>
            </Link>
            <p className="text-gray-500 leading-relaxed text-sm">
              Empowering your health journey with secure, accessible, and intelligent management tools. Your wellness, reimagined.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/dashboard" className="text-sm text-gray-500 hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link to="/appointments" className="text-sm text-gray-500 hover:text-primary transition-colors">Appointments</Link></li>
              <li><Link to="/prescriptions" className="text-sm text-gray-500 hover:text-primary transition-colors">Prescriptions</Link></li>
              <li><Link to="/doctors" className="text-sm text-gray-500 hover:text-primary transition-colors">Find Doctors</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-gray-500 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-sm text-gray-500 hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-500 hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/help" className="text-sm text-gray-500 hover:text-primary transition-colors">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-sm text-gray-500 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-500 hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookie-policy" className="text-sm text-gray-500 hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link to="/hipaa" className="text-sm text-gray-500 hover:text-primary transition-colors">HIPAA Compliance</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} VitaNips Healthcare Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
              <span className="sr-only">Facebook</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
              <span className="sr-only">Instagram</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.153-1.772c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.48 2h.08zm-5.233 7.803c-1.144 0-2.063.926-2.063 2.065 0 1.138.926 2.063 2.063 2.063.926 0 1.855-.678 1.855-1.855 0-1.338-.012-2.419-.012-2.747 0-.268.18-.58.688-.482.103-.253.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338.012 2.419.012 2.747 0 .268.18.58.688.482zM12 7a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
