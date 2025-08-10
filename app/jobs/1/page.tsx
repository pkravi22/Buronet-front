"use client";

import TopBar from '../../../components/TopBar';
import { CalendarDays, Building2, Clock, BadgeIndianRupee, Edit, Download, UserCheck, ListChecks, FileText, LucideLink, Globe, HelpCircle, BookOpen, FileArchive } from 'lucide-react';

const JobDetailsPage = () => {
  return (
    <div className="min-h-screen bg-[#EEF0F4] font-sans text-gray-800">
      <TopBar />
      <div className="flex flex-col mt-8">
        <div className="min-h-[calc(100vh-72px)] bg-[#EEF0F4] py-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Exam Overview */}
              <div className="lg:w-1/3">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                  <div className="flex flex-col">
                    <div className="w-full flex justify-center mb-6">
                      <img
                        src="https://readdy.ai/api/search-image?query=official%20government%20logo%20of%20Union%20Public%20Service%20Commission%20of%20India%20with%20emblem%20and%20blue%20and%20gold%20colors%20professional%20clean%20design%20on%20white%20background&width=120&height=120&seq=201&orientation=squarish"
                        alt="UPSC Logo"
                        className="h-24 w-24 object-contain"
                      />
                    </div>
                    <div className="w-full mb-4">
                      <h1 className="text-2xl font-bold text-gray-900 text-center">UPSC Civil Services Examination 2025</h1>
                      <p className="text-gray-600 mt-2 text-center">Combined examination for IAS, IPS, IFS and other Central Services</p>
                    </div>
                    <div className="w-full mb-6">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-8 text-gray-400 flex items-center justify-center">
                            <CalendarDays size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">Post Date</p>
                            <p className="text-sm text-gray-600">14 May 2025</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 text-gray-400 flex items-center justify-center">
                            <Building2 size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">Conducted By</p>
                            <p className="text-sm text-gray-600">Union Public Service Commission</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 text-gray-400 flex items-center justify-center">
                            <Clock size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">Important Dates</p>
                            <p className="text-sm text-gray-600">Last date to apply: 4 June 2025</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 text-gray-400 flex items-center justify-center">
                            <BadgeIndianRupee size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">Application Fees</p>
                            <p className="text-sm text-gray-600">General: ₹100 | SC/ST/PwD/Women: Exempted</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full flex-col space-y-3">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer flex items-center justify-center gap-2">
                        <Edit size={18} /> Apply Now
                      </button>
                      <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2">
                        <Download size={18} /> Download Notification
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Column - Detailed Information Cards */}
              <div className="lg:w-[60%] mt-6 lg:mt-[24px]">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Exam Details</h2>
                  <p className="text-gray-600 mt-1">Comprehensive information about UPSC Civil Services Examination 2025</p>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  {/* Age Limit Card */}
                  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                    <div className="flex items-center mb-5">
                      <h3 className="font-semibold text-lg text-gray-900 flex items-center">
                        <UserCheck size={20} className="text-blue-600 mr-2" /> Age Limit
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Minimum Age</p>
                            <p className="text-gray-800 font-medium">21 years</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Maximum Age</p>
                            <p className="text-gray-800 font-medium">32 years</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Age Relaxation</p>
                        <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1 marker:text-gray-400">
                          <li className="pl-1">SC/ST: 5 years</li>
                          <li className="pl-1">OBC: 3 years</li>
                          <li className="pl-1">PwD: 10 years</li>
                          <li className="pl-1">Ex-Servicemen: As per rules</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Age Calculation Date</p>
                        <p className="text-gray-800">1st August 2025</p>
                      </div>
                    </div>
                  </div>
                  {/* Eligibility Criteria Card */}
                  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                    <div className="flex items-center mb-5">
                      <h3 className="font-semibold text-lg text-gray-900 flex items-center">
                        <UserCheck size={20} className="text-blue-600 mr-2" /> Eligibility Criteria
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Educational Qualification</p>
                        <p className="text-gray-800">Graduate degree from any recognized university</p>
                        <p className="text-sm text-gray-600 mt-2">Candidates appearing in final year exams can also apply (must obtain degree by specified date)</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Nationality Requirements</p>
                        <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1 marker:text-gray-400">
                          <li className="pl-1">Citizen of India, or</li>
                          <li className="pl-1">Subject of Nepal, or</li>
                          <li className="pl-1">Subject of Bhutan, or</li>
                          <li className="pl-1">Tibetan refugee who came to India before January 1, 1962, or</li>
                          <li className="pl-1">Person of Indian origin who migrated from specific countries with the intention of permanently settling in India</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Physical Requirements</p>
                        <p className="text-gray-800">As per medical standards specified for each service</p>
                        <p className="text-sm text-gray-600 mt-2">Candidates must be physically and mentally fit according to the standards prescribed</p>
                      </div>
                    </div>
                  </div>
                  {/* Exam Information Card */}
                  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                    <div className="flex items-center mb-5">
                      <h3 className="font-semibold text-lg text-gray-900 flex items-center">
                        <ListChecks size={20} className="text-blue-600 mr-2" /> Exam Information
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Exam Pattern</p>
                        <div className="space-y-3 mt-2">
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <p className="font-medium text-gray-800">Stage 1: Preliminary Examination</p>
                            <p className="text-sm text-gray-600 mt-1">Two papers (General Studies and CSAT) - Objective type</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <p className="font-medium text-gray-800">Stage 2: Main Examination</p>
                            <p className="text-sm text-gray-600 mt-1">Nine papers including Essay, GS Papers, and Optional Subject - Written</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <p className="font-medium text-gray-800">Stage 3: Personality Test</p>
                            <p className="text-sm text-gray-600 mt-1">Interview to assess candidate&apos;s suitability for a career in public service</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Selection Process</p>
                        <p className="text-gray-700 text-sm">Candidates are selected based on their combined performance in all three stages. Final merit list is prepared based on total marks in Main Examination and Personality Test.</p>
                      </div>
                    </div>
                  </div>
                  {/* How to Apply Card */}
                  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                    <div className="flex items-center mb-5">
                      <h3 className="font-semibold text-lg text-gray-900 flex items-center">
                        <FileText size={20} className="text-blue-600 mr-2" /> How to Apply
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Application Process</p>
                        <ol className="text-sm text-gray-700 list-decimal pl-5 space-y-2 mt-2">
                          <li>Visit the official UPSC website (www.upsc.gov.in)</li>
                          <li>Click on &quot;Online Application for Various Examinations&quot;</li>
                          <li>Register by providing basic details and valid email/mobile</li>
                          <li>Login using registration ID and password</li>
                          <li>Fill the application form with personal, educational, and other details</li>
                          <li>Upload scanned documents as per specifications</li>
                          <li>Pay application fee online</li>
                          <li>Submit the application and take printout for future reference</li>
                        </ol>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Document Requirements</p>
                        <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1 mt-2 marker:text-gray-400">
                          <li className="pl-1">Scanned photograph (3.5cm × 4.5cm, 20-300KB)</li>
                          <li className="pl-1">Scanned signature (1cm × 3.5cm, 10-150KB)</li>
                          <li className="pl-1">Identity proof (Aadhaar/PAN/Passport/Voter ID)</li>
                          <li className="pl-1">Category certificate (if applicable)</li>
                          <li className="pl-1">Disability certificate (if applicable)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Important Instructions</p>
                        <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1 mt-2 marker:text-gray-400">
                          <li className="pl-1">Ensure all details are correctly filled before submission</li>
                          <li className="pl-1">Application cannot be withdrawn once submitted</li>
                          <li className="pl-1">Keep application printout and payment receipt safely</li>
                          <li className="pl-1">Check email/SMS regularly for updates</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  {/* Important Links Card */}
                  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                    <div className="flex items-center mb-5">
                      <h3 className="font-semibold text-lg text-gray-900 flex items-center">
                        <LucideLink size={20} className="text-blue-600 mr-2" /> Important Links
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <a href="#" className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition cursor-pointer">
                        <div className="flex items-center">
                          <FileArchive size={18} className="text-red-500 mr-3" />
                          <span className="text-gray-800">Official Notification PDF</span>
                        </div>
                        <LucideLink size={16} className="text-gray-400" />
                      </a>
                      <a href="#" className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition cursor-pointer">
                        <div className="flex items-center">
                          <Globe size={18} className="text-blue-500 mr-3" />
                          <span className="text-gray-800">UPSC Online Application Portal</span>
                        </div>
                        <LucideLink size={16} className="text-gray-400" />
                      </a>
                      <a href="#" className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition cursor-pointer">
                        <div className="flex items-center">
                          <HelpCircle size={18} className="text-green-500 mr-3" />
                          <span className="text-gray-800">Frequently Asked Questions</span>
                        </div>
                        <LucideLink size={16} className="text-gray-400" />
                      </a>
                      <a href="#" className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition cursor-pointer">
                        <div className="flex items-center">
                          <BookOpen size={18} className="text-purple-500 mr-3" />
                          <span className="text-gray-800">Detailed Syllabus</span>
                        </div>
                        <LucideLink size={16} className="text-gray-400" />
                      </a>
                      <a href="#" className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition cursor-pointer">
                        <div className="flex items-center">
                          <FileText size={18} className="text-orange-500 mr-3" />
                          <span className="text-gray-800">Previous Year Question Papers</span>
                        </div>
                        <LucideLink size={16} className="text-gray-400" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage; 