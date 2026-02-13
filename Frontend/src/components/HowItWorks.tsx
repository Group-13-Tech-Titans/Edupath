import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals with real-world experience',
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Join thousands of learners and grow together',
  },
  {
    icon: Award,
    title: 'Recognized Certificates',
    description: 'Earn credentials valued by top employers',
  },
  {
    icon: TrendingUp,
    title: 'Career Growth',
    description: 'Advance your career with in-demand skills',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How EduPath works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Start your learning journey in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-teal-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
