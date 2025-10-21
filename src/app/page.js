'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Users, Clock, Calendar, MessageCircle, Video, TrendingUp, ChevronRight, MapPin, User, MessageSquare, Phone, Activity } from 'lucide-react';
import Navbar from './components/Navbar';

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentCapacity, setCurrentCapacity] = useState({ current: 0, max: 1200 });
  const miniChartRef = useRef(null);
  const miniChartInstance = useRef(null);

  const capacityPercentage = Math.round((currentCapacity.current / currentCapacity.max) * 100);

  // Calculate opening hours info
  const day = currentTime.getDay(); // 0 for Sunday, 1 for Monday, etc.

  let openingTime = new Date(currentTime);
  let closingTime = new Date(currentTime);

  if (day === 0) { // Sunday
    openingTime.setHours(7, 0, 0);
    closingTime.setHours(18, 0, 0);
  } else if (day === 6) { // Saturday
    openingTime.setHours(7, 0, 0);
    closingTime.setHours(18, 0, 0);
  } else if (day === 5) { // Friday
    openingTime.setHours(5, 30, 0);
    closingTime.setHours(20, 0, 0);
  } else { // Monday to Thursday
    openingTime.setHours(5, 30, 0);
    closingTime.setHours(21, 0, 0);
  }

  const isOpen = currentTime >= openingTime && currentTime < closingTime;

  const [hourlyData, setHourlyData] = useState([]);

  const generateHourlyData = useCallback(() => {
    const targetDate = new Date(currentTime);
    if (!isOpen) {
      targetDate.setDate(targetDate.getDate() - 1);
    }
    const targetDay = targetDate.getDay();

    const targetOpening = new Date(targetDate);
    const targetClosing = new Date(targetDate);

    if (targetDay === 0) {
      targetOpening.setHours(7, 0, 0, 0);
      targetClosing.setHours(18, 0, 0, 0);
    } else if (targetDay === 6) {
      targetOpening.setHours(7, 0, 0, 0);
      targetClosing.setHours(18, 0, 0, 0);
    } else if (targetDay === 5) {
      targetOpening.setHours(5, 30, 0, 0);
      targetClosing.setHours(20, 0, 0, 0);
    } else {
      targetOpening.setHours(5, 30, 0, 0);
      targetClosing.setHours(21, 0, 0, 0);
    }

    const data = [];
    const startHour = targetOpening.getHours();
    const endHour = targetClosing.getHours();

    // Generate data for the full operating day
    for (let h = startHour; h <= endHour; h++) {
      let visitors;
      if (h < 10) {
        visitors = Math.floor(180 + (h - startHour) * 30);
      } else if (h < 14) {
        visitors = Math.floor(600 + (h - 10) * 35);
      } else if (h < 17) {
        visitors = Math.floor(880 + (h - 14) * 15);
      } else {
        visitors = Math.floor(750 - (h - 17) * 25);
      }
      visitors = Math.min(visitors, 1200);

      let hourLabel;
      if (h === 0) {
        hourLabel = '12AM';
      } else if (h < 12) {
        hourLabel = h + 'AM';
      } else if (h === 12) {
        hourLabel = '12PM';
      } else {
        hourLabel = (h - 12) + 'PM';
      }

      data.push({ hour: hourLabel, visitors, hourValue: h });
    }

    return data;
  }, [currentTime, isOpen]);

  useEffect(() => {
    const newHourlyData = generateHourlyData();
    setHourlyData(newHourlyData);

    if (newHourlyData.length > 0 && isOpen) {
      // Set the current capacity as the visitors count for the current hour if available
      const currentHour = currentTime.getHours();
      const latestEntry = newHourlyData.find(item => item.hourValue === currentHour) || newHourlyData[newHourlyData.length - 1];
      setCurrentCapacity({ current: latestEntry.visitors, max: 1200 });
    }
  }, [currentTime, isOpen, generateHourlyData]);

  // Calculate time until closing
  const timeUntilClosing = closingTime - currentTime;
  const hoursUntilClosing = Math.floor(timeUntilClosing / (1000 * 60 * 60));
  const minutesUntilClosing = Math.floor((timeUntilClosing % (1000 * 60 * 60)) / (1000 * 60));

  // Status indicator
  let statusIndicator = { text: "", color: "" };

  if (!isOpen) {
    statusIndicator = { 
      text: "CLOSED", 
      color: "bg-red-500" 
    };
  } else if (hoursUntilClosing < 1) {
    statusIndicator = { 
      text: "CLOSING SOON", 
      color: "bg-yellow-500" 
    };
  } else {
    statusIndicator = { 
      text: "OPEN", 
      color: "bg-green-500" 
    };
  }

  // Format date and time
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Draw mini chart with predicted vs. actual coloring
  useEffect(() => {
    const drawMiniChart = async () => {
      if (typeof window !== 'undefined' && miniChartRef.current) {
        const ctx = miniChartRef.current.getContext('2d');

        // Destroy existing chart if it exists
        if (miniChartInstance.current) {
          miniChartInstance.current.destroy();
        }

        // Skip chart if no data
        if (hourlyData.length === 0) {
          return;
        }

        // Load Chart.js dynamically
        const Chart = (await import('chart.js/auto')).default;

        // Create new chart with data points as objects (including hourValue)
        miniChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: hourlyData.map(item => item.hour),
            datasets: [{
              label: 'Visitors',
              data: hourlyData.map(item => ({ x: item.hour, y: item.visitors, hourValue: item.hourValue })),
              borderColor: '#3b82f6', // default (overridden by segment)
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 3,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            parsing: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              x: {
                type: 'category',
                grid: {
                  display: false
                }
              },
              y: {
                beginAtZero: true,
                max: currentCapacity.max,
                grid: {
                  display: false
                }
              }
            },
            // Color segments: if the starting point of the segment is in the future, color yellow (predicted)
            segment: {
              borderColor: ctx => {
                if (ctx.p0.raw.hourValue > currentTime.getHours()) {
                  return '#FACC15';
                } else {
                  return '#3b82f6';
                }
              }
            }
          }
        });
      }
    };

    drawMiniChart();

    return () => {
      if (miniChartInstance.current) {
        miniChartInstance.current.destroy();
      }
    };
  }, [currentTime, currentCapacity.max, hourlyData]);

  // Get current day's hours
  const getTodayHours = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = daysOfWeek[new Date().getDay()];
    const hours = {
      'Monday': '6 a.m.–10 p.m.',
      'Tuesday': '6 a.m.–10 p.m.',
      'Wednesday': '6 a.m.–10 p.m.',
      'Thursday': '6 a.m.–10 p.m.',
      'Friday': '6 a.m.–10 p.m.',
      'Saturday': '6 a.m.–7 p.m.',
      'Sunday': '6 a.m.–7 p.m.'
    };
    return hours[day];
  };

  const getCapacityStatus = (percentage) => {
    if (percentage < 30) return "Not Busy";
    if (percentage < 60) return "Moderately Busy";
    if (percentage < 85) return "Busy";
    return "Very Busy";
  };

  const [showHoursModal, setShowHoursModal] = useState(false);

  // Get next opening time text
  const getNextOpeningText = () => {
    const tomorrow = new Date(currentTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDay();

    if (tomorrowDay === 0) return "Opens tomorrow at 7:00 AM";
    if (tomorrowDay === 6) return "Opens tomorrow at 7:00 AM";
    return "Opens tomorrow at 5:30 AM";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <header className="bg-blue-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold">Peggy Hill Team Recreation Centre</h1>
              <p className="text-blue-100 mt-1">Smart Facility Management System</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
              <div className="flex items-center">
                <Clock size={18} className="mr-2" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center mt-1">
                <span>{formattedTime}</span>
                <span className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${statusIndicator.color}`}>
                  {statusIndicator.text}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
<main className="container mx-auto px-4 py-8 bg-gray-50">
  {/* Center Info Card */}
  <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-600">
    <div className="flex flex-col md:flex-row md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Peggy Hill Team Community Centre</h1>
        <div className="flex items-start mb-1">
          <MapPin size={18} className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
          <p className="text-gray-700">171 Mapleton Ave, Barrie, ON L4N 8T6</p>
        </div>
        <div className="flex items-center mb-1">
          <Phone size={18} className="text-blue-500 mr-2 flex-shrink-0" />
          <p className="text-gray-700">(705) 792-7925</p>
        </div>
      </div>
      <div className="mt-4 md:mt-0">
        <a 
          href="https://maps.google.com/?q=171+Mapleton+Ave,+Barrie,+ON+L4N+8T6" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <MapPin size={16} className="inline mr-1" />
          Get Directions
        </a>
      </div>
    </div>
  </div>
  
  {/* Live Capacity Section */}
  <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
    <div className="p-4 bg-blue-600 text-white">
      <h2 className="text-xl font-bold flex items-center">
        <Users size={20} className="mr-2" />
        Live Facility Capacity
      </h2>
    </div>
    
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          {isOpen ? (
            <>
              <div className="text-center mb-4">
                <span className="text-5xl font-bold text-blue-600">{currentCapacity.current}</span>
                <span className="text-xl text-gray-600">/{currentCapacity.max}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
                <div 
                  className="h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium" 
                  style={{ width: `${(currentCapacity.current / currentCapacity.max) * 100}%` }}
                >
                  {capacityPercentage}%
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Current Usage</span>
                <span className="font-medium">{getCapacityStatus(capacityPercentage)}</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <span className="text-gray-700 font-medium text-xl mb-1">Facility Closed</span>
              <p className="text-gray-600 text-center">The facility is currently closed</p>
              <p className="text-blue-600 text-sm mt-2">Next open: {getNextOpeningText()}</p>
            </div>
          )}
          
          <div className="mt-6 flex justify-center">
            <Link 
              href="/capacity" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center shadow-sm"
            >
              <Activity size={16} className="mr-2" />
              View Detailed Analytics
            </Link>
          </div>
        </div>
        
        <div className="col-span-2 h-80 pb-2">
          <canvas ref={miniChartRef}></canvas>
          {!isOpen && (
            <div className="text-center mt-2 text-sm text-gray-600">
              Historical data for{" "}
              {new Date(
                new Date(currentTime).setDate(currentTime.getDate() - 1)
              ).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
              })}
            </div>
          )}
          {isOpen && hourlyData.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600">No data available while facility is closed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  
{/* Opening Hours Alert */}
<div className="bg-white p-6 rounded-lg shadow-md mb-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div className="flex items-start md:items-center">
        <Clock size={24} className="text-blue-600 mr-3 flex-shrink-0" />
        <div>
          <h2 className="font-semibold text-lg text-gray-800">Today Hours: {getTodayHours()}</h2>
          {isOpen ? (
            <p className="text-sm text-gray-600">
              {hoursUntilClosing > 0 ? `Closing in ${hoursUntilClosing} hours and ${minutesUntilClosing} minutes` : `Closing in ${minutesUntilClosing} minutes`}
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              {getNextOpeningText()}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 md:mt-0">
        <button onClick={() => setShowHoursModal(true)} className="text-blue-600 hover:text-blue-800 flex items-center">
          <Calendar size={16} className="mr-1" />
          View Full Schedule
        </button>
      </div>
    </div>
    
    {/* Hours details - can be toggled */}
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h3 className="font-medium mb-2 text-gray-700">Weekly Hours</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between py-1">
          <span className="font-medium">Monday</span>
          <span>6 a.m.–10 p.m.</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="font-medium">Tuesday</span>
          <span>6 a.m.–10 p.m.</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="font-medium">Wednesday</span>
          <span>6 a.m.–10 p.m.</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="font-medium">Thursday</span>
          <span>6 a.m.–10 p.m.</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="font-medium">Friday</span>
          <span>6 a.m.–10 p.m.</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="font-medium">Saturday</span>
          <span>6 a.m.–7 p.m.</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="font-medium">Sunday</span>
          <span>6 a.m.–7 p.m.</span>
        </div>
      </div>
    </div>
  </div>

  {/* Feature Highlights */}
  <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Peggy Hill Team Community Centre Features</h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    {/* Feature 1 */}
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-102 hover:shadow-lg">
      <div className="p-3 bg-indigo-600 text-white text-center">
        <Video size={28} className="mx-auto" />
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-3 text-gray-800">Video People Counter</h3>
        <p className="text-gray-600 mb-4">
          AI-powered cameras track facility usage in real-time, ensuring accurate capacity measurement.
        </p>
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div>
            <span className="block text-sm font-medium">Main Gym</span>
            <span className="text-xs text-gray-600">42/60 people</span>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Active</span>
        </div>
      </div>
    </div>
    
    {/* Feature 2 */}
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-102 hover:shadow-lg">
      <div className="p-3 bg-purple-600 text-white text-center">
        <TrendingUp size={28} className="mx-auto" />
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-3 text-gray-800">Capacity Prediction</h3>
        <p className="text-gray-600 mb-4">
          Plan your visit with ML-powered predictions based on historical facility usage.
        </p>
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div>
            <span className="block text-sm font-medium">Tomorrow at 6PM</span>
            <span className="text-xs text-gray-600">Expected: 85% capacity</span>
          </div>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Busy</span>
        </div>
      </div>
    </div>
    
    {/* Feature 3 - AI Assistant (linked to /aichat) */}
    <Link href="/aichat" className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-102 hover:shadow-lg">
        <div className="p-3 bg-green-600 text-white text-center">
          <MessageCircle size={28} className="mx-auto" />
        </div>
        <div className="p-5">
          <h3 className="font-bold text-lg mb-3 text-gray-800">AI Assistant</h3>
          <p className="text-gray-600 mb-4">
            Get instant answers about facility hours, programs, and availability through our chatbot.
          </p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-start mb-2">
              <div className="bg-gray-300 rounded-full w-8 h-8 mr-2 flex-shrink-0 flex items-center justify-center">
                <User size={14} className="text-gray-600" />
              </div>
              <p className="text-xs bg-gray-100 p-2 rounded-xl max-w-xs">
                When are swimming lessons available this week?
              </p>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-600 rounded-full w-8 h-8 mr-2 flex-shrink-0 flex items-center justify-center">
                <MessageSquare size={14} className="text-white" />
              </div>
              <p className="text-xs bg-blue-600 text-white p-2 rounded-xl max-w-xs">
                Swimming lessons are available on Tuesday (5PM), Thursday (6PM) and Saturday (10AM). Would you like to register?
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
    
    {/* Feature 4 - AI Phone Agent (linked to /aiphone) */}
    <Link href="/aiphone" className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-102 hover:shadow-lg">
        <div className="p-3 bg-red-600 text-white text-center">
          <Phone size={28} className="mx-auto" />
        </div>
        <div className="p-5">
          <h3 className="font-bold text-lg mb-3 text-gray-800">AI Phone Agent</h3>
          <p className="text-gray-600 mb-4">
            Our intelligent phone system answers calls 24/7, handles bookings, and answers questions.
          </p>
          <div className="flex flex-col bg-gray-50 p-3 rounded-lg text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Call Volume Today:</span>
              <span className="font-medium text-gray-800">42 calls</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Resolution Time:</span>
              <span className="font-medium text-gray-800">2m 34s</span>
            </div>
            <button className="mt-3 text-blue-600 text-xs hover:text-blue-800">
              Call Now: (705) 792-7925
            </button>
          </div>
        </div>
      </div>
    </Link>
    
    {/* Feature 5 - Online Booking (linked to /register) */}
    <Link href="/register" className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-102 hover:shadow-lg">
        <div className="p-3 bg-yellow-600 text-white text-center">
          <Calendar size={28} className="mx-auto" />
        </div>
        <div className="p-5">
          <h3 className="font-bold text-lg mb-3 text-gray-800">Online Booking</h3>
          <p className="text-gray-600 mb-4">
            Reserve your spot in advance and skip the line. Pay fees online and get instant confirmation.
          </p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2 text-gray-700">Upcoming Events:</h4>
            <div className="text-xs space-y-2">
              <div className="flex justify-between pb-1 border-b border-gray-200">
                <span className="text-gray-700">Family Swim</span>
                <span className="font-medium">Today, 7PM</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-gray-200">
                <span className="text-gray-700">Senior Yoga</span>
                <span className="font-medium">Tomorrow, 9AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Basketball Tournament</span>
                <span className="font-medium">Saturday, 1PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
    
    {/* Feature 6 */}
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-102 hover:shadow-lg">
      <div className="p-3 bg-blue-600 text-white text-center">
        <Users size={28} className="mx-auto" />
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-3 text-gray-800">Facility Usage</h3>
        <p className="text-gray-600 mb-4">
          Track popular times and make informed decisions about when to visit our facilities.
        </p>
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-3 text-gray-700">Current Usage:</h4>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">Basketball Court</span>
                <span className="font-medium">75%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">Swimming Pool</span>
                <span className="font-medium">60%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">Fitness Center</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  {/* CTA Section */}
  <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
    <div className="flex flex-col md:flex-row items-center justify-between">
      <div className="mb-6 md:mb-0 md:mr-8">
        <h2 className="text-2xl font-bold mb-3">Ready to visit Peggy Hill Team Community Centre?</h2>
        <p className="text-blue-100 max-w-lg">
          Check our real-time capacity, book your spot, or get your questions answered about our Barrie, ON location.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/capacity" 
          className="px-6 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-blue-50 text-center shadow-sm"
        >
          <Activity size={16} className="inline mr-2" />
          View Capacity
        </Link>
        <Link 
          href="/register" 
          className="px-6 py-3 bg-yellow-500 text-white font-medium rounded-md hover:bg-yellow-600 text-center shadow-sm"
        >
          <Calendar size={16} className="inline mr-2" />
          Book Now
        </Link>
        <Link 
          href="/aiphone" 
          className="px-6 py-3 bg-blue-800 text-white font-medium rounded-md hover:bg-blue-900 text-center shadow-sm"
        >
          <MessageCircle size={16} className="inline mr-2" />
          Get Help
        </Link>
      </div>
    </div>
  </div>
</main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Peggy Hill Team Recreation Center</h3>
              <address className="not-italic text-gray-300">
  171 Mapleton Ave<br />
  Barrie, ON L4N 8T6<br />
  Canada
</address>

              <p className="mt-2 text-gray-300">
                <a href="tel:+17057921234" className="hover:text-white">(705) 792-1234</a>
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/schedule" className="hover:text-white">Schedule</Link></li>
                <li><Link href="/capacity" className="hover:text-white">Capacity</Link></li>
                <li><Link href="/register" className="hover:text-white">Book Activities</Link></li>
                <li><Link href="/backend" className="hover:text-white">Staff Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Hours</h3>
              <ul className="space-y-1 text-gray-300">
                <li className="flex justify-between">
                  <span>Monday-Thursday:</span>
                  <span>5:30 AM - 9:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Friday:</span>
                  <span>5:30 AM - 8:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday-Sunday:</span>
                  <span>7:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Holidays:</span>
                  <span>9:00 AM - 5:00 PM</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
            <p>© 2025 City of Barrie, Peggy Hill Team Community Centre. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}