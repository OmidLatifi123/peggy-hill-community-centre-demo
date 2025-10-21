'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Calendar, Filter, RefreshCw, Users, TrendingUp, Activity, 
  ChevronDown, Zap, AlertTriangle, Clock, Layers, PieChart, 
  BarChart2, XCircle, Check, Info 
} from 'lucide-react';
import Link from 'next/link';

const CapacityDashboard = () => {
  // Helper function: returns operating hours based on day of week.
  const getOperatingHours = (date) => {
    const day = date.getDay();
    // In JavaScript, Sunday = 0, Monday = 1, …, Saturday = 6.
    if (day >= 1 && day <= 4) { // Monday-Thursday
      return { open: 5.5, close: 21 }; // 5:30 AM to 9:00 PM
    } else if (day === 5) { // Friday
      return { open: 5.5, close: 20 }; // 5:30 AM to 8:00 PM
    } else { // Saturday or Sunday
      return { open: 7, close: 18 }; // 7:00 AM to 6:00 PM
    }
  };

  // Helper function: converts labels like "6AM" or "8PM" to a 24-hour numeric value.
  const convertHourLabelToNumber = (label) => {
    const regex = /(\d+)(AM|PM)/;
    const match = label.match(regex);
    if (match) {
      let hour = parseInt(match[1], 10);
      const period = match[2];
      if (period === 'PM' && hour !== 12) {
        hour += 12;
      }
      if (period === 'AM' && hour === 12) {
        hour = 0;
      }
      return hour;
    }
    return 0;
  };

  // Memoize facilityData so it's not recreated on every render
  const facilityData = useMemo(() => ({
    today: [
      { hour: '6AM', basketball: 10, swimming: 8, gym: 15, tennis: 5 },
      { hour: '8AM', basketball: 18, swimming: 12, gym: 22, tennis: 8 },
      { hour: '10AM', basketball: 25, swimming: 18, gym: 30, tennis: 12 },
      { hour: '12PM', basketball: 30, swimming: 25, gym: 35, tennis: 18 },
      { hour: '2PM', basketball: 28, swimming: 22, gym: 32, tennis: 15 },
      { hour: '4PM', basketball: 35, swimming: 28, gym: 38, tennis: 20 },
      { hour: '6PM', basketball: 40, swimming: 30, gym: 42, tennis: 25 },
      { hour: '8PM', basketball: 25, swimming: 15, gym: 28, tennis: 10 },
    ],
    week: [
      { day: 'Monday', totalVisits: 320, maxCapacity: 450, utilization: 71 },
      { day: 'Tuesday', totalVisits: 280, maxCapacity: 450, utilization: 62 },
      { day: 'Wednesday', totalVisits: 350, maxCapacity: 450, utilization: 78 },
      { day: 'Thursday', totalVisits: 290, maxCapacity: 450, utilization: 64 },
      { day: 'Friday', totalVisits: 380, maxCapacity: 450, utilization: 84 },
      { day: 'Saturday', totalVisits: 420, maxCapacity: 450, utilization: 93 },
      { day: 'Sunday', totalVisits: 380, maxCapacity: 450, utilization: 84 }
    ],
    month: [
      { name: 'Basketball Court', value: 35, capacity: 50, color: '#8884d8', peakHours: [17, 18, 19], lowHours: [6, 7, 22, 23] },
      { name: 'Swimming Pool', value: 28, capacity: 40, color: '#82ca9d', peakHours: [11, 12, 18, 19], lowHours: [6, 7, 22] },
      { name: 'Gym', value: 42, capacity: 60, color: '#ffc658', peakHours: [6, 7, 17, 18, 19], lowHours: [10, 11, 14, 15] },
      { name: 'Tennis Courts', value: 18, capacity: 30, color: '#ff8042', peakHours: [9, 10, 17, 18], lowHours: [6, 7, 13, 14, 22] }
    ],
    predictions: [
      { day: 'Today', basketball: 80, swimming: 75, gym: 90, tennis: 60 },
      { day: 'Tomorrow', basketball: 85, swimming: 78, gym: 88, tennis: 65 },
      { day: 'Wed', basketball: 70, swimming: 65, gym: 80, tennis: 55 },
      { day: 'Thu', basketball: 75, swimming: 70, gym: 85, tennis: 60 },
      { day: 'Fri', basketball: 90, swimming: 85, gym: 95, tennis: 70 },
      { day: 'Sat', basketball: 95, swimming: 90, gym: 98, tennis: 85 },
      { day: 'Sun', basketball: 85, swimming: 80, gym: 90, tennis: 75 }
    ],
    hourlyTrends: [
      { hour: '6AM', weekday: 20, weekend: 15 },
      { hour: '8AM', weekday: 35, weekend: 25 },
      { hour: '10AM', weekday: 40, weekend: 60 },
      { hour: '12PM', weekday: 55, weekend: 85 },
      { hour: '2PM', weekday: 50, weekend: 90 },
      { hour: '4PM', weekday: 65, weekend: 75 },
      { hour: '6PM', weekday: 80, weekend: 60 },
      { hour: '8PM', weekday: 70, weekend: 45 },
    ],
    busyThresholds: {
      low: 40, // 0-40% utilization
      moderate: 70, // 41-70% utilization
      high: 90, // 71-90% utilization
      critical: 100 // 91-100% utilization
    },
    crowdedTimes: {
      basketball: { weekdays: ['5PM', '6PM', '7PM'], weekends: ['11AM', '12PM', '1PM', '2PM'] },
      swimming: { weekdays: ['6AM', '7AM', '6PM', '7PM'], weekends: ['1PM', '2PM', '3PM'] },
      gym: { weekdays: ['6AM', '7AM', '5PM', '6PM', '7PM'], weekends: ['10AM', '11AM', '12PM'] },
      tennis: { weekdays: ['5PM', '6PM'], weekends: ['9AM', '10AM', '11AM'] }
    },
    historicalData: {
      lastYear: [320, 302, 301, 334, 390, 330, 320, 315, 350, 390, 420, 380],
      thisYear: [350, 320, 310, 350, 410, 360, 340, 330, 380, 420, 450, 400]
    }
  }), []);

  const [timeFilter, setTimeFilter] = useState('today');
  const [lastUpdated, setLastUpdated] = useState('');
  const [chartLoaded, setChartLoaded] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [detailedViewOpen, setDetailedViewOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [alertsVisible, setAlertsVisible] = useState(true);
  const chartRef = useRef(null);
  const detailChartRef = useRef(null);
  const chartInstance = useRef(null);
  const detailChartInstance = useRef(null);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
    const intervalId = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString());
    }, 300000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initializeChart = async () => {
      if (typeof window === 'undefined' || !chartRef.current) return;
      try {
        if (chartInstance.current) {
          chartInstance.current.destroy();
          chartInstance.current = null;
        }
        const { default: Chart } = await import('chart.js/auto');
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!isMounted || !chartRef.current) return;
        const ctx = chartRef.current.getContext('2d');

        // Variables for the "today" filter
        let filteredData = facilityData.today;
        let displayDate = new Date().toLocaleDateString();
        if (timeFilter === 'today') {
          const now = new Date();
          const { open, close } = getOperatingHours(now);
          const currentHourDecimal = now.getHours() + now.getMinutes() / 60;
          // If current time is within operating hours, only show hours that have passed.
          if (currentHourDecimal >= open && currentHourDecimal <= close) {
            filteredData = facilityData.today.filter(item => {
              const hourVal = convertHourLabelToNumber(item.hour);
              return hourVal <= currentHourDecimal;
            });
          } else {
            // Otherwise, show the previous day's data.
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            displayDate = yesterday.toLocaleDateString();
            filteredData = facilityData.today;
          }
        }

        let chartConfig = {};

        if (timeFilter === 'today') {
          chartConfig = {
            type: 'bar',
            data: {
              labels: filteredData.map(item => item.hour),
              datasets: [
                {
                  label: 'Basketball Court',
                  data: filteredData.map(item => item.basketball),
                  backgroundColor: '#8884d8',
                  borderWidth: 1,
                  borderRadius: 4,
                },
                {
                  label: 'Swimming Pool',
                  data: filteredData.map(item => item.swimming),
                  backgroundColor: '#82ca9d',
                  borderWidth: 1,
                  borderRadius: 4,
                },
                {
                  label: 'Gym',
                  data: filteredData.map(item => item.gym),
                  backgroundColor: '#ffc658',
                  borderWidth: 1,
                  borderRadius: 4,
                },
                {
                  label: 'Tennis Courts',
                  data: filteredData.map(item => item.tennis),
                  backgroundColor: '#ff8042',
                  borderWidth: 1,
                  borderRadius: 4,
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { grid: { display: false } },
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(0, 0, 0, 0.05)' },
                  ticks: { callback: value => value + ' users' }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: context => {
                      const value = context.raw;
                      let status = 'Low';
                      if (value > 30) status = 'Critical';
                      else if (value > 20) status = 'High';
                      else if (value > 10) status = 'Moderate';
                      return `${context.dataset.label}: ${value} users (${status} occupancy)`;
                    }
                  }
                },
                legend: { position: 'bottom' },
                // Display the date in the title for today's chart
                title: {
                  display: true,
                  text: `Hourly Occupancy for ${displayDate}`,
                  font: { size: 16 }
                }
              }
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
                  tension: 0.3,
                  fill: true,
                  order: 2
                },
                {
                  label: 'Maximum Capacity',
                  data: facilityData.week.map(item => item.maxCapacity),
                  borderColor: '#82ca9d',
                  backgroundColor: 'rgba(130, 202, 157, 0.2)',
                  borderDash: [5, 5],
                  tension: 0.1,
                  order: 3
                },
                {
                  type: 'bar',
                  label: 'Utilization %',
                  data: facilityData.week.map(item => item.utilization),
                  backgroundColor: ctx => {
                    const value = ctx.raw;
                    if (value > 90) return 'rgba(255, 99, 132, 0.6)';
                    if (value > 70) return 'rgba(255, 159, 64, 0.6)';
                    if (value > 40) return 'rgba(255, 205, 86, 0.6)';
                    return 'rgba(75, 192, 192, 0.6)';
                  },
                  yAxisID: 'y1',
                  order: 1,
                  borderRadius: 4
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { grid: { display: false } },
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(0, 0, 0, 0.05)' },
                  title: { display: true, text: 'Number of Visitors' }
                },
                y1: {
                  position: 'right',
                  beginAtZero: true,
                  max: 100,
                  grid: { drawOnChartArea: false },
                  title: { display: true, text: 'Utilization %' },
                  ticks: { callback: value => value + '%' }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: context => {
                      if (context.dataset.label === 'Utilization %') {
                        return `${context.dataset.label}: ${context.raw}%`;
                      }
                      return `${context.dataset.label}: ${context.raw}`;
                    }
                  }
                },
                legend: { position: 'bottom' }
              }
            }
          };
        } else if (timeFilter === 'month') {
          chartConfig = {
            type: 'radar',
            data: {
              labels: facilityData.month.map(item => item.name),
              datasets: [
                {
                  label: 'Current Utilization %',
                  data: facilityData.month.map(item => Math.round((item.value / item.capacity) * 100)),
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  borderColor: 'rgb(255, 99, 132)',
                  pointBackgroundColor: 'rgb(255, 99, 132)',
                  pointBorderColor: '#fff',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: 'rgb(255, 99, 132)'
                },
                {
                  label: 'Target Utilization %',
                  data: [70, 80, 75, 65],
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgb(54, 162, 235)',
                  pointBackgroundColor: 'rgb(54, 162, 235)',
                  pointBorderColor: '#fff',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: 'rgb(54, 162, 235)',
                  borderDash: [5, 5]
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              elements: { line: { tension: 0.3 } },
              scales: {
                r: {
                  beginAtZero: true,
                  max: 100,
                  ticks: { stepSize: 20, callback: value => value + '%' },
                  pointLabels: { font: { weight: 'bold' } }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: context => `${context.dataset.label}: ${context.raw}%`
                  }
                },
                legend: { position: 'bottom' }
              }
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
              scales: {
                x: { grid: { display: false } },
                y: {
                  beginAtZero: true,
                  max: 100,
                  grid: { color: 'rgba(0, 0, 0, 0.05)' },
                  ticks: { callback: value => value + '%' }
                }
              },
              plugins: {
                annotation: {
                  annotations: {
                    line1: {
                      type: 'line',
                      yMin: 90,
                      yMax: 90,
                      borderColor: 'red',
                      borderWidth: 2,
                      borderDash: [5, 5],
                      label: { enabled: true, content: 'Critical Threshold (90%)', position: 'end' }
                    },
                    line2: {
                      type: 'line',
                      yMin: 70,
                      yMax: 70,
                      borderColor: 'orange',
                      borderWidth: 2,
                      borderDash: [5, 5],
                      label: { enabled: true, content: 'High Threshold (70%)', position: 'end' }
                    }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: context => {
                      const value = context.raw;
                      let status = 'Low';
                      if (value > 90) status = 'Critical';
                      else if (value > 70) status = 'High';
                      else if (value > 40) status = 'Moderate';
                      return `${context.dataset.label}: ${value}% (${status})`;
                    }
                  }
                },
                legend: { position: 'bottom' }
              }
            }
          };
        }

        chartInstance.current = new Chart(ctx, chartConfig);
        setChartLoaded(true);
      } catch (error) {
        console.error("Error initializing chart:", error);
      }
    };

    initializeChart();
    return () => {
      isMounted = false;
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [timeFilter, facilityData]);

  useEffect(() => {
    let isMounted = true;
    const initializeDetailChart = async () => {
      if (typeof window === 'undefined' || !detailChartRef.current || !detailedViewOpen || !selectedFacility) return;
      try {
        if (detailChartInstance.current) {
          detailChartInstance.current.destroy();
          detailChartInstance.current = null;
        }
        const { default: Chart } = await import('chart.js/auto');
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!isMounted || !detailChartRef.current) return;
        const ctx = detailChartRef.current.getContext('2d');
        const facility = facilityData.month.find(f => f.name === selectedFacility);
        const chartConfig = {
          type: 'line',
          data: {
            labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM'],
            datasets: [
              {
                label: 'Weekday',
                data: [20, 35, 45, 40, 35, 30, 40, 50, 45, 40, 50, 60, 65, 70, 60, 40],
                borderColor: '#8884d8',
                backgroundColor: 'rgba(136, 132, 216, 0.2)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'Weekend',
                data: [10, 15, 25, 35, 50, 65, 70, 75, 80, 70, 60, 50, 45, 40, 30, 20],
                borderColor: '#ff8042',
                backgroundColor: 'rgba(255, 128, 66, 0.2)',
                tension: 0.4,
                fill: true
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { display: false }, title: { display: true, text: 'Hour of Day' } },
              y: {
                beginAtZero: true,
                max: 100,
                title: { display: true, text: 'Utilization %' },
                ticks: { callback: value => value + '%' },
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
              }
            },
            plugins: {
              annotation: {
                annotations: {
                  line1: {
                    type: 'line',
                    yMin: 90,
                    yMax: 90,
                    borderColor: 'red',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    label: { enabled: true, content: 'Critical (90%)', position: 'end' }
                  },
                  line2: {
                    type: 'line',
                    yMin: 70,
                    yMax: 70,
                    borderColor: 'orange',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    label: { enabled: true, content: 'High (70%)', position: 'end' }
                  },
                  line3: {
                    type: 'line',
                    yMin: 40,
                    yMax: 40,
                    borderColor: 'yellow',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    label: { enabled: true, content: 'Moderate (40%)', position: 'end' }
                  }
                }
              },
              title: {
                display: true,
                text: `${selectedFacility} - Daily Usage Patterns`,
                font: { size: 16 }
              },
              tooltip: {
                callbacks: {
                  label: context => {
                    const value = context.raw;
                    let status = 'Low';
                    if (value > 90) status = 'Critical';
                    else if (value > 70) status = 'High';
                    else if (value > 40) status = 'Moderate';
                    return `${context.dataset.label}: ${value}% (${status})`;
                  }
                }
              },
              legend: { position: 'bottom' }
            }
          }
        };
        detailChartInstance.current = new Chart(ctx, chartConfig);
      } catch (error) {
        console.error("Error initializing detail chart:", error);
      }
    };

    initializeDetailChart();
    return () => {
      isMounted = false;
      if (detailChartInstance.current) {
        detailChartInstance.current.destroy();
        detailChartInstance.current = null;
      }
    };
  }, [detailedViewOpen, selectedFacility, facilityData]);

  const handleRefresh = () => {
    setLastUpdated(new Date().toLocaleTimeString());
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
    setChartLoaded(false);
  };

  const handleFacilityDetailView = (facility) => {
    setSelectedFacility(facility);
    setDetailedViewOpen(true);
    const facilityDetails = facilityData.month.find(f => f.name === facility);
    setModalContent({
      title: facility,
      currentOccupancy: Math.round((facilityDetails.value / facilityDetails.capacity) * 100),
      capacity: facilityDetails.capacity,
      currentUsers: facilityDetails.value,
      peakHours: facilityDetails.peakHours.map(hour => `${hour}:00${hour >= 12 ? 'PM' : 'AM'}`).join(', '),
      lowHours: facilityDetails.lowHours.map(hour => `${hour}:00${hour >= 12 ? 'PM' : 'AM'}`).join(', '),
      color: facilityDetails.color,
      crowdedTimes: facilityData.crowdedTimes[facility.split(' ')[0].toLowerCase()],
    });
  };

  const closeDetailView = () => {
    setDetailedViewOpen(false);
    setSelectedFacility(null);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (percentage) => {
    if (percentage >= 90) return 'Critical';
    if (percentage >= 70) return 'High';
    if (percentage >= 40) return 'Moderate';
    return 'Low';
  };

  const getAlerts = () => {
    const alerts = [];
    facilityData.month.forEach(facility => {
      const utilization = Math.round((facility.value / facility.capacity) * 100);
      if (utilization >= 90) {
        alerts.push({
          type: 'critical',
          message: `${facility.name} is at ${utilization}% capacity (Critical)`,
          facility: facility.name
        });
      } else if (utilization >= 70) {
        alerts.push({
          type: 'warning',
          message: `${facility.name} is at ${utilization}% capacity (High)`,
          facility: facility.name
        });
      }
    });
    if (facilityData.predictions[0].gym >= 90) {
      alerts.push({
        type: 'warning',
        message: 'Gym is predicted to reach critical capacity today',
        facility: 'Gym'
      });
    }
    const today = new Date().getDay();
    if (today === 5) {
      alerts.push({
        type: 'info',
        message: 'High attendance expected this weekend. Consider booking in advance.',
        facility: 'All'
      });
    }
    return alerts;
  };

  const alerts = getAlerts();

  return (
    <div className="min-h-screen bg-gray-100">


      {/* Hero Section */}
      <header className="bg-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold">Welcome to the Staff Facility Capacity Dashboard</h1>
          <p className="mt-2 text-lg">Monitor, analyze, and manage facility usage in real time.</p>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto p-6">
  {/* Header section with filters and last updated */}
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
    <div>
      <h1 className="text-3xl font-bold text-black">Facility Capacity Dashboard</h1>
      <p className="text-sm text-gray-600">Real-time monitoring and analytics</p>
    </div>
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-4 md:mt-0">
      <div className="flex items-center">
        <span className="text-sm text-black mr-2">Last updated: {lastUpdated}</span>
        <button 
          onClick={handleRefresh} 
          className="flex items-center justify-center p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
          title="Refresh data"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      <div className="flex items-center bg-gray-100 rounded-md">
        <button 
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 text-sm rounded-md ${activeFilter === 'all' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
        >
          All
        </button>
        <button 
          onClick={() => setActiveFilter('busy')}
          className={`px-3 py-1 text-sm rounded-md ${activeFilter === 'busy' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
        >
          Busy Now
        </button>
        <button 
          onClick={() => setActiveFilter('available')}
          className={`px-3 py-1 text-sm rounded-md ${activeFilter === 'available' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
        >
          Available
        </button>
      </div>
      <div className="flex items-center bg-gray-100 rounded-md">
        <button 
          onClick={() => setTimeFilter('today')}
          className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'today' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
        >
          Today
        </button>
        <button 
          onClick={() => setTimeFilter('week')}
          className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'week' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
        >
          Week
        </button>
        <button 
          onClick={() => setTimeFilter('month')}
          className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'month' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
        >
          Month
        </button>
        <button 
          onClick={() => setTimeFilter('predictions')}
          className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'predictions' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
        >
          Forecast
        </button>
      </div>
    </div>
  </div>

  {/* Chart area */}
  <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
    <h2 className="text-xl font-semibold mb-4">
      {timeFilter === 'today' && "Today's Hourly Occupancy"}
      {timeFilter === 'week' && 'Weekly Utilization Trends'}
      {timeFilter === 'month' && 'Monthly Facility Utilization'}
      {timeFilter === 'predictions' && 'Forecasted Utilization (Next 7 Days)'}
    </h2>
    <div className="relative" style={{ minHeight: '300px' }}>
      {!chartLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center">
            <RefreshCw size={24} className="animate-spin mr-2 text-blue-500" />
            <span>Loading chart data...</span>
          </div>
        </div>
      )}
      <canvas ref={chartRef}></canvas>
    </div>
    <div className="mt-2 text-sm text-gray-600">
      {timeFilter === 'today' && (
        <p className="flex items-center">
          <Clock size={16} className="mr-1" /> 
          Prime time hours are typically 4PM-8PM on weekdays.
        </p>
      )}
      {timeFilter === 'week' && (
        <p className="flex items-center">
          <Calendar size={16} className="mr-1" /> 
          Weekends generally see 30% higher usage than weekdays.
        </p>
      )}
      {timeFilter === 'month' && (
        <p className="flex items-center">
          <TrendingUp size={16} className="mr-1" /> 
          Target utilization is 70-80% for optimal experience.
        </p>
      )}
      {timeFilter === 'predictions' && (
        <p className="flex items-center">
          <Zap size={16} className="mr-1" /> 
          Predictions based on historical data and current trends.
        </p>
      )}
    </div>
  </div>

  {/* Quick Status and Quick Stats Sections moved below the chart */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    {/* Facility Status (Quick Status) */}
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Activity size={18} className="mr-2" /> Current Status
      </h2>
      <div className="space-y-3">
        {facilityData.month.map((facility) => {
          const utilizationPercentage = Math.round((facility.value / facility.capacity) * 100);
          const statusColor = getStatusColor(utilizationPercentage);
          const statusText = getStatusText(utilizationPercentage);
          if (activeFilter === 'busy' && utilizationPercentage < 70) return null;
          if (activeFilter === 'available' && utilizationPercentage >= 70) return null;
          return (
            <div 
              key={facility.name}
              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
              onClick={() => handleFacilityDetailView(facility.name)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{facility.name}</h3>
                <div className={`text-xs px-2 py-1 rounded-full text-white ${statusColor}`}>
                  {statusText}
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{facility.value} users</span>
                  <span>{utilizationPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${statusColor}`}
                    style={{ width: `${utilizationPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Capacity: {facility.capacity}</span>
                <span className="flex items-center">
                  <Users size={12} className="mr-1" /> 
                  {facility.value}/{facility.capacity}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Quick Stats */}
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <BarChart2 size={18} className="mr-2" /> Quick Stats
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-gray-600">Total Visitors</div>
            <div className="text-xl font-semibold">2,450</div>
            <div className="text-xs text-green-600 flex items-center">
              <TrendingUp size={12} className="mr-1" /> +8% vs last week
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-xs text-gray-600">Avg. Utilization</div>
            <div className="text-xl font-semibold">76%</div>
            <div className="text-xs text-green-600 flex items-center">
              <TrendingUp size={12} className="mr-1" /> +5% vs last month
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="text-xs text-gray-600">Peak Time</div>
            <div className="text-xl font-semibold">6:00 PM</div>
            <div className="text-xs text-gray-600">Highest traffic time</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-xs text-gray-600">Busiest Facility</div>
            <div className="text-xl font-semibold">Gym</div>
            <div className="text-xs text-red-600 flex items-center">
              <AlertTriangle size={12} className="mr-1" /> 92% utilization
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Additional Actions (if needed) */}
  <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
    <h2 className="text-xl font-semibold mb-4 flex items-center">
      <Layers size={18} className="mr-2" /> Quick Actions
    </h2>
    <div className="space-y-2">
      <Link href="/booking" className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
        <span className="font-medium">Book a Facility</span>
        <ChevronDown size={16} className="transform -rotate-90" />
      </Link>
      <Link href="/reports" className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition">
        <span className="font-medium">View Reports</span>
        <ChevronDown size={16} className="transform -rotate-90" />
      </Link>
      <Link href="/settings" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
        <span className="font-medium">Notification Settings</span>
        <ChevronDown size={16} className="transform -rotate-90" />
      </Link>
    </div>
  </div>
</main>

      {/* Announcements & Updates Section */}
      <section className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Announcements & Updates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Maintenance Notice</h3>
            <p className="text-sm text-gray-600">The gym will be closed for maintenance on Saturday from 8AM to 2PM.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">New Booking Feature</h3>
            <p className="text-sm text-gray-600">You can now book multiple facilities at once. Try our new multi-booking option!</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Safety Guidelines</h3>
            <p className="text-sm text-gray-600">Remember to follow all safety protocols during your visit for a secure experience.</p>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <ul className="divide-y divide-gray-200">
            <li className="py-3">
              <p className="text-sm text-gray-700">John Doe booked the Gym at 5:30 PM today.</p>
              <p className="text-xs text-gray-500">5 minutes ago</p>
            </li>
            <li className="py-3">
              <p className="text-sm text-gray-700">Jane Smith viewed the Swimming Pool details.</p>
              <p className="text-xs text-gray-500">12 minutes ago</p>
            </li>
            <li className="py-3">
              <p className="text-sm text-gray-700">Alex Johnson booked the Tennis Courts for tomorrow.</p>
              <p className="text-xs text-gray-500">30 minutes ago</p>
            </li>
            <li className="py-3">
              <p className="text-sm text-gray-700">Emily Davis updated her booking for the Basketball Court.</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
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
