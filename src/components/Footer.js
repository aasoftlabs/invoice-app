import Link from "next/link";
import { Mail, ArrowRight, Github, Linkedin, Instagram } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-gray-200 relative overflow-hidden transition-colors duration-300">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-50/50 to-transparent pointer-events-none"></div>

      <div className="max-w-full px-40 m-auto relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 py-16">
          {/* Company Info */}
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-sm text-slate-600 mb-4 max-w-md leading-relaxed">
              Next-Gen Web & Mobile Engineering. Building scalable solutions
              with cutting-edge technology.
            </p>
            <p className="text-xs text-slate-500">
              AA SoftLabs is a trading name of ADMINASHU SOFTLABS.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/invoices"
                  className="group inline-flex items-center text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Invoices
                </Link>
              </li>
              <li>
                <Link
                  href="/payroll"
                  className="group inline-flex items-center text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Payroll
                </Link>
              </li>
              <li>
                <Link
                  href="/project"
                  className="group inline-flex items-center text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Legal & Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="https://aasoftlabs.com/privacy"
                  className="group inline-flex items-center text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="https://aasoftlabs.com/terms"
                  className="group inline-flex items-center text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="https://aasoftlabs.com/contact"
                  className="group inline-flex items-center text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500 flex items-center gap-1">
              <Image src="/logo.png" alt="Logo" width={16} height={16} />{" "}
              <span>
                &copy; {new Date().getFullYear()} ADMINASHU SOFTLABS. All rights
                reserved.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/aasoftlabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-600 transition-colors"
                aria-label="X (Twitter)"
              >
                <FaXTwitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/aasoftlabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/aasoftlabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/aasoftlabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
