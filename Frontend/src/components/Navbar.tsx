import { Menu, X, Search, GraduationCap } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-teal-500" />
            <span className="text-xl font-bold text-gray-900">EduPath</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-gray-900 font-medium hover:text-teal-500 transition">Home</a>
            <a href="#courses" className="text-gray-600 hover:text-teal-500 transition">Courses</a>
            <a href="#dashboard" className="text-gray-600 hover:text-teal-500 transition">Dashboard</a>
            <a href="#edupath" className="text-gray-600 hover:text-teal-500 transition">EduPath</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Courses"
                className="pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-40"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <button className="text-gray-900 font-medium hover:text-teal-500 transition flex items-center gap-1">
              <span>Sign In</span>
            </button>
            <button className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition font-medium">
              Get Started
            </button>
          </div>

          <button
            className="md:hidden text-gray-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-3">
            <a href="#home" className="block text-gray-900 font-medium hover:text-teal-500 transition py-2">Home</a>
            <a href="#courses" className="block text-gray-600 hover:text-teal-500 transition py-2">Courses</a>
            <a href="#dashboard" className="block text-gray-600 hover:text-teal-500 transition py-2">Dashboard</a>
            <a href="#edupath" className="block text-gray-600 hover:text-teal-500 transition py-2">EduPath</a>
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <button className="w-full text-gray-900 font-medium hover:text-teal-500 transition py-2 text-left">
                Sign In
              </button>
              <button className="w-full bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition font-medium">
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
