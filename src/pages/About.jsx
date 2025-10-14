const About = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      title: "Real-time Predictions",
      description:
        "Get accurate wait time predictions powered by advanced algorithms and live hospital data.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      title: "Smart Scheduling",
      description:
        "Optimize your hospital visits with intelligent scheduling based on historical data and current trends.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L9 9l-8 3 8 3 3 8 3-8 8-3-8-3-3-8z" />
        </svg>
      ),
      title: "Multi-Hospital Network",
      description:
        "Access wait times and book appointments across multiple hospitals in your area.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 6L9 17l-5-5 1.4-1.4L9 14.2l9.6-9.6z" />
        </svg>
      ),
      title: "Digital Tickets",
      description:
        "Manage all your hospital appointments digitally with real-time status updates.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
        </svg>
      ),
      title: "24/7 Support",
      description:
        "Get help whenever you need it with our round-the-clock customer support team.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      title: "Analytics Dashboard",
      description:
        "Track your healthcare patterns and optimize your visit timing with detailed analytics.",
    },
  ];

  const stats = [
    { number: "50,000+", label: "Active Users" },
    { number: "150+", label: "Partner Hospitals" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "30min", label: "Average Time Saved" },
  ];

  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "Chief Medical Officer",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
      description: "15+ years experience in healthcare technology",
    },
    {
      name: "Alex Rodriguez",
      role: "Head of Engineering",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      description:
        "Former Google engineer specializing in predictive algorithms",
    },
    {
      name: "Emily Johnson",
      role: "UX Design Lead",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b332c5d2?w=300&h=300&fit=crop&crop=face",
      description: "Award-winning designer focused on healthcare accessibility",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Revolutionizing
              <span className="text-primary"> Healthcare </span>
              Access
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              QueueWise transforms how patients interact with healthcare
              facilities through intelligent queue prediction, smart scheduling,
              and real-time updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/30">
                Get Started Today
              </button>
              <button className="border border-primary text-primary hover:bg-primary/10 font-semibold py-4 px-8 rounded-lg transition-all duration-300">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Our Mission
              </h2>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                We believe that healthcare should be accessible, efficient, and
                stress-free for everyone. QueueWise leverages cutting-edge
                technology to eliminate uncertainty from hospital visits, giving
                patients the power to plan their healthcare journey with
                confidence.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                By providing real-time insights and intelligent predictions,
                we&apos;re building a future where waiting in long hospital
                queues becomes a thing of the past.
              </p>
              <div className="mt-8">
                <button className="text-primary font-semibold hover:text-primary/80 transition-colors">
                  Learn more about our technology →
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-transparent p-8">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=600&fit=crop"
                  alt="Healthcare technology"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-primary/20 backdrop-blur-sm rounded-xl p-4 border border-primary/30">
                <div className="text-primary font-bold text-2xl">99.5%</div>
                <div className="text-sm text-gray-300">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose QueueWise?
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Discover the features that make us the leading platform for
              hospital queue management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-primary/30 transition-all duration-300 group backdrop-blur-sm"
              >
                <div className="bg-primary/10 rounded-lg p-3 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <div className="text-primary">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              The passionate experts behind QueueWise&apos;s innovative
              healthcare solutions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary/40 transition-colors">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                  {member.name}
                </h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-gray-300 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of patients who have already discovered the
            convenience of smart queue management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/30">
              Book Your First Appointment
            </button>
            <button className="border border-gray-600 text-gray-300 hover:border-primary hover:text-primary font-semibold py-4 px-8 rounded-lg transition-all duration-300">
              Contact Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
