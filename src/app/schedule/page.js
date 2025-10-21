'use client';

import Navbar from '../components/Navbar';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, Clock, Calendar, MessageCircle, Video, TrendingUp, ChevronRight, MapPin, User, MessageSquare, Phone, Activity, ChevronDown, Filter, ChevronLeft, Dumbbell, Award, Wifi, AmpersandIcon, Car, Coffee } from 'lucide-react';

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState('all');
  
  // Format date display
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Calculate week range
  const getWeekDates = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 0); // adjust when day is Sunday
    const startDate = new Date(date.setDate(diff));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    return {
      start: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  };
  
  const weekRange = getWeekDates(new Date(currentDate));
  
  // Navigate to previous/next week
  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };
  
  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };
  

  // Helper component for filter dropdown
const ChevronDown = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

  // Updated schedule data for Peggy Hill Team Community Centre
  const scheduleData = [
    {
      id: 1,
      title: "Adult Swim",
      facility: "Pool",
      activity: "Swimming",
      weekdays: [true, true, true, true, true, false, false],
      startTime: "6:00 AM",
      endTime: "8:00 AM",
      color: "bg-blue-100 border-blue-500"
    },
    {
      id: 2,
      title: "Open Gym",
      facility: "Gymnasium",
      activity: "Basketball",
      weekdays: [true, true, true, true, true, true, true],
      startTime: "9:00 AM",
      endTime: "12:00 PM",
      color: "bg-green-100 border-green-500"
    },
    {
      id: 3,
      title: "Senior Fitness",
      facility: "Fitness Centre",
      activity: "Fitness",
      weekdays: [false, true, false, true, false, true, false],
      startTime: "10:00 AM",
      endTime: "11:30 AM",
      color: "bg-purple-100 border-purple-500"
    },
    {
      id: 4,
      title: "Youth Drop-in",
      facility: "Youth Centre",
      activity: "Recreation",
      weekdays: [false, true, true, true, true, true, true],
      startTime: "3:30 PM",
      endTime: "8:00 PM",
      color: "bg-orange-100 border-orange-500"
    },
    {
      id: 5,
      title: "Family Swim",
      facility: "Pool",
      activity: "Swimming",
      weekdays: [true, false, false, true, true, true, true],
      startTime: "5:00 PM",
      endTime: "7:00 PM",
      color: "bg-blue-100 border-blue-500"
    },
    {
      id: 6,
      title: "Aqua Fitness",
      facility: "Pool",
      activity: "Fitness",
      weekdays: [false, true, true, false, false, false, false],
      startTime: "6:30 PM",
      endTime: "7:30 PM",
      color: "bg-teal-100 border-teal-500"
    },
    {
      id: 7,
      title: "Adult Volleyball",
      facility: "Gymnasium",
      activity: "Volleyball",
      weekdays: [false, false, true, true, false, false, false],
      startTime: "7:00 PM",
      endTime: "8:30 PM",
      color: "bg-red-100 border-red-500"
    },
    {
      id: 8,
      title: "Parents & Tots Swim",
      facility: "Pool",
      activity: "Swimming",
      weekdays: [false, true, false, true, false, true, true],
      startTime: "9:00 AM",
      endTime: "10:30 AM",
      color: "bg-blue-100 border-blue-500"
    },
    {
      id: 9,
      title: "Public Skate",
      facility: "Ice Arena",
      activity: "Skating",
      weekdays: [true, false, true, false, true, false, true],
      startTime: "1:00 PM",
      endTime: "3:00 PM",
      color: "bg-cyan-100 border-cyan-500"
    },
    {
      id: 10,
      title: "Yoga",
      facility: "Multi-Purpose Room",
      activity: "Fitness",
      weekdays: [true, false, true, false, true, true, false],
      startTime: "6:00 PM",
      endTime: "7:00 PM",
      color: "bg-purple-100 border-purple-500"
    },
    {
      id: 11,
      title: "Swimming Lessons",
      facility: "Pool",
      activity: "Swimming",
      weekdays: [false, true, false, true, false, true, false],
      startTime: "4:00 PM",
      endTime: "6:00 PM",
      color: "bg-blue-100 border-blue-500"
    },
    {
      id: 12,
      title: "Open Fitness Centre",
      facility: "Fitness Centre",
      activity: "Fitness",
      weekdays: [true, true, true, true, true, true, true],
      startTime: "5:30 AM",
      endTime: "9:00 PM",
      color: "bg-gray-100 border-gray-500"
    },
    {
      id: 13,
      title: "Community Meeting",
      facility: "Meeting Room",
      activity: "Community",
      weekdays: [false, true, false, true, false, false, false],
      startTime: "7:00 PM",
      endTime: "9:00 PM",
      color: "bg-amber-100 border-amber-500"
    },
    {
      id: 14,
      title: "Youth Hockey",
      facility: "Ice Arena",
      activity: "Hockey",
      weekdays: [false, false, true, false, true, true, false],
      startTime: "4:30 PM",
      endTime: "6:30 PM",
      color: "bg-cyan-100 border-cyan-500"
    }
  ];
  
  // Filter facilities and activities for dropdowns
  const facilities = [...new Set(scheduleData.map(item => item.facility))];
  const activities = [...new Set(scheduleData.map(item => item.activity))];
  
  // Filter schedule data based on selections
  const filteredSchedule = scheduleData.filter(item => {
    return (selectedFacility === 'all' || item.facility === selectedFacility) &&
           (selectedActivity === 'all' || item.activity === selectedActivity);
  });
  
  // Apply day of week headers
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayDates = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(currentDate);
    day.setDate(day.getDate() - day.getDay() + i);
    dayDates.push(day.getDate());
  }
  
  // Hours of operation
  const hoursOfOperation = [
    "Sunday: 8:00 AM - 8:00 PM",
    "Monday: 6:00 AM - 10:00 PM",
    "Tuesday: 6:00 AM - 10:00 PM",
    "Wednesday: 6:00 AM - 10:00 PM",
    "Thursday: 6:00 AM - 10:00 PM",
    "Friday: 6:00 AM - 9:00 PM",
    "Saturday: 8:00 AM - 8:00 PM"
  ];
  
  // Special Notices/Holiday Hours (sample data)
  const specialNotices = [
    {
      date: "March 31, 2025",
      title: "Easter Monday",
      hours: "9:00 AM - 5:00 PM"
    },
    {
      date: "May 19, 2025",
      title: "Victoria Day",
      hours: "9:00 AM - 5:00 PM"
    }
  ];

  // Centre features
  const features = [
    {
      name: "Youth Centre (11-17)",
      icon: <Users size={24} className="text-indigo-500" />,
      description: "Dedicated space for youth programs and activities"
    },
    {
      name: "EV Charging Stations",
      icon: <Car size={24} className="text-green-500" />,
      description: "Electric vehicle charging available on-site"
    },
    {
      name: "Fitness Centre",
      icon: <Dumbbell size={24} className="text-red-500" />,
      description: "Modern equipment for all fitness levels"
    },
    {
      name: "Gymnasium",
      icon: <Activity size={24} className="text-orange-500" />,
      description: "Multi-purpose court for various sports"
    },
    {
      name: "Ice / Arena",
      icon: <Award size={24} className="text-blue-500" />,
      description: "Ice skating and hockey facilities"
    },
    {
      name: "Meeting Room",
      icon: <MessageCircle size={24} className="text-gray-500" />,
      description: "Space for community gatherings and events"
    },
    {
      name: "Multi-Purpose Room",
      icon: <Coffee size={24} className="text-amber-500" />,
      description: "Flexible space for various activities"
    },
    {
      name: "Pool",
      description: "Indoor swimming facilities for all ages"
    },
    {
      name: "Wi-Fi",
      icon: <Wifi size={24} className="text-purple-500" />,
      description: "Free wireless internet throughout the facility"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold">Peggy Hill Team Community Centre</h1>
              <p className="text-blue-100 mt-2 flex items-center">
                <MapPin size={16} className="mr-1" />
                171 Mapleton Avenue
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/" className="text-white hover:text-blue-200 bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded-md transition-all">
                &larr; Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Features Overview */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
            <h2 className="text-xl font-bold flex items-center">
              <Award size={20} className="mr-2" />
              Centre Features
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-blue-50 transition-colors flex flex-col items-center text-center">
                  <div className="mb-2">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{feature.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Current Schedule Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <h2 className="text-xl font-bold flex items-center">
              <Calendar size={20} className="mr-2" />
              Weekly Schedule
            </h2>
          </div>
          
          <div className="p-6">
            {/* Week Navigation */}
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={previousWeek}
                className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors"
              >
                <ChevronLeft size={20} className="mr-1" />
                Previous Week
              </button>
              
              <div className="text-center">
                <h3 className="text-xl font-bold">{weekRange.start} - {weekRange.end}</h3>
                <p className="text-gray-600">{formattedDate}</p>
              </div>
              
              <button 
                onClick={nextWeek}
                className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors"
              >
                Next Week
                <ChevronRight size={20} className="ml-1" />
              </button>
            </div>
            
            {/* Filters */}
            <div className="mb-6">
              <button 
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md mb-2 transition-colors"
              >
                <Filter size={16} className="mr-2" />
                Filter Options
                <ChevronDown size={16} className="ml-2" />
              </button>
              
              {filterOpen && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Facility
                      </label>
                      <select 
                        value={selectedFacility}
                        onChange={(e) => setSelectedFacility(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="all">All Facilities</option>
                        {facilities.map(facility => (
                          <option key={facility} value={facility}>{facility}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activity
                      </label>
                      <select 
                        value={selectedActivity}
                        onChange={(e) => setSelectedActivity(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="all">All Activities</option>
                        {activities.map(activity => (
                          <option key={activity} value={activity}>{activity}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Schedule Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="w-36 border p-2 text-left"></th>
                    {weekdays.map((day, index) => (
                      <th key={day} className="border p-2 text-center bg-blue-50">
                        <div className="font-bold text-blue-700">{day}</div>
                        <div className="text-sm text-gray-600">{dayDates[index]}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedule.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border p-2 font-medium">
                        <div>{item.title}</div>
                        <div className="text-xs text-gray-500">{item.facility}</div>
                      </td>
                      
                      {item.weekdays.map((active, index) => (
                        <td key={index} className="border p-2 text-center">
                          {active ? (
                            <div className={`p-2 rounded-lg border-l-4 ${item.color} hover:shadow-md transition-shadow`}>
                              <div className="font-medium">{item.startTime} - {item.endTime}</div>
                              <div className="text-xs text-gray-600">{item.activity}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Hours of Operation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <Clock size={20} className="mr-2" />
                Hours of Operation
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-3">
                {hoursOfOperation.map((hours, index) => (
                  <div key={index} className="p-3 border rounded-md hover:bg-blue-50 transition-colors">
                    <div className="font-medium text-blue-700">{hours.split(':')[0]}</div>
                    <div className="text-gray-600">{hours.split(':').slice(1).join(':')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Holiday Hours & Special Notices */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-amber-500 to-red-500 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <Calendar size={20} className="mr-2" />
                Holiday Hours & Special Notices
              </h2>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  On statutory holidays, the community centre operates under special hours:
                </p>
                <p className="font-medium bg-amber-50 p-3 rounded-md border-l-4 border-amber-500">
                  Holiday Hours: 9:00 AM - 5:00 PM
                </p>
              </div>
              
              <h3 className="font-bold text-lg mt-6 mb-3">Upcoming Holiday Schedule</h3>
              {specialNotices.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {specialNotices.map((notice, index) => (
                    <div key={index} className="border rounded-md p-4 bg-amber-50 hover:bg-amber-100 transition-colors">
                      <div className="font-bold text-amber-700">{notice.title}</div>
                      <div className="text-sm text-gray-600">{notice.date}</div>
                      <div className="mt-2">{notice.hours}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No upcoming holiday hours at this time.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Location Information */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
            <h2 className="text-xl font-bold flex items-center">
              <MapPin size={20} className="mr-2" />
              Location Information
            </h2>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 mb-6 md:mb-0 md:pr-4">
                <h3 className="font-bold text-lg mb-4">Contact Details</h3>
                <div className="space-y-3">
                  <p className="flex items-center">
                    <MapPin size={18} className="mr-2 text-blue-500" />
                    <span><strong>Address:</strong> 171 Mapleton Avenue</span>
                  </p>
                  <p className="flex items-center">
                    <Phone size={18} className="mr-2 text-blue-500" />
                    <span><strong>Phone:</strong> (705) 739-4215</span>
                  </p>
                  <p className="flex items-center">
                    <Wifi size={18} className="mr-2 text-blue-500" />
                    <span><strong>Wi-Fi:</strong> Free throughout the facility</span>
                  </p>
                </div>
              </div>
              
              <div className="md:w-1/2 bg-gray-100 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-4">Facility Type</h3>
                <div className="space-y-3">
                  <p className="flex items-center">
                    <AmpersandIcon size={18} className="mr-2 text-blue-500" />
                    <span>Community Centre</span>
                  </p>
                  <p className="flex items-center">
                    <Activity size={18} className="mr-2 text-blue-500" />
                    <span>Recreation Centre</span>
                  </p>
                  <p className="flex items-center">
                    <Car size={18} className="mr-2 text-blue-500" />
                    <span>EV Charging Available</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact & Booking */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Need more information?</h2>
              <p className="text-blue-100">
                Contact us or book a facility online for your event or activity.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="tel:+17057394215" 
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-blue-50 text-center transition-colors flex items-center justify-center"
              >
                <Phone size={18} className="mr-2" />
                Call (705) 739-4215
              </a>
              <Link 
                href="/booking" 
                className="px-6 py-3 bg-indigo-700 text-white font-medium rounded-md hover:bg-indigo-800 text-center transition-colors flex items-center justify-center"
              >
                <Calendar size={18} className="mr-2" />
                Book a Facility
              </Link>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  );
}