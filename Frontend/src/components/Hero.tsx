export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-teal-100 via-teal-50 to-cyan-100 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Learn Your Way to Success
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Transform your career with personalized learning paths designed by industry experts. Start learning today and unlock your potential.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <button className="bg-teal-500 text-white px-8 py-3 rounded-lg hover:bg-teal-600 transition font-medium shadow-md hover:shadow-lg">
                Explore Courses
              </button>
              <button className="bg-white text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-50 transition font-medium shadow-md hover:shadow-lg border border-gray-200">
                Watch Demo
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 md:gap-8">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">50K+</div>
                <div className="text-sm text-gray-600">Active Leaners</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">100+</div>
                <div className="text-sm text-gray-600">Expert Courses</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-teal-400 to-teal-500 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Students learning together"
                className="w-full h-full object-cover mix-blend-overlay opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/30 to-teal-500/30"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
