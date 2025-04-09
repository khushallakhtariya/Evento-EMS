import React, { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "../ThemeContext";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
  const { darkMode } = useContext(ThemeContext);
  const [activeSection, setActiveSection] = useState(null);
  const sectionRefs = useRef({});

  const sections = [
    { id: "introduction", title: "1. Introduction" },
    { id: "information-collection", title: "2. Information We Collect" },
    { id: "information-use", title: "3. How We Use Your Information" },
    { id: "data-security", title: "4. Data Security" },
    { id: "rights-choices", title: "5. Your Rights and Choices" },
    { id: "cookies", title: "6. Cookies and Tracking Technologies" },
    { id: "third-party", title: "7. Third-Party Services" },
    { id: "children-privacy", title: "8. Children's Privacy" },
    { id: "policy-changes", title: "9. Changes to This Policy" },
    { id: "contact", title: "10. Contact Us" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for header
      let currentSection = null;

      sections.forEach((section) => {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            currentSection = section.id;
          }
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const headerOffset = 80; // Adjust this value based on your header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1
            className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
          >
            Privacy Policy
          </h1>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          {/* <div className="w-full md:w-64 flex-shrink-0">
            <div
              className={`sticky top-8 p-4 rounded-xl shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4">Quick Navigation</h3>
              <div className="relative">
                <div
                  className="absolute left-0 top-0 h-full w-1 bg-blue-500"
                  style={{
                    transform: `translateY(${
                      sections.findIndex((s) => s.id === activeSection) * 100
                    }%)`,
                    height: `${100 / sections.length}%`,
                  }}
                />
                <ul className="space-y-2 relative">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg ${
                          activeSection === section.id
                            ? darkMode
                              ? "bg-blue-600 text-white"
                              : "bg-blue-100 text-blue-600"
                            : ""
                        }`}
                      >
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div> */}

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <motion.section
              ref={(el) => (sectionRefs.current["introduction"] = el)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">
                1. Introduction
              </h2>
              <p className="leading-relaxed">
                At EventoEMS, we take your privacy seriously. This Privacy
                Policy describes how we collect, use, process, and disclose your
                information, including personal information, in conjunction with
                your access to and use of our Event Management System.
              </p>
            </motion.section>

            <motion.section
              ref={(el) => (sectionRefs.current["information-collection"] = el)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">
                2. Information We Collect
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium mb-3">
                    2.1 Information You Provide to Us
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li className="flex items-start group">
                      <span className="mr-2 group-hover:text-blue-500 transition-colors">
                        •
                      </span>
                      Account information (name, email, password, phone number)
                    </li>
                    <li className="flex items-start group">
                      <span className="mr-2 group-hover:text-blue-500 transition-colors">
                        •
                      </span>
                      Profile information (profile picture, company details)
                    </li>
                    <li className="flex items-start group">
                      <span className="mr-2 group-hover:text-blue-500 transition-colors">
                        •
                      </span>
                      Event information (event details, preferences, attendee
                      lists)
                    </li>
                    <li className="flex items-start group">
                      <span className="mr-2 group-hover:text-blue-500 transition-colors">
                        •
                      </span>
                      Payment information (credit card details, billing address)
                    </li>
                    <li className="flex items-start group">
                      <span className="mr-2 group-hover:text-blue-500 transition-colors">
                        •
                      </span>
                      Communications with us (customer support, feedback)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-3">
                    2.2 Information We Automatically Collect
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li className="flex items-start group">
                      <span className="mr-2 group-hover:text-blue-500 transition-colors">
                        •
                      </span>
                      Usage data (pages visited, features used, time spent)
                    </li>
                    <li className="flex items-start group">
                      <span className="mr-2 group-hover:text-blue-500 transition-colors">
                        •
                      </span>
                      Device information (IP address, browser type, operating
                      system)
                    </li>
                    <li className="flex items-start group">
                      <span className="mr-2 group-hover:text-blue-500 transition-colors">
                        •
                      </span>
                      Location information (if permitted by your device
                      settings)
                    </li>
                    <li className="flex items-start group">
                      <span className="mr-2 group-hover:text-blue-500 transition-colors">
                        •
                      </span>
                      Cookies and similar tracking technologies
                    </li>
                  </ul>
                </div>
              </div>
            </motion.section>

            <motion.section
              ref={(el) => (sectionRefs.current["information-use"] = el)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  To provide, maintain, and improve our services
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  To process your transactions and send related information
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  To send administrative messages and updates
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  To personalize your experience and deliver relevant content
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  To monitor and analyze trends and usage
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  To detect, prevent, and address technical issues
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  To comply with legal obligations
                </li>
              </ul>
            </motion.section>

            <motion.section
              ref={(el) => (sectionRefs.current["data-security"] = el)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">
                4. Data Security
              </h2>
              <div className="space-y-4">
                <p className="leading-relaxed">
                  We implement appropriate technical and organizational measures
                  to protect your personal information against unauthorized or
                  unlawful processing, accidental loss, destruction, or damage.
                  These measures include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Encryption of data in transit and at rest
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Regular security assessments and updates
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Access controls and authentication mechanisms
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Secure data centers and cloud infrastructure
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Employee training on data protection
                  </li>
                </ul>
              </div>
            </motion.section>

            <motion.section
              ref={(el) => (sectionRefs.current["rights-choices"] = el)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">
                5. Your Rights and Choices
              </h2>
              <div className="space-y-4">
                <p className="leading-relaxed">
                  You have certain rights regarding your personal information,
                  including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Access your personal data
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Correct inaccurate or incomplete data
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Request deletion of your data
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Object to processing of your data
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Request restriction of processing
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Data portability
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Withdraw consent
                  </li>
                </ul>
                <p className="leading-relaxed">
                  To exercise these rights, please contact us using the
                  information provided in the "Contact Us" section.
                </p>
              </div>
            </motion.section>

            <motion.section
              ref={(el) => (sectionRefs.current["cookies"] = el)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">
                6. Cookies and Tracking Technologies
              </h2>
              <div className="space-y-4">
                <p className="leading-relaxed">
                  We use cookies and similar tracking technologies to track
                  activity on our service and hold certain information. Cookies
                  are files with a small amount of data which may include an
                  anonymous unique identifier.
                </p>
                <p className="leading-relaxed">
                  You can instruct your browser to refuse all cookies or to
                  indicate when a cookie is being sent. However, if you do not
                  accept cookies, you may not be able to use some portions of
                  our service.
                </p>
              </div>
            </motion.section>

            <motion.section
              ref={(el) => (sectionRefs.current["third-party"] = el)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">
                7. Third-Party Services
              </h2>
              <div className="space-y-4">
                <p className="leading-relaxed">
                  We may employ third-party companies and individuals to
                  facilitate our service, provide the service on our behalf,
                  perform service-related services, or assist us in analyzing
                  how our service is used.
                </p>
                <p className="leading-relaxed">
                  These third parties have access to your personal information
                  only to perform these tasks on our behalf and are obligated
                  not to disclose or use it for any other purpose.
                </p>
              </div>
            </motion.section>

            <motion.section
              ref={(el) => (sectionRefs.current["children-privacy"] = el)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">
                8. Children's Privacy
              </h2>
              <p className="leading-relaxed">
                Our service does not address anyone under the age of 13. We do
                not knowingly collect personally identifiable information from
                children under 13. If you are a parent or guardian and you are
                aware that your child has provided us with personal information,
                please contact us.
              </p>
            </motion.section>

            <motion.section
              ref={(el) => (sectionRefs.current["policy-changes"] = el)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">
                9. Changes to This Policy
              </h2>
              <p className="leading-relaxed">
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date. You are advised
                to review this Privacy Policy periodically for any changes.
              </p>
            </motion.section>

            <motion.section
              ref={(el) => (sectionRefs.current["contact"] = el)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">
                10. Contact Us
              </h2>
              <div className="space-y-4">
                <p className="leading-relaxed">
                  If you have any questions about this Privacy Policy, please
                  contact us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`p-4 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <p className="flex items-center">
                      <span className="mr-2 text-blue-500">📧</span>
                      Email: privacy@eventoems.com
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <p className="flex items-center">
                      <span className="mr-2 text-blue-500">📞</span>
                      Phone: +1 (555) 123-4567
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <p className="flex items-center">
                      <span className="mr-2 text-blue-500">📍</span>
                      Address: 123 Event Management Street, Suite 100, New York,
                      NY 10001
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
