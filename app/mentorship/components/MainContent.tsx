"use client";
import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// Import Lucide icons as needed

const mentorCategories = [
  { id: 1, name: "Research & Development", count: 245, gradient: "from-blue-500 to-indigo-600" },
  { id: 2, name: "Technology", count: 189, gradient: "from-indigo-500 to-purple-600" },
  { id: 3, name: "Design", count: 176, gradient: "from-purple-500 to-pink-600" },
  { id: 4, name: "Marketing", count: 154, gradient: "from-pink-500 to-red-600" },
  { id: 5, name: "Finance", count: 132, gradient: "from-red-500 to-orange-600" },
  { id: 6, name: "Education", count: 118, gradient: "from-orange-500 to-yellow-600" }
];
const featuredMentors = [
  { id: 1, name: "Rajesh Kumar, IAS", designation: "Joint Secretary, Ministry of Finance", photo: "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20an%20Indian%20man%20in%20his%2040s%20with%20dignified%20expression%20wearing%20formal%20administrative%20service%20uniform%20high%20quality%20studio%20lighting%20professional%20headshot%20style%20clean%20neutral%20background%20government%20official&width=120&height=120&seq=65&orientation=squarish", expertise: ["UPSC Preparation", "Public Administration", "Economic Policy"], rating: 4.9, reviews: 156, experience: 15, price: "₹2,500", availability: "Available this week" },
  { id: 2, name: "Michael Rodriguez", designation: "Marketing Director at Netflix", photo: "https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520a%2520Latino%2520man%2520in%2520his%252040s%2520with%2520friendly%2520expression%252C%2520wearing%2520business%2520casual%2520attire%252C%2520high%2520quality%2520studio%2520lighting%252C%2520professional%2520headshot%2520style%252C%2520clean%2520neutral%2520background%252C%2520marketing%2520executive&width=120&height=120&seq=66&orientation=squarish", expertise: ["Digital Marketing", "Brand Strategy", "Content Creation"], rating: 4.8, reviews: 96, experience: 12, price: "$90", availability: "Limited availability" },
  { id: 3, name: "Amit Verma, IPS", designation: "DIG, Central Bureau of Investigation", photo: "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20an%20Indian%20man%20in%20his%2040s%20with%20authoritative%20expression%20wearing%20police%20uniform%20high%20quality%20studio%20lighting%20professional%20headshot%20style%20clean%20neutral%20background%20law%20enforcement&width=120&height=120&seq=67&orientation=squarish", expertise: ["Civil Services", "Law Enforcement", "Criminal Justice"], rating: 4.9, reviews: 128, experience: 18, price: "₹2,800", availability: "Available today" },
  { id: 4, name: "Dr. Meera Reddy", designation: "Principal Scientific Officer, DRDO", photo: "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20an%20Indian%20woman%20in%20her%2040s%20with%20intellectual%20expression%20wearing%20formal%20research%20attire%20high%20quality%20studio%20lighting%20professional%20headshot%20style%20clean%20neutral%20background%20defense%20scientist&width=120&height=120&seq=68&orientation=squarish", expertise: ["Defense Technology", "Research & Development", "NET/JRF Preparation"], rating: 4.7, reviews: 134, experience: 14, price: "₹2,200", availability: "Available next week" }
];
const benefits = [
  { id: 1, title: "Personalized Guidance", description: "Get tailored advice specific to your career goals and challenges from industry experts." },
  { id: 2, title: "Skill Enhancement", description: "Develop critical skills and competencies through structured learning paths and feedback." },
  { id: 3, title: "Network Expansion", description: "Connect with industry leaders and expand your professional network for future opportunities." }
];
const bookingSteps = [
  { id: 1, title: "Find Your Mentor", description: "Browse profiles and find the perfect mentor for your goals." },
  { id: 2, title: "Book a Session", description: "Schedule a convenient time slot for your mentorship session." },
  { id: 3, title: "Grow Together", description: "Engage in meaningful discussions and implement valuable advice." }
];
const testimonials = [
  { id: 1, name: "Alex Thompson", background: "Marketing Specialist", photo: "https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520a%2520young%2520person%2520with%2520friendly%2520expression%252C%2520casual%2520attire%252C%2520high%2520quality%2520studio%2520lighting%252C%2520professional%2520headshot%2520style%252C%2520clean%2520neutral%2520background%252C%2520marketing%2520professional&width=80&height=80&seq=69&orientation=squarish", rating: 5, text: "Working with Dr. Chen completely transformed my approach to product management. Her insights helped me secure a promotion within just 3 months of our mentorship.", mentorName: "Dr. Emily Chen" },
  { id: 2, name: "Priya Sharma", background: "Software Developer", photo: "https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520a%2520South%2520Asian%2520woman%2520with%2520friendly%2520expression%252C%2520casual%2520tech%2520attire%252C%2520high%2520quality%2520studio%2520lighting%252C%2520professional%2520headshot%2520style%252C%2520clean%2520neutral%2520background%252C%2520software%2520developer&width=80&height=80&seq=70&orientation=squarish", rating: 5, text: "Sarah's technical expertise is incredible, but what sets her apart is her ability to explain complex concepts in simple terms. She helped me master cloud architecture in weeks!", mentorName: "Sarah Johnson" },
  { id: 3, name: "James Wilson", background: "MBA Student", photo: "https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520a%2520young%2520Black%2520man%2520with%2520friendly%2520expression%252C%2520business%2520casual%2520attire%252C%2520high%2520quality%2520studio%2520lighting%252C%2520professional%2520headshot%2520style%252C%2520clean%2520neutral%2520background%252C%2520MBA%2520student&width=80&height=80&seq=71&orientation=squarish", rating: 4, text: "David's financial mentorship gave me the confidence to pursue a career in investment banking. His practical advice and industry insights were invaluable.", mentorName: "David Patel" }
];

const MainContent = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200; // card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl mb-8">
        <div className="relative bg-gradient-to-r from-blue-50 to-transparent p-8 md:p-10">
          <div className="max-w-md relative z-20">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Mentor</h1>
            <p className="text-gray-600 mb-6">Connect with industry experts who can guide your career journey, help you develop new skills, and unlock your full potential.</p>
            <button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer">
              Find a Mentor
            </button>
          </div>
        </div>
        <img
          src="https://readdy.ai/api/search-image?query=modern%20minimalist%20workspace%20with%20floating%203D%20geometric%20shapes%20and%20glowing%20connection%20lines%2C%20professional%20mentorship%20symbolism%2C%20clean%20design%20with%20blue%20and%20white%20color%20scheme%2C%20soft%20gradient%20lighting%2C%20abstract%20professional%20environment&width=1200&height=400&seq=78&orientation=landscape"
          alt="Mentorship Concept"
          className="absolute top-0 right-0 h-full w-2/3 object-cover object-left"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-blue-50/95 to-transparent z-10"></div>
      </div>

      {/* Mentor Categories */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Explore Mentor Categories</h2>
          <button className="text-sm text-blue-600 hover:underline cursor-pointer">View All</button>
        </div>
        <div className="relative">
          {showLeftButton && (
            <button 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-50"
            >
              <ChevronLeft size={20} className="text-[#6B7280]" />
            </button>
          )}
          <div className="relative">
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {mentorCategories.map((category) => (
                <div
                  key={category.id}
                  className={`w-[180px] bg-gradient-to-br ${category.gradient} text-white rounded-xl p-4 cursor-pointer hover:shadow-md transition shrink-0`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-white">★</span>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                      {category.count} mentors
                    </span>
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-xs text-white/80 mt-1">Expert guidance</p>
                </div>
              ))}
            </div>
            <div className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none ${
              showLeftButton ? 'bg-gradient-to-r from-[#EEF0F4] to-transparent' : ''
            }`} />
            <div className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none ${
              showRightButton ? 'bg-gradient-to-l from-[#EEF0F4] to-transparent' : ''
            }`} />
          </div>
          {showRightButton && (
            <button 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-50"
            >
              <ChevronRight size={20} className="text-[#6B7280]" />
            </button>
          )}
        </div>
      </div>

      {/* Featured Mentors */}
      <div className="mb-10">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Featured Mentors</h2>
            <button className="text-sm text-blue-600 hover:underline cursor-pointer">View All</button>
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <button className={`bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer`}>All Mentors</button>
            <button className={`bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer`}>Top Rated</button>
            <button className={`bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer`}>Most Experienced</button>
            <button className={`bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer`}>Recently Added</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {featuredMentors.map((mentor) => (
            <div key={mentor.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-start space-x-4">
                <img src={mentor.photo} alt={mentor.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h3 className="font-semibold">{mentor.name}</h3>
                  <p className="text-sm text-gray-600">{mentor.designation}</p>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-xs ${i < Math.floor(mentor.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">
                      {mentor.rating} ({mentor.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {mentor.expertise.map((skill, index) => (
                    <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <span className="mr-1">💼</span>
                    {mentor.experience} years experience
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">💰</span>
                    {mentor.price}/session
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600">
                    <span className="mr-1">⏰</span>
                    {mentor.availability}
                  </span>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
                    Book Session
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mentorship Benefits */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-6">Why Choose Mentorship?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-blue-600 text-xl">★</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Process */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-6">How It Works</h2>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bookingSteps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-4 relative">
                  <span className="text-indigo-600 text-xl">★</span>
                  {index < bookingSteps.length - 1 && (
                    <div className="hidden md:block absolute left-full top-1/2 w-full h-0.5 bg-indigo-100 -translate-y-1/2">
                      <span className="text-indigo-300 absolute right-0 top-1/2 -translate-y-1/2">→</span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg cursor-pointer">
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-6">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-center space-x-3 mb-4">
                <img src={testimonial.photo} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h3 className="font-semibold text-sm">{testimonial.name}</h3>
                  <p className="text-xs text-gray-500">{testimonial.background}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-xs ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-3">"{testimonial.text}"</p>
              <p className="text-xs text-gray-500">Mentored by {testimonial.mentorName}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mb-10">
        <div className="relative rounded-xl p-8 text-center overflow-hidden">
          <div className="relative z-20">
            <h2 className="text-2xl font-bold text-white mb-3">Become a Mentor</h2>
            <p className="text-white/90 mb-6 max-w-md mx-auto">Share your expertise, build your professional brand, and make a difference in someone's career journey.</p>
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition shadow-lg hover:shadow-xl cursor-pointer">
              Apply as Mentor
            </button>
          </div>
          <img
            src="https://readdy.ai/api/search-image?query=modern%20abstract%203D%20networking%20concept%20with%20glowing%20connection%20lines%20and%20floating%20geometric%20shapes%2C%20professional%20dark%20blue%20gradient%20background%20with%20light%20effects%2C%20minimalist%20design%20style%20emphasizing%20mentorship%20and%20knowledge%20sharing&width=1200&height=300&seq=79&orientation=landscape"
            alt="Become a Mentor"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-900/95 z-10"></div>
        </div>
      </div>
    </div>
  );
};

export default MainContent; 