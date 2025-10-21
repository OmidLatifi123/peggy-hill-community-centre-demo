'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, Filter, RefreshCw, Users, TrendingUp, Activity } from 'lucide-react';

import Navbar from '../components/Navbar';
import Link from 'next/link';

const CapacityDashboard = () => {
  // Operating hours helper – returns opening and closing Date objects for a given date.
  const getOperatingHours = (date) => {
    const day = date.getDay();
    let openingTime = new Date(date);
    let closingTime = new Date(date);

    if (day === 0) { // Sunday
      openingTime.setHours(7, 0, 0, 0);
      closingTime.setHours(18, 0, 0, 0);
    } else if (day === 6) { // Saturday
      openingTime.setHours(7, 0, 0, 0);
      closingTime.setHours(18, 0, 0, 0);
    } else if (day === 5) { // Friday
      openingTime.setHours(5, 30, 0, 0);
      closingTime.setHours(20, 0, 0, 0);
    } else { // Monday to Thursday
      openingTime.setHours(5, 30, 0, 0);
      closingTime.setHours(21, 0, 0, 0);
    }

    return { openingTime, closingTime };
  };

  // This function simulates overall visitors in the facility based on the current hour.
  // (Overall maximum capacity is 450.)
  // If current time is before opening or after closing, returns 0.
  const getCurrentVisitors = () => {
    const now = new Date();
    const { openingTime, closingTime } = getOperatingHours(now);
    if (now < openingTime || now > closingTime) {
      return 0;
    }
    const currentHour = Math.min(now.getHours(), closingTime.getHours());
    const openingHour = openingTime.getHours();
    let visitors = 0;
    if (currentHour < 10) {
      visitors = Math.floor(45 + (currentHour - openingHour) * 30);
    } else if (currentHour < 14) {
      visitors = Math.floor(150 + (currentHour - 10) * 35);
    } else if (currentHour < 17) {
      visitors = Math.floor(220 + (currentHour - 14) * 15);
    } else {
      visitors = Math.floor(250 - (currentHour - 17) * 25);
    }
    return Math.min(visitors, 1200);
  };

  const getCapacityPercentage = () => {
    return Math.round((getCurrentVisitors() / 1200) * 100);
  };

  // Get current date and operating hours
  const currentDate = new Date();
  const { openingTime, closingTime } = getOperatingHours(currentDate);
  const currentHour = Math.min(currentDate.getHours(), closingTime.getHours());
  const openingHour = openingTime.getHours();
  const peakHour = 18; // Typical peak time (6 PM)

  // Helper: simulate facility occupancy for a given hour.
  // For hours before the peak, occupancy increases linearly.
  // For hours after the peak, it declines linearly toward closing.
  const getHourlyOccupancy = (hour, capacity, openingHour, peakHour) => {
    if (hour < openingHour || hour > closingTime.getHours()) {
      return 0;
    }
    if (hour <= peakHour) {
      const fraction = (hour - openingHour) / (peakHour - openingHour);
      return Math.round(fraction * capacity);
    } else {
      const totalDeclineHours = closingTime.getHours() - peakHour;
      const fraction = totalDeclineHours > 0 ? 1 - ((hour - peakHour) / totalDeclineHours) : 0;
      return Math.round(fraction * capacity);
    }
  };

  // Generate "Today" data dynamically in 2-hour increments from opening until current hour.
  const todayData = [];
  for (let hr = openingHour; hr <= currentHour; hr += 2) {
    const label = hr < 12 ? `${hr}AM` : (hr === 12 ? '12PM' : `${hr - 12}PM`);
    todayData.push({
      hour: label,
      basketball: getHourlyOccupancy(hr, 50, openingHour, peakHour),
      swimming: getHourlyOccupancy(hr, 40, openingHour, peakHour),
      gym: getHourlyOccupancy(hr, 60, openingHour, peakHour),
      tennis: getHourlyOccupancy(hr, 30, openingHour, peakHour)
    });
  }

  // Overall occupancy percentage for the facility (0–100).
  const overallVisitors = getCurrentVisitors();
  const overallPercentage = Math.round((overallVisitors / 1200) * 100);

  // Generate "Week" data: next 7 days with varied numbers.
  // x-axis: "Today", "Tomorrow", then weekday names.
const weekData = [];
for (let i = 0; i < 7; i++) {
  let d = new Date();
  d.setDate(d.getDate() + i);
  let label = "";
  if (i === 0) {
    label = "Today";
  } else if (i === 1) {
    label = "Tomorrow";
  } else {
    label = d.toLocaleDateString("en-US", { weekday: "long" });
  }
  // Generate a more varied number by adding a random variance (±10% of max capacity)
  const variance = Math.floor(Math.random() * 0.4 * 1200) - Math.floor(0.01 * 1200);
  const simulatedVisitors = Math.max(0, Math.min(1200, overallVisitors + variance + i * 20));
  const predictedPercentage = Math.round((simulatedVisitors / 1200) * 100);
  weekData.push({ day: label, totalVisits: simulatedVisitors, maxCapacity: 1200, utilization: predictedPercentage });
}


  // Generate "Month" data: current occupancy for each facility (based on its max capacity)
  const monthData = [
    { name: 'Basketball Court', value: Math.round(50 * overallPercentage / 100), capacity: 50, color: '#8884d8' },
    { name: 'Swimming Pool', value: Math.round(40 * overallPercentage / 100), capacity: 40, color: '#82ca9d' },
    { name: 'Gym', value: Math.round(60 * overallPercentage / 100), capacity: 60, color: '#ffc658' },
    { name: 'Tennis Courts', value: Math.round(30 * overallPercentage / 100), capacity: 30, color: '#ff8042' }
  ];

  // Generate "Predictions" data for the next 7 days.
  // The label is "Today" for day 0, "Tomorrow" for day 1, and weekday abbreviation for the rest.
  const predictionsData = [];
  for (let i = 0; i < 7; i++) {
    let d = new Date();
    d.setDate(d.getDate() + i);
    let label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    // Increase predicted occupancy by 5% each day but do not exceed 100%
    const predictedPercentage = Math.min(100, overallPercentage + i * 5);
    predictionsData.push({
      day: label,
      basketball: Math.round(50 * predictedPercentage / 100),
      swimming: Math.round(40 * predictedPercentage / 100),
      gym: Math.round(60 * predictedPercentage / 100),
      tennis: Math.round(30 * predictedPercentage / 100)
    });
  }

  // Combine the dynamic data into one facilityData object.
  const facilityData = useMemo(() => ({
    today: todayData,
    week: weekData,
    month: monthData,
    predictions: predictionsData
  }), [todayData, weekData, monthData, predictionsData, overallPercentage]);

  const [timeFilter, setTimeFilter] = useState('today');
  const [lastUpdated, setLastUpdated] = useState('');
  const [chartLoaded, setChartLoaded] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Initialize with current time for "Last updated"
  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  // Format date for chart title
  const formattedChartDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  // Extract numeric hour from a string (e.g., "6AM" or "8PM")
  const convertTo24Hour = (hourStr) => {
    const hourNum = parseInt(hourStr.replace(/\D/g, ''));
    const isPM = hourStr.includes('PM');
    if (isPM && hourNum !== 12) {
      return hourNum + 12;
    }
    if (!isPM && hourNum === 12) {
      return 0;
    }
    return hourNum;
  };

  // For the "today" filter, filter the data up to the latest operating hour.
  const todayDataFiltered = facilityData.today.filter(item => {
    const formattedHour = convertTo24Hour(item.hour);
    return formattedHour <= currentHour;
  });

  // Handle chart creation and updates
  useEffect(() => {
    let isMounted = true;

    const initializeChart = async () => {
      if (typeof window === 'undefined' || !chartRef.current) return;

      try {
        // Safely destroy any existing chart
        if (chartInstance.current) {
          chartInstance.current.destroy();
          chartInstance.current = null;
        }

        // Import Chart.js dynamically
        const { default: Chart } = await import('chart.js/auto');

        // Wait a bit for the DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if component is still mounted
        if (!isMounted || !chartRef.current) return;

        const ctx = chartRef.current.getContext('2d');

        // Configure chart based on selected filter
        let chartConfig = {};

        if (timeFilter === 'today') {
          chartConfig = {
            type: 'bar',
            data: {
              labels: todayDataFiltered.map(item => item.hour),
              datasets: [
                {
                  label: 'Basketball Court',
                  data: todayDataFiltered.map(item => item.basketball),
                  backgroundColor: '#8884d8',
                },
                {
                  label: 'Swimming Pool',
                  data: todayDataFiltered.map(item => item.swimming),
                  backgroundColor: '#82ca9d',
                },
                {
                  label: 'Gym',
                  data: todayDataFiltered.map(item => item.gym),
                  backgroundColor: '#ffc658',
                },
                {
                  label: 'Tennis Courts',
                  data: todayDataFiltered.map(item => item.tennis),
                  backgroundColor: '#ff8042',
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
            }
          };
        } else if (timeFilter === 'week') {
          chartConfig = {
            type: 'line',
            data: {
              labels: facilityData.week.map(item => item.day),
              datasets: [
                {
                  label: 'Total Visits',
                  data: facilityData.week.map(item => item.totalVisits),
                  borderColor: '#8884d8',
                  backgroundColor: 'rgba(136, 132, 216, 0.2)',
                  tension: 0.1,
                },
                {
                  label: 'Maximum Capacity',
                  data: facilityData.week.map(item => item.maxCapacity),
                  borderColor: '#82ca9d',
                  backgroundColor: 'rgba(130, 202, 157, 0.2)',
                  borderDash: [5, 5],
                  tension: 0.1,
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  min: 0,
                  max: 1400
                }
              }
            }
          };
        } else if (timeFilter === 'month') {
          chartConfig = {
            type: 'pie',
            data: {
              labels: facilityData.month.map(item => item.name),
              datasets: [
                {
                  data: facilityData.month.map(item => item.value),
                  backgroundColor: facilityData.month.map(item => item.color),
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
            }
          };
        } else if (timeFilter === 'predictions') {
          chartConfig = {
            type: 'line',
            data: {
              labels: facilityData.predictions.map(item => item.day),
              datasets: [
                {
                  label: 'Basketball Court',
                  data: facilityData.predictions.map(item => item.basketball),
                  borderColor: '#8884d8',
                  backgroundColor: 'rgba(136, 132, 216, 0.2)',
                  fill: true,
                  tension: 0.4,
                },
                {
                  label: 'Swimming Pool',
                  data: facilityData.predictions.map(item => item.swimming),
                  borderColor: '#82ca9d',
                  backgroundColor: 'rgba(130, 202, 157, 0.2)',
                  fill: true,
                  tension: 0.4,
                },
                {
                  label: 'Gym',
                  data: facilityData.predictions.map(item => item.gym),
                  borderColor: '#ffc658',
                  backgroundColor: 'rgba(255, 198, 88, 0.2)',
                  fill: true,
                  tension: 0.4,
                },
                {
                  label: 'Tennis Courts',
                  data: facilityData.predictions.map(item => item.tennis),
                  borderColor: '#ff8042',
                  backgroundColor: 'rgba(255, 128, 66, 0.2)',
                  fill: true,
                  tension: 0.4,
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
            }
          };
        }

        // Create the chart
        chartInstance.current = new Chart(ctx, chartConfig);
        setChartLoaded(true);

      } catch (error) {
        console.error("Error initializing chart:", error);
      }
    };

    initializeChart();

    // Cleanup function
    return () => {
      isMounted = false;
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [timeFilter, facilityData, todayDataFiltered, currentHour]);

  const handleRefresh = () => {
    // In a real app, this would fetch new data
    setLastUpdated(new Date().toLocaleTimeString());

    // Force chart refresh by destroying and recreating it
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    // This will trigger the useEffect that creates the chart
    setChartLoaded(false);
  };

  return (
    <div
      className="w-full mx-auto p-6 rounded-lg shadow-md bg-cover bg-center"
      style={{ backgroundImage: "url('/background1.svg')" }}
    >
      <Navbar />
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black">Facility Capacity Dashboard</h1>
        <div className="flex items-center mt-4 md:mt-0">
          <span className="text-sm text-black mr-2">Last updated: {lastUpdated}</span>
          <button 
            onClick={handleRefresh} 
            className="flex items-center justify-center p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Time Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm">
        <button 
          onClick={() => setTimeFilter('today')}
          className={`flex items-center px-4 py-2 rounded-md ${timeFilter === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          <Calendar size={16} className="mr-2" />
          Today
        </button>
        <button 
          onClick={() => setTimeFilter('week')}
          className={`flex items-center px-4 py-2 rounded-md ${timeFilter === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          <Activity size={16} className="mr-2" />
          This Week
        </button>
        <button 
          onClick={() => setTimeFilter('month')}
          className={`flex items-center px-4 py-2 rounded-md ${timeFilter === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          <Users size={16} className="mr-2" />
          This Month
        </button>
        <button 
          onClick={() => setTimeFilter('predictions')}
          className={`flex items-center px-4 py-2 rounded-md ${timeFilter === 'predictions' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          <TrendingUp size={16} className="mr-2" />
          Predictions
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-black">Current Visitors</h3>
          <p className="text-2xl font-bold">{getCurrentVisitors()}</p>
          <p className="text-xs text-black">Across all facilities</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-black">Available Capacity</h3>
          <p className="text-2xl font-bold">{getCapacityPercentage()}%</p>
          <p className="text-xs text-black">Of maximum capacity</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-black">Typical Peak Time</h3>
          <p className="text-2xl font-bold">6:00 PM</p>
          <p className="text-xs text-black">Expected 85% capacity</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-black">Weekly Average</h3>
          <p className="text-2xl font-bold">2,420</p>
          <p className="text-xs text-black">Visitors per week</p>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">
          {timeFilter === 'today' && `Today Hourly Capacity (${formattedChartDate})`}
          {timeFilter === 'week' && 'This Week Daily Capacity'}
          {timeFilter === 'month' && 'This Month Facility Utilization'}
          {timeFilter === 'predictions' && 'Capacity Predictions (Next 7 Days)'}
        </h2>
        
        <div className="h-80 w-full">
          {!chartLoaded && <div className="flex items-center justify-center h-full">Loading chart...</div>}
          <canvas ref={chartRef} key={`chart-${timeFilter}`}></canvas>
        </div>
      </div>

      {/* Secondary Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Live Capacity Status</h2>
          <div className="space-y-4">
            {facilityData.month.map((facility) => (
              <div key={facility.name} className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{facility.name}</span>
                  <span className="text-sm font-medium">{facility.value}/{facility.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full" 
                    style={{
                      width: `${(facility.value / facility.capacity) * 100}%`,
                      backgroundColor: facility.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              <Users className="mr-2" size={20} />
              View All Facilities
            </button>
            <button className="flex items-center justify-center p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
              <Calendar className="mr-2" size={20} />
              Schedule Visit
            </button>
            <button className="flex items-center justify-center p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
              <Filter className="mr-2" size={20} />
              Advanced Filters
            </button>
            <button className="flex items-center justify-center p-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition">
              <TrendingUp className="mr-2" size={20} />
              View All Predictions
            </button>
          </div>
        </div>
      </div>
      
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
            <p>© 2025 City of Barrie, Peggy Hill Team Community Center. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CapacityDashboard;
