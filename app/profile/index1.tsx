"use client";

import TopBar from '../../components/TopBar';
import React, { useState, useEffect } from 'react';

const ProfilePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      sender: 'Sarah Johnson',
      senderAvatar: 'https://readdy.ai/api/search-image?query=professional%2525252520portrait%2525252520photo%2525252520of%2525252520a%2525252520young%2525252520woman%2525252520with%2525252520neutral%2525252520expression%252525252C%2525252520high%2525252520quality%2525252520studio%2525252520lighting%252525252C%2525252520professional%2525252520headshot%2525252520style%252525252C%2525252520minimalist%2525252520background&width=80&height=80&seq=60&orientation=squarish',
      content: 'liked your recent post about UI design trends',
      timestamp: '2 minutes ago',
      unread: true
    },
    {
      id: 2,
      sender: 'Michael Thompson',
      senderAvatar: 'https://readdy.ai/api/search-image?query=professional%2525252520portrait%2525252520photo%2525252520of%2525252520a%2525252520young%2525252520man%2525252520with%2525252520neutral%2525252520expression%252525252C%2525252520high%2525252520quality%2525252520studio%2525252520lighting%252525252C%2525252520professional%2525252520headshot%2525252520style%252525252C%2525252520minimalist%2525252520background&width=80&height=80&seq=61&orientation=squarish',
      content: 'commented on your project showcase',
      timestamp: '15 minutes ago',
      unread: true
    },
    {
      id: 3,
      sender: 'Emily Davis',
      senderAvatar: 'https://readdy.ai/api/search-image?query=professional%2525252520portrait%2525252520photo%2525252520of%2525252520a%2525252520woman%2525252520with%2525252520neutral%2525252520expression%252525252C%2525252520high%2525252520quality%2525252520studio%2525252520lighting%252525252C%2525252520professional%2525252520headshot%2525252520style%252525252C%2525252520minimalist%2525252520background&width=80&height=80&seq=62&orientation=squarish',
      content: 'shared your article about remote work',
      timestamp: '1 hour ago',
      unread: true
    },
    {
      id: 4,
      sender: 'David Wilson',
      senderAvatar: 'https://readdy.ai/api/search-image?query=professional%2525252520portrait%2525252520photo%2525252520of%2525252520a%2525252520man%2525252520with%2525252520neutral%2525252520expression%252525252C%2525252520high%2525252520quality%2525252520studio%2525252520lighting%252525252C%2525252520professional%2525252520headshot%2525252520style%252525252C%2525252520minimalist%2525252520background&width=80&height=80&seq=63&orientation=squarish',
      content: 'mentioned you in a comment',
      timestamp: '2 hours ago',
      unread: true
    },
    {
      id: 5,
      sender: 'Jessica Brown',
      senderAvatar: 'https://readdy.ai/api/search-image?query=professional%2525252520portrait%2525252520photo%2525252520of%2525252520a%2525252520young%2525252520woman%2525252520with%2525252520neutral%2525252520expression%252525252C%2525252520high%2525252520quality%2525252520studio%2525252520lighting%252525252C%2525252520professional%2525252520headshot%2525252520style%252525252C%2525252520minimalist%2525252520background&width=80&height=80&seq=64&orientation=squarish',
      content: 'sent you a connection request',
      timestamp: '3 hours ago',
      unread: true
    }
  ]);

  // Profile data
  const profileData = {
    name: "Rahul Sharma",
    photo: "https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520a%2520young%2520Indian%2520man%2520with%2520confident%2520expression%2520wearing%2520formal%2520attire%2520high%2520quality%2520studio%2520lighting%2520professional%2520headshot%2520style%2520clean%2520neutral%2520background%2520aspiring%2520government%2520official&width=300&height=300&seq=101&orientation=squarish",
    currentOrg: "Delhi University",
    designation: "UPSC Aspirant",
    about: "Dedicated UPSC aspirant with a strong foundation in Political Science and Public Administration. Passionate about serving the nation through civil services with a focus on administrative reforms and public policy implementation.",
    basicInfo: {
      age: "27 years",
      location: "New Delhi, India",
      languages: "English, Hindi, Tamil"
    },
    contact: {
      email: "rahul.sharma@example.com",
      phone: "+91 9876543210",
      linkedin: "linkedin.com/in/rahulsharma",
      twitter: "twitter.com/rahulsharma"
    }
  };

  // Target exams data
  const targetExams = [
    {
      name: "UPSC Civil Services Examination",
      status: "Primary Target",
      nextDate: "May 28, 2026",
      attemptNumber: "2nd Attempt",
      preparationStatus: "Mains Preparation"
    },
    {
      name: "Indian Forest Service (IFoS)",
      status: "Secondary Target",
      nextDate: "June 15, 2026",
      attemptNumber: "1st Attempt",
      preparationStatus: "Prelims Preparation"
    },
    {
      name: "State Public Service Commission",
      status: "Backup Option",
      nextDate: "August 10, 2026",
      attemptNumber: "1st Attempt",
      preparationStatus: "Initial Preparation"
    }
  ];

  // Skills data
  const skills = [
    { name: "Public Administration", level: "Advanced" },
    { name: "Political Science", level: "Advanced" },
    { name: "Indian Economy", level: "Intermediate" },
    { name: "International Relations", level: "Intermediate" },
    { name: "Indian History", level: "Advanced" },
    { name: "Geography", level: "Intermediate" },
    { name: "Current Affairs", level: "Advanced" },
    { name: "Essay Writing", level: "Advanced" },
    { name: "Case Study Analysis", level: "Intermediate" },
    { name: "Data Interpretation", level: "Intermediate" }
  ];

  // Education data
  const education = [
    {
      degree: "Master of Arts in Political Science",
      institution: "Delhi University",
      year: "2022-2024",
      score: "8.7 CGPA"
    },
    {
      degree: "Bachelor of Arts in History",
      institution: "St. Stephen's College, Delhi University",
      year: "2019-2022",
      score: "9.2 CGPA"
    },
    {
      degree: "Higher Secondary Education",
      institution: "Delhi Public School, R.K. Puram",
      year: "2018-2019",
      score: "94.5%"
    }
  ];

  // Exam attempts data
  const examAttempts = [
    {
      exam: "UPSC CSE 2024",
      prelims: "Cleared (Rank: 342/12,000)",
      mains: "Cleared (Score: 789/1750)",
      interview: "Appeared (Score: 172/275)",
      finalRank: "Rank: 256",
      date: "May 2024 - March 2025"
    },
    {
      exam: "State PSC 2023",
      prelims: "Cleared (Rank: 156/8,000)",
      mains: "Cleared (Score: 680/1500)",
      interview: "Appeared (Score: 155/250)",
      finalRank: "Rank: 89",
      date: "August 2023 - February 2024"
    }
  ];

  // Coaching data
  const coaching = [
    {
      name: "Vision IAS",
      course: "Comprehensive UPSC CSE Program",
      duration: "June 2023 - Present",
      focus: "GS Papers, Essay, Optional Subject"
    },
    {
      name: "Vajiram & Ravi",
      course: "Test Series Program",
      duration: "August 2023 - Present",
      focus: "Prelims & Mains Test Series"
    },
    {
      name: "Unacademy",
      course: "Online Courses",
      duration: "January 2023 - Present",
      focus: "Current Affairs, Ethics, Public Administration"
    }
  ];

  // Projects data
  const projects = [
    {
      title: "Policy Analysis: Water Conservation in Urban India",
      description: "Conducted research on water conservation policies in major Indian cities and proposed sustainable solutions.",
      duration: "3 months",
      outcome: "Published in university journal"
    },
    {
      title: "Case Study: Administrative Reforms in Rural Development",
      description: "Analyzed the implementation of administrative reforms in rural development programs across three states.",
      duration: "4 months",
      outcome: "Presented at national seminar"
    }
  ];

  // Community groups data
  const communityGroups = [
    {
      name: "UPSC Aspirants Forum",
      role: "Active Member",
      activities: "Weekly discussions, Mock interviews, Resource sharing"
    },
    {
      name: "Civil Services Study Circle",
      role: "Group Coordinator",
      activities: "Monthly seminars, Current affairs analysis, Peer mentoring"
    },
    {
      name: "Insights IAS Discussion Forum",
      role: "Contributor",
      activities: "Answer writing practice, Daily news analysis, Group studies"
    }
  ];

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      unread: false
    })));
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, unread: false } : notification
    ));
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  // Close notifications panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const panel = document.getElementById('notification-panel');
      const bell = document.getElementById('notification-bell');
      if (panel && bell && !panel.contains(event.target as Node) && !bell.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#EEF0F4]">
      <TopBar />
      <div className="pt-[61px]">
        {/* Profile Page Content */}
        <div className="min-h-[calc(100vh-72px)] bg-[#EEF0F4] py-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Profile Card */}
              <div className="lg:w-1/3">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                  <div className="flex flex-col items-center">
                    <img
                      src={profileData.photo}
                      alt={profileData.name}
                      className="w-28 h-28 rounded-full object-cover object-top mb-4"
                    />
                    <h1 className="text-2xl font-bold text-center">{profileData.name}</h1>
                    <p className="text-gray-600 text-sm text-center mb-4">{profileData.designation}</p>
                    <div className="w-full mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Current Organization</h3>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3.5 rounded-lg">{profileData.currentOrg}</p>
                    </div>
                    <div className="w-full mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">About Me</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{profileData.about}</p>
                    </div>
                    <div className="w-full mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Basic Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="w-8 text-gray-400">
                            <i className="fas fa-user-clock"></i>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{profileData.basicInfo.age}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 text-gray-400">
                            <i className="fas fa-map-marker-alt"></i>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{profileData.basicInfo.location}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 text-gray-400">
                            <i className="fas fa-language"></i>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{profileData.basicInfo.languages}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full mb-7">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="w-8 text-gray-400">
                            <i className="fas fa-envelope"></i>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{profileData.contact.email}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 text-gray-400">
                            <i className="fas fa-phone-alt"></i>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{profileData.contact.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 text-gray-400">
                            <i className="fab fa-linkedin"></i>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{profileData.contact.linkedin}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 text-gray-400">
                            <i className="fab fa-twitter"></i>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{profileData.contact.twitter}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full space-x-3">
                      <button className="flex-1 bg-[#0096c7] hover:bg-cyan-700 text-white py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg">
                        <i className="fas fa-edit mr-2"></i> Edit Profile
                      </button>
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition">
                        <i className="fas fa-share-alt mr-2"></i> Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Information Cards */}
              <div className="lg:w-[60%]">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                  <p className="text-gray-600 mt-1">Manage your profile information and track your progress</p>
                </div>

                {/* Target Exams Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Target Exams</h3>
                    <button className="text-[#0096c7] hover:text-cyan-700 text-sm font-medium">
                      <i className="fas fa-plus mr-1"></i> Add Exam
                    </button>
                  </div>
                  <div className="space-y-4">
                    {targetExams.map((exam, index) => (
                      <div key={index} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{exam.name}</h4>
                          <span className="text-sm px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700">
                            {exam.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Next Date</p>
                            <p className="text-gray-900">{exam.nextDate}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Attempt</p>
                            <p className="text-gray-900">{exam.attemptNumber}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-500">Preparation Status</p>
                            <p className="text-gray-900">{exam.preparationStatus}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                    <button className="text-[#0096c7] hover:text-cyan-700 text-sm font-medium">
                      <i className="fas fa-plus mr-1"></i> Add Skill
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <div key={index} className="bg-gray-50 px-3 py-1.5 rounded-full text-sm">
                        <span className="text-gray-900">{skill.name}</span>
                        <span className="text-gray-500 ml-1">• {skill.level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                    <button className="text-[#0096c7] hover:text-cyan-700 text-sm font-medium">
                      <i className="fas fa-plus mr-1"></i> Add Education
                    </button>
                  </div>
                  <div className="space-y-4">
                    {education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-cyan-500 pl-4">
                        <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                        <p className="text-gray-600 text-sm">{edu.institution}</p>
                        <div className="flex gap-4 mt-1 text-sm">
                          <span className="text-gray-500">{edu.year}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-900">{edu.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exam Attempts Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Exam Attempts</h3>
                    <button className="text-[#0096c7] hover:text-cyan-700 text-sm font-medium">
                      <i className="fas fa-plus mr-1"></i> Add Attempt
                    </button>
                  </div>
                  <div className="space-y-4">
                    {examAttempts.map((attempt, index) => (
                      <div key={index} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">{attempt.exam}</h4>
                          <span className="text-sm text-gray-500">{attempt.date}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Prelims</p>
                            <p className="text-gray-900">{attempt.prelims}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Mains</p>
                            <p className="text-gray-900">{attempt.mains}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Interview</p>
                            <p className="text-gray-900">{attempt.interview}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Final Rank</p>
                            <p className="text-gray-900">{attempt.finalRank}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coaching Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Coaching</h3>
                    <button className="text-[#0096c7] hover:text-cyan-700 text-sm font-medium">
                      <i className="fas fa-plus mr-1"></i> Add Coaching
                    </button>
                  </div>
                  <div className="space-y-4">
                    {coaching.map((coach, index) => (
                      <div key={index} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{coach.name}</h4>
                          <span className="text-sm text-gray-500">{coach.duration}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{coach.course}</p>
                        <p className="text-gray-500 text-sm">Focus: {coach.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                    <button className="text-[#0096c7] hover:text-cyan-700 text-sm font-medium">
                      <i className="fas fa-plus mr-1"></i> Add Project
                    </button>
                  </div>
                  <div className="space-y-4">
                    {projects.map((project, index) => (
                      <div key={index} className="border border-gray-100 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{project.title}</h4>
                        <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-gray-500">Duration: {project.duration}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-900">{project.outcome}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Community Groups Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Community Groups</h3>
                    <button className="text-[#0096c7] hover:text-cyan-700 text-sm font-medium">
                      <i className="fas fa-plus mr-1"></i> Join Group
                    </button>
                  </div>
                  <div className="space-y-4">
                    {communityGroups.map((group, index) => (
                      <div key={index} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{group.name}</h4>
                          <span className="text-sm px-2.5 py-0.5 rounded-full bg-green-50 text-green-700">
                            {group.role}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">Activities: {group.activities}</p>
                      </div>
                    ))}
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

export default ProfilePage; 