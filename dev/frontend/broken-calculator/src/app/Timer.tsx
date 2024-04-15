"use client"
import React, { useState, useEffect } from 'react';

function Timer(props: any) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    } else {
      console.log(interval)
      // clearInterval(interval);
      // toggleTimer();
    }

    return () => clearInterval(interval);
  }, [isActive]);



  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setSeconds(0);
    setIsActive(true);
  };

  const formatTime = (time: any) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="timer">
        <h1>{formatTime(seconds)}</h1>
        <div className="target-number bg-white p-4 rounded-md shadow-md">
          <h2 className="text-xl font-semibold mb-2">Target Number</h2>
          <span className="text-3xl font-bold text-blue-500">{props.target}</span>
        </div>
    </div>
  );
}

export default Timer;
