import { useBrand } from "@/App";
import { MapPin, Mail, Phone } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SEO from "@/components/SEO";

const About = () => {
  const { currentBrand } = useBrand();

  if (!currentBrand) return null;

  const faqs = [
    {
      question: "What time are your services?",
      answer: currentBrand.service_times || "Please check our Events page for service times."
    },
    {
      question: "Where are you located?",
      answer: currentBrand.location || "Rajendra Nagar opposite Icon Mall, Guntur"
    },
    {
      question: "What should I expect on my first visit?",
      answer: "We're excited to welcome you! Come as you are. Our services include worship, teaching, and fellowship. Feel free to arrive a few minutes early to get familiar with the space."
    },
    {
      question: "How can I get involved?",
      answer: "There are many ways to get involved! Check out our Ministries page to learn about our various teams, or visit the Contact page to reach out directly."
    },
    {
      question: "Do you have programs for children?",
      answer: "Yes! We have dedicated programs for children and youth. Please visit our Ministries page or contact us for more information."
    }
  ];

  return (
    <div>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="container text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="about-title">
            About {currentBrand.name}
          </h1>
          {currentBrand.tagline && (
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {currentBrand.tagline}
            </p>
          )}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section bg-white">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div data-testid="mission-section">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To be a community where people encounter God's love, grow in faith, and serve with purpose. 
                We're committed to creating an environment where everyone feels welcomed, valued, and empowered 
                to live out their God-given potential.
              </p>
            </div>
            <div data-testid="vision-section">
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                To see lives transformed by the power of God's word, building a thriving community that reflects 
                His love and compassion. We envision a church that impacts our local community and reaches beyond, 
                making disciples who make disciples.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section bg-gray-50">
        <div className="container max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center" data-testid="story-title">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4">
              {currentBrand.name} began with a simple vision: to create a place where people could experience 
              authentic community and encounter God in a meaningful way. What started as a small gathering has 
              grown into a vibrant community of believers committed to making a difference.
            </p>
            <p className="mb-4">
              Over the years, we've seen countless lives transformed through the power of God's love. From healing 
              and restoration to purpose and calling, our community has witnessed the faithfulness of God in every season.
            </p>
            <p>
              Today, we continue to be driven by the same passion that sparked our beginning: to love God, love people, 
              and serve our community with excellence and integrity.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-white">
        <div className="container max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center" data-testid="values-title">Our Values</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Love</h3>
              <p className="text-gray-600 text-sm">We believe love is the foundation of everything we do</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🙏</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Faith</h3>
              <p className="text-gray-600 text-sm">We trust in God's promises and His faithfulness</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600 text-sm">We're better together, supporting and encouraging one another</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Excellence</h3>
              <p className="text-gray-600 text-sm">We honor God by doing everything with excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-gray-50">
        <div className="container max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center" data-testid="faq-title">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg px-6" data-testid={`faq-item-${index}`}>
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Location Section */}
      <section className="section bg-white">
        <div className="container max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center" data-testid="location-title">Visit Us</h2>
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-start space-x-3 mb-4">
                  <MapPin className="flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold mb-1">Address</h3>
                    <p className="text-gray-600 text-sm">{currentBrand.location || "Rajendra Nagar opposite Icon Mall, Guntur"}</p>
                  </div>
                </div>
                {currentBrand.service_times && (
                  <div className="flex items-start space-x-3 mb-4">
                    <Mail className="flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold mb-1">Service Times</h3>
                      <p className="text-gray-600 text-sm">{currentBrand.service_times}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.8!2d80.4365!3d16.3067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDE4JzI0LjEiTiA4MMKwMjYnMTEuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Location Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
