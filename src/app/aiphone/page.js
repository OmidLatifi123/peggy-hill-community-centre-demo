'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Phone, Loader2, Mic } from 'lucide-react';

import Navbar from '../components/Navbar';

export default function AiphonePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello, this is the AI Phone Agent. How may I assist you today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [synthVolume, setSynthVolume] = useState(0);
  const [currentCapacity, setCurrentCapacity] = useState({ current: 0, max: 1200 });
  const recognitionRef = useRef(null);
  const volumeIntervalRef = useRef(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Setup speech recognition if available
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserMessage(transcript);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  // Update current capacity whenever currentTime changes.
  useEffect(() => {
    updateCurrentCapacity();
  }, [currentTime]);

  // Function to update current capacity based on the current time.
  const updateCurrentCapacity = () => {
    const day = currentTime.getDay(); // 0: Sunday, 6: Saturday
    let openingHour;
    if (day === 0 || day === 6) {
      openingHour = 7;
    } else if (day === 5) {
      openingHour = 5.5; // 5:30 AM
    } else {
      openingHour = 5.5;
    }
    const currentHourDecimal = currentTime.getHours() + currentTime.getMinutes() / 60;
    let visitors;
    if (currentHourDecimal < 10) {
      visitors = Math.floor(180 + (currentHourDecimal - openingHour) * 30);
    } else if (currentHourDecimal < 14) {
      visitors = Math.floor(600 + (currentHourDecimal - 10) * 35);
    } else if (currentHourDecimal < 17) {
      visitors = Math.floor(880 + (currentHourDecimal - 14) * 15);
    } else {
      visitors = Math.floor(750 - (currentHourDecimal - 17) * 25);
    }
    visitors = Math.min(visitors, 1200);
    setCurrentCapacity({ current: visitors, max: 1200 });
  };

  // Function to calculate predicted capacity for a given hour (in 24-hour format)
  const getPredictedCapacity = (hour) => {
    const day = currentTime.getDay();
    let openingHour;
    if (day === 0 || day === 6) {
      openingHour = 7;
    } else if (day === 5) {
      openingHour = 5.5;
    } else {
      openingHour = 5.5;
    }
    let visitors;
    if (hour < 10) {
      visitors = Math.floor(180 + (hour - openingHour) * 30);
    } else if (hour < 14) {
      visitors = Math.floor(600 + (hour - 10) * 35);
    } else if (hour < 17) {
      visitors = Math.floor(880 + (hour - 14) * 15);
    } else {
      visitors = Math.floor(750 - (hour - 17) * 25);
    }
    return Math.min(visitors, 1200);
  };

  // Check if query matches predefined patterns
  const matchesPredefinedPattern = (text) => {
    const lowerText = text.toLowerCase();
    const keywords = [
      'register', 'schedule', 'facility', 'open', 'close', 'hour',
      'current', 'people', 'how many', 'maximum', 'max', 'capacity',
      'predict', 'forecast', 'expected', 'estimate', 'visitor'
    ];
    return keywords.some(keyword => lowerText.includes(keyword));
  };

  // Get predefined response for known queries
  const getResponse = (userText) => {
    const lowerText = userText.toLowerCase();
  
    if (lowerText.includes('register')) {
      return 'You can sign up for our activities on our registration page. We would love to have you join us at the centre!';
    } else if (lowerText.includes('schedule')) {
      return 'Our complete schedule is available online. Today, our Peggy Hill Team Community Centre is open from 5:30 AM to 9:00 PM on weekdays, 5:30 AM to 8:00 PM on Friday, and 7:00 AM to 6:00 PM on weekends.';
    } else if (lowerText.includes('facility')) {
      return 'At our community centre, you can enjoy a range of facilities including a gym, basketball court, and pool, among many others. Check our website for the full list!';
    } else if (lowerText.includes('open') || lowerText.includes('close') || lowerText.includes('hour')) {
      const day = currentTime.getDay();
      let schedule = '';
      if (day === 0 || day === 6) {
        schedule = '7:00 AM to 6:00 PM';
      } else if (day === 5) {
        schedule = '5:30 AM to 8:00 PM';
      } else {
        schedule = '5:30 AM to 9:00 PM';
      }
      return `Today, our doors are open from ${schedule}. We look forward to welcoming you!`;
    } else if ((lowerText.includes("current") && lowerText.includes("people")) || lowerText.includes("how many")) {
      return `Right now, there are about ${currentCapacity.current} visitors at the centre, with a maximum capacity of ${currentCapacity.max} people.`;
    } else if (lowerText.includes("maximum capacity") || lowerText.includes("max capacity")) {
      return `Our facility can accommodate up to ${currentCapacity.max} people.`;
    } else if (lowerText.includes('predict') || lowerText.includes('forecast') || lowerText.includes('expected') || lowerText.includes('estimate')) {
      const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.|a|p)?/i;
      const match = userText.match(timeRegex);
      
      if (match && match[1]) {
        let hour = parseInt(match[1], 10);
        const minutes = match[2] ? match[2] : "00";
        const meridiem = match[3] ? match[3].toLowerCase() : null;
        
        if (meridiem && (meridiem === 'pm' || meridiem === 'p.m.' || meridiem === 'p')) {
          if (hour !== 12) hour += 12;
        } else if (meridiem && (meridiem === 'am' || meridiem === 'a.m.' || meridiem === 'a')) {
          if (hour === 12) hour = 0;
        } else {
          if (hour < 6) {
            hour += 12;
          }
        }
        
        const predicted = getPredictedCapacity(hour);
        const timeDisplay = meridiem ? `${match[0]}` : `${hour}:${minutes}`;
        return `We expect around ${predicted} visitors at ${timeDisplay}.`;
      } else {
        if (lowerText.includes('morning')) {
          return `In the morning, we anticipate about ${getPredictedCapacity(9)} visitors.`;
        } else if (lowerText.includes('afternoon')) {
          return `During the afternoon, there should be approximately ${getPredictedCapacity(15)} visitors.`;
        } else if (lowerText.includes('evening')) {
          return `In the evening, roughly ${getPredictedCapacity(19)} people are expected.`;
        } else if (lowerText.includes('night')) {
          return `At night, we expect about ${getPredictedCapacity(20)} visitors.`;
        } else if (lowerText.includes('now') || lowerText.includes('current')) {
          const currentHour = currentTime.getHours();
          return `Right now, we predict about ${getPredictedCapacity(currentHour)} visitors are at the centre.`;
        } else {
          return "Could you please specify a time for the prediction? For example, you could say 'morning', 'afternoon', 'evening', or mention a specific time.";
        }
      }
    }
    
    // Return null if no predefined response matches
    return null;
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

  const simulateBotResponse = async (responseText, isAsync = false) => {
    setIsTyping(true);
    
    if (isAsync) {
      // For async Gemini responses, we're already in an async context
      const response = await responseText;
      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
      speakResponse(response);
      setIsTyping(false);
    } else {
      // For predefined responses
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'bot', text: responseText }]);
        speakResponse(responseText);
        setIsTyping(false);
      }, 1000);
    }
  };

  const speakResponse = (response) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.rate = 1;
      utterance.onstart = startVolumeAnimation;
      utterance.onend = stopVolumeAnimation;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVolumeAnimation = () => {
    volumeIntervalRef.current = setInterval(() => {
      setSynthVolume(Math.random());
    }, 150);
  };

  const stopVolumeAnimation = () => {
    clearInterval(volumeIntervalRef.current);
    setSynthVolume(0);
  };

  const handleUserMessage = async (text) => {
    setMessages(prev => [...prev, { sender: 'user', text }]);
    
    // Try to get predefined response first
    const predefinedResponse = getResponse(text);
    
    if (predefinedResponse) {
      // Use predefined response
      simulateBotResponse(predefinedResponse, false);
    } else if (!matchesPredefinedPattern(text)) {
      // Use Gemini for non-predefined queries
      setIsTyping(true);
      const geminiResponse = await callGeminiAPI(text);
      setMessages(prev => [...prev, { sender: 'bot', text: geminiResponse }]);
      speakResponse(geminiResponse);
      setIsTyping(false);
    } else {
      // Fallback for edge cases
      simulateBotResponse("I'm here to help! Could you please clarify your question so I can provide the best answer?", false);
    }
  };

  const handleMicClick = () => {
    if (recognitionRef.current) {
      if (!isListening) {
        setIsListening(true);
        recognitionRef.current.start();
      } else {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col p-4">
      {/* Header */}
      <Navbar />
      <header className="bg-blue-800 text-white p-4 rounded-lg mb-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <Phone size={28} />
          <h1 className="text-2xl font-bold">AI Phone Agent</h1>
        </div>
        <span className="text-sm">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </header>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-white rounded-lg shadow-lg">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs break-words inline-block p-3 rounded-lg ${msg.sender === 'bot' ? 'bg-blue-100 text-blue-900' : 'bg-green-100 text-green-900'}`}>
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

      {/* Reactive Volume Ball */}
      <div className="flex justify-center mb-4">
        <div 
          className="rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-xl"
          style={{
            width: `${40 + synthVolume * 50}px`,
            height: `${40 + synthVolume * 50}px`,
            transition: 'width 0.15s, height 0.15s'
          }}
        ></div>
      </div>

      {/* Mic Button */}
      <div className="flex justify-center mb-4">
        <button 
          onClick={handleMicClick} 
          className={`p-4 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none transition duration-200 ${isListening ? 'ring-4 ring-red-300' : ''}`}
        >
          <Mic size={28} />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex justify-around">
        <Link href="/register" className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-200">
          Register
        </Link>
        <Link href="/schedule" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200">
          View Schedule
        </Link>
      </div>
    </div>
  );
}