import { BookOpen, CheckCircle2 } from 'lucide-react';

const categories = [
  {
    title: 'Web Development',
    courses: 25,
    learners: '15K+',
    duration: '6 month to complete',
  },
  {
    title: 'Data Science',
    courses: 18,
    learners: '8K+',
    duration: '8 month to complete',
  },
  {
    title: 'Digital Marketing',
    courses: 15,
    learners: '10K+',
    duration: '4 month to complete',
  },
];

export default function Categories() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Career Path
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Structured learning paths designed to take you from beginner to professional
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{category.title}</h3>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  <span>{category.courses} Courses</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  <span>{category.learners} Learners</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  <span>{category.duration}</span>
                </div>
              </div>
              <button className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition font-medium">
                Start Learning
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
