'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import Navbar from '../components/Navbar';


const events = [
  {
    id: 1,
    name: 'Family Swim',
    start: '07:00',
    end: '08:30',
    capacity: 50,
    registered: 25,
    description: 'Fun swimming time for the whole family. All ages welcome.',
    location: 'Main Pool',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'Senior Yoga',
    start: '08:30',
    end: '09:30',
    capacity: 30,
    registered: 15,
    description: 'Gentle yoga session designed for seniors and beginners.',
    location: 'Studio 1',
    color: 'bg-green-500'
  },
  {
    id: 3,
    name: 'Basketball Tournament',
    start: '10:00',
    end: '12:00',
    capacity: 100,
    registered: 60,
    description: 'Competitive basketball tournament for teens and adults.',
    location: 'Main Court',
    color: 'bg-orange-500'
  },
  {
    id: 4,
    name: 'Swimming Lessons',
    start: '13:00',
    end: '14:30',
    capacity: 40,
    registered: 35,
    description: 'Swimming lessons for beginners to intermediate swimmers.',
    location: 'Training Pool',
    color: 'bg-cyan-500'
  },
  {
    id: 5,
    name: 'Fitness Bootcamp',
    start: '15:00',
    end: '16:30',
    capacity: 30,
    registered: 20,
    description: 'High-intensity interval training for all fitness levels.',
    location: 'Fitness Studio',
    color: 'bg-red-500'
  },
];

// Generate half-hour time slots between two HH:MM times.
const generateTimeSlots = (startTime, endTime) => {
  let slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  let current = new Date();
  current.setHours(startHour, startMinute, 0, 0);
  const end = new Date();
  end.setHours(endHour, endMinute, 0, 0);
  while (current < end) {
    const h = current.getHours().toString().padStart(2, '0');
    const m = current.getMinutes().toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current = new Date(current.getTime() + 30 * 60000);
  }
  return slots;
};

// Format time to 12-hour format with AM/PM
const formatTime = (time24h) => {
  const [hour, minute] = time24h.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
};

// Function to send confirmation email
const sendConfirmationEmail = async (userData, event) => {
  try {
    // In a real application, we would use an API endpoint or email service
    // For now, we'll simulate sending an email
    const emailContent = {
      to: userData.email,
      subject: `Registration Confirmation: ${event.name}`,
      body: `
        Dear ${userData.fullName},

        Thank you for registering for ${event.name}!

        Event Details:
        - Date: ${new Date().toLocaleDateString()}
        - Time: ${formatTime(event.start)} - ${formatTime(event.end)}
        - Location: ${event.location}

        Please arrive 15 minutes before the start time. Don't forget to bring appropriate attire and equipment.

        If you need to cancel or reschedule, please contact us at (705) 792-1234 at least 24 hours in advance.

        We look forward to seeing you!

        Sincerely,
        Orillia Recreation Center
        123 Lake Shore Drive
        Orillia, ON L3V 6H2
        (705) 792-1234
      `
    };

    console.log('Email sent:', emailContent);
    
    // In a real application, we would call an API endpoint here
    // For example:
    // await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(emailContent)
    // });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export default function CalendarRegistrationPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    eventId: ''
  });
  const [isRegistrationSuccessful, setIsRegistrationSuccessful] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For simplicity, define overall calendar boundaries.
  const calendarStart = '07:00';
  const calendarEnd = '17:00';
  const timeSlots = generateTimeSlots(calendarStart, calendarEnd);

  // Check if a given slot is within an event's time range.
  const getEventSlotInfo = (event, slot) => {
    const [slotHour, slotMinute] = slot.split(':').map(Number);
    const [startHour, startMinute] = event.start.split(':').map(Number);
    const [endHour, endMinute] = event.end.split(':').map(Number);
    const slotTime = slotHour * 60 + slotMinute;
    const eventStart = startHour * 60 + startMinute;
    const eventEnd = endHour * 60 + endMinute;
    if (slotTime >= eventStart && slotTime < eventEnd) {
      const percent = Math.round((event.registered / event.capacity) * 100);
      let statusClass = 'text-green-600';
      if (percent >= 90) {
        statusClass = 'text-red-600';
      } else if (percent >= 70) {
        statusClass = 'text-orange-500';
      }
      return { percent, statusClass, isStart: slotTime === eventStart };
    }
    return null;
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setFormData({
      ...formData,
      eventId: event.id.toString()
    });
    
    // Scroll to registration form
    document.getElementById('registration-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Update selectedEvent if eventId changes
    if (name === 'eventId' && value) {
      const event = events.find(ev => ev.id.toString() === value);
      setSelectedEvent(event);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.eventId) {
      alert('Please select an event to register for.');
      return;
    }
    
    // Get the selected event data
    const event = events.find(ev => ev.id.toString() === formData.eventId);
    
    if (!event) {
      alert('Invalid event selection.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Handle form submission logic
      console.log('Form submitted:', formData);
      
      // Send confirmation email
      const emailSuccess = await sendConfirmationEmail(formData, event);
      setEmailSent(emailSuccess);
      
      // Update UI state
      setIsRegistrationSuccessful(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setIsRegistrationSuccessful(false);
        setEmailSent(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          eventId: ''
        });
        setSelectedEvent(null);
      }, 5000);
    } catch (error) {
      console.error('Registration error:', error);
      alert('There was an error processing your registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
      <header className="bg-blue-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <div className="mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M9 16h6M5 8h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">City of Orillia Recreation Center</h1>
            <p className="text-blue-100">Program Registration Portal</p>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Today&apos;s Schedule</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b-2 border-gray-200 bg-gray-100 p-3 text-left font-semibold text-gray-600">Time</th>
                  <th className="border-b-2 border-gray-200 bg-gray-100 p-3 text-left font-semibold text-gray-600">Event</th>
                  <th className="border-b-2 border-gray-200 bg-gray-100 p-3 text-left font-semibold text-gray-600">Location</th>
                  <th className="border-b-2 border-gray-200 bg-gray-100 p-3 text-left font-semibold text-gray-600">Capacity</th>
                  <th className="border-b-2 border-gray-200 bg-gray-100 p-3 text-left font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="border-b border-gray-200 p-3 text-gray-700">
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </td>
                    <td className="border-b border-gray-200 p-3">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${event.color} mr-2`}></div>
                        <div>
                          <div className="font-medium text-gray-900">{event.name}</div>
                          <div className="text-sm text-gray-500">{event.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-gray-200 p-3 text-gray-700">{event.location}</td>
                    <td className="border-b border-gray-200 p-3">
                      <div className="flex flex-col">
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div 
                            className={`h-2 rounded-full ${event.color}`} 
                            style={{ width: `${Math.round((event.registered / event.capacity) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {event.registered}/{event.capacity} spots filled
                        </span>
                      </div>
                    </td>
                    <td className="border-b border-gray-200 p-3">
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm transition duration-200"
                        onClick={() => handleEventSelect(event)}
                      >
                        Register
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Daily Calendar View</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left font-medium text-gray-600">Time</th>
                  {events.map((ev) => (
                    <th key={ev.id} className="border p-2 text-center font-medium">
                      <div className={`${ev.color} text-white py-1 px-2 rounded`}>
                        {ev.name}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        {formatTime(ev.start)} - {formatTime(ev.end)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border p-2 text-left font-medium">{formatTime(slot)}</td>
                    {events.map((ev) => {
                      const info = getEventSlotInfo(ev, slot);
                      return (
                        <td key={ev.id} className="border p-2 text-center">
                          {info ? (
                            <div>
                              {info.isStart && (
                                <div className="text-xs mb-1">{ev.name}</div>
                              )}
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div
                                  className={`h-2 rounded-full ${ev.color}`}
                                  style={{ width: `${info.percent}%` }}
                                ></div>
                              </div>
                              <span className={`text-xs ${info.statusClass}`}>
                                {info.percent}% Full
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Registration Form */}
        <div id="registration-form" className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Program Registration</h2>
          
          {isRegistrationSuccessful ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Your registration has been submitted. 
                {emailSent ? ' A confirmation email has been sent to your email address.' : ' Please check your email for confirmation.'}
              </span>
            </div>
          ) : (
            <>
              {selectedEvent ? (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800">Selected Program:</h3>
                  <div className="flex items-center mt-2">
                    <div className={`w-3 h-3 rounded-full ${selectedEvent.color} mr-2`}></div>
                    <span className="font-medium">{selectedEvent.name}</span>
                    <span className="mx-2 text-gray-500">|</span>
                    <span>{formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}</span>
                    <span className="mx-2 text-gray-500">|</span>
                    <span>{selectedEvent.location}</span>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100 text-yellow-700">
                  Please select a program from the schedule above to register.
                </div>
              )}
              
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500" 
                      required 
                    />
                    <p className="text-xs text-gray-500 mt-1">A confirmation email will be sent to this address.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
                    <select 
                      name="eventId"
                      value={formData.eventId}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500" 
                      required
                    >
                      <option value="">-- Select an event --</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.name} ({formatTime(ev.start)} - {formatTime(ev.end)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition duration-200 disabled:bg-gray-400"
                    disabled={isSubmitting || (!selectedEvent && !formData.eventId)}
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Registration'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
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
}