import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Software Developer',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    text: 'EduPath transformed my career. The web development path gave me the skills to land my dream job in just 6 months!',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Data Analyst',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
    text: 'The quality of instruction and support from the community is outstanding. Highly recommend!',
    rating: 5,
  },
  {
    name: 'Emma Williams',
    role: 'Digital Marketer',
    image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
    text: 'I went from zero knowledge to running successful campaigns in just 3 months. Amazing platform!',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Student Stay
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of successful learners who transformed their careers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
