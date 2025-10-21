'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Loader2 } from 'lucide-react';

import Navbar from '../components/Navbar';

// Provided schedule information
const scheduleInfo = {
  "Monday-Thursday": "5:30 AM - 9:00 PM",
  "Friday": "5:30 AM - 8:00 PM",
  "Saturday-Sunday": "7:00 AM - 6:00 PM",
  "Holidays": "9:00 AM - 5:00 PM"
};

export default function ChatBotPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! I'm here to assist you with everything related to the City of Barrie, Peggy Hill Team Community Center. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Pre-determined options
  const options = [
    { question: 'Register for Activities', type: 'register' },
    { question: 'What is the schedule?', type: 'schedule' },
    { question: "What are today's hours?", type: 'hours' },
    { question: 'Tell me about the facility', type: 'facility' },
    { question: 'Other question', type: 'other' },
    { question: 'Forecast visitor count', type: 'forecast' }
  ];

  // Update the current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Determine today's operating schedule
  const getTodaySchedule = () => {
    const day = currentTime.getDay();
    if (day === 0 || day === 6) {
      return scheduleInfo["Saturday-Sunday"];
    } else if (day === 5) {
      return scheduleInfo["Friday"];
    }
    return scheduleInfo["Monday-Thursday"];
  };

  // Placeholder for predicted capacity
  const getPredictedCapacity = (hour) => {
    // Simple mock prediction based on hour
    if (hour >= 6 && hour <= 9) return Math.floor(Math.random() * 50) + 100;
    if (hour >= 12 && hour <= 14) return Math.floor(Math.random() * 40) + 80;
    if (hour >= 17 && hour <= 20) return Math.floor(Math.random() * 60) + 120;
    return Math.floor(Math.random() * 30) + 50;
  };

  // Simulate typing delay
  const simulateBotResponse = (response) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
      setIsTyping(false);
    }, 1000);
  };

  // Check if query matches predefined patterns
  const matchesPredefinedPattern = (text) => {
    const lowerText = text.toLowerCase();
    const keywords = ['register', 'schedule', 'hour', 'open', 'close', 'facility', 'forecast', 'visitor', 'predict'];
    return keywords.some(keyword => lowerText.includes(keyword));
  };

  // Generate responses for predefined queries
  const getResponse = (type, customText = '') => {
    switch (type) {
      case 'register':
        return 'You can register for our activities on the registration page. Simply click the "Register" button below to get started!';
      case 'schedule':
        return `Our full schedule is available online. Today's schedule is: ${getTodaySchedule()}. Would you like more details on any activity?`;
      case 'hours':
        return `Today, our facility operates from ${getTodaySchedule()}. If you need information about other days or holidays, just let me know!`;
      case 'facility':
        return 'The Peggy Hill Team Recreation Center offers a gym, swimming pool, fitness centre, and much more – all designed to meet your recreational needs.';
      case 'forecast': {
        if (!customText || customText.trim() === '') {
          return 'Could you please specify a time for the forecast? For example, you might say "morning", "afternoon", "evening", or provide a specific time.';
        }
        const lowerText = customText.toLowerCase();
  
        if (lowerText.includes('morning')) {
          return `In the morning, we expect about ${getPredictedCapacity(9)} visitors.`;
        } else if (lowerText.includes('afternoon')) {
          return `During the afternoon, approximately ${getPredictedCapacity(15)} visitors are anticipated.`;
        } else if (lowerText.includes('evening')) {
          return `In the evening, roughly ${getPredictedCapacity(19)} visitors should be here.`;
        } else if (lowerText.includes('now') || lowerText.includes('current')) {
          const currentHour = currentTime.getHours();
          return `Right now, we estimate about ${getPredictedCapacity(currentHour)} visitors at the centre.`;
        } else {
          const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.|a|p)?/i;
          const match = customText.match(timeRegex);
          if (match && match[1]) {
            let hour = parseInt(match[1], 10);
            const minutes = match[2] ? match[2] : "00";
            const meridiem = match[3] ? match[3].toLowerCase() : null;
  
            if (meridiem && (meridiem === 'pm' || meridiem === 'p.m.' || meridiem === 'p')) {
              if (hour !== 12) hour += 12;
            } else if (meridiem && (meridiem === 'am' || meridiem === 'a.m.' || meridiem === 'a')) {
              if (hour === 12) hour = 0;
            } else {
              if (hour < 6) hour += 12;
            }
  
            const predicted = getPredictedCapacity(hour);
            const displayTime = meridiem ? match[0] : `${hour}:${minutes}`;
            return `Our forecast predicts about ${predicted} visitors at ${displayTime}.`;
          } else {
            return "I'm sorry, I didn't catch the time. Could you please specify a valid time (for example, 'morning' or '6pm')?";
          }
        }
      }
      case 'other':
        if (customText.toLowerCase().includes('open')) {
          return `Today, we open at ${getTodaySchedule().split(' - ')[0]}.`;
        } else if (customText.toLowerCase().includes('close')) {
          return `Today, we close at ${getTodaySchedule().split(' - ')[1]}.`;
        }
        return null; // Will trigger Gemini call
      default:
        return null; // Will trigger Gemini call
    }
  };

  // Call Gemini API for non-predefined queries
  const callGeminiAPI = async (userMessage) => {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Gemini');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
    }
  };

  // Handle quick option button clicks
  const handleOptionClick = (option) => {
    setMessages(prev => [...prev, { sender: 'user', text: option.question }]);
    const response = getResponse(option.type);
    simulateBotResponse(response);
  };

  // Handle custom text input submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const userText = inputValue.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputValue('');

    // Determine the type based on keywords
    let type = 'other';
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('register')) type = 'register';
    else if (lowerText.includes('schedule')) type = 'schedule';
    else if (lowerText.includes('hour') || lowerText.includes('open') || lowerText.includes('close')) type = 'hours';
    else if (lowerText.includes('facility')) type = 'facility';
    else if (lowerText.includes('forecast') || lowerText.includes('visitor') || lowerText.includes('predict')) type = 'forecast';

    const response = getResponse(type, userText);

    // If no predefined response, use Gemini
    if (response === null && !matchesPredefinedPattern(userText)) {
      setIsTyping(true);
      const geminiResponse = await callGeminiAPI(userText);
      setMessages(prev => [...prev, { sender: 'bot', text: geminiResponse }]);
      setIsTyping(false);
    } else {
      simulateBotResponse(response || "Could you please provide more details about your question?");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4">
      <Navbar />
      <header className="bg-blue-700 text-white p-4 rounded-lg mb-4">
        <h1 className="text-2xl font-bold">Barrie Recreation Center ChatBot</h1>
        <p className="mt-1 text-sm">Ask about registration, schedule, hours, and more!</p>
      </header>
      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-white rounded-lg shadow">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
            <div className={`inline-block p-2 rounded ${msg.sender === 'bot' ? 'bg-blue-100 text-blue-900' : 'bg-green-100 text-green-900'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start mb-2">
            <div className="inline-block p-2 rounded bg-blue-100 text-blue-900 flex items-center">
              <Loader2 className="animate-spin mr-2" size={16} /> Typing...
            </div>
          </div>
        )}
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Quick Options</h2>
        <div className="grid grid-cols-2 gap-2">
          {options.map((option, index) => (
            <button key={index} onClick={() => handleOptionClick(option)} className="p-3 bg-gray-200 rounded hover:bg-gray-300 text-sm">
              {option.question}
            </button>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex items-center mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 p-3 rounded-l border border-gray-300 focus:outline-none"
        />
        <button type="submit" className="bg-blue-700 text-white p-3 rounded-r hover:bg-blue-800">
          Send
        </button>
      </form>
      <div className="flex justify-around">
        <Link href="/register" className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
          Register
        </Link>
        <Link href="/schedule" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          View Schedule
        </Link>
      </div>
    </div>
  );
}