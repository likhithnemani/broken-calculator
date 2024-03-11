"use client"
import React, { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    } else {
      clearInterval(interval);
      toggleTimer();
    }

    return () => clearInterval(interval);
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setSeconds(0);
    setIsActive(false);
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
    </div>
  );
}

export default Timer;
