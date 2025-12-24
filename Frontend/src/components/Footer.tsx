import { GraduationCap, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-8 h-8 text-teal-500" />
              <span className="text-xl font-bold text-gray-900">EduPath</span>
            </div>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Empowering learners worldwide with quality education and personalized learning paths.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center hover:bg-teal-500 hover:text-white transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center hover:bg-teal-500 hover:text-white transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center hover:bg-teal-500 hover:text-white transition">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center hover:bg-teal-500 hover:text-white transition">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-teal-500 transition text-sm">Browse Courses</a></li>
              <li><a href="#" className="text-gray-600 hover:text-teal-500 transition text-sm">Career Paths</a></li>
              <li><a href="#" className="text-gray-600 hover:text-teal-500 transition text-sm">My Learning</a></li>
              <li><a href="#" className="text-gray-600 hover:text-teal-500 transition text-sm">Become a Instructor</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-teal-500 transition text-sm">Help Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-teal-500 transition text-sm">Contact Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-teal-500 transition text-sm">FAQs</a></li>
              <li><a href="#" className="text-gray-600 hover:text-teal-500 transition text-sm">Community</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-teal-500 transition text-sm">Terms & Conditions</a></li>
              <li><a href="#" className="text-gray-600 hover:text-teal-500 transition text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-teal-500 transition text-sm">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-teal-500 transition text-sm">Accessibility</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-600 text-sm">© 2025 EduPath. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
