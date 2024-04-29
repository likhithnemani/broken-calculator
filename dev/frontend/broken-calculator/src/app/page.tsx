'use client'

import Image from "next/image";
import Calculator from "./Calculator";
import Document, { Html, Head, Main, NextScript } from 'next/document';
import Timer from "./Timer";
import { useEffect, useState, Fragment } from 'react';
import { JwtPayload, jwtDecode } from "jwt-decode";
import { GoogleLogin } from '@react-oauth/google';
import { Dialog, Transition } from '@headlessui/react'
import Leaderboard from "./leaderboard/page";
import Link from "next/link";


export default function Home() {

  const [login, setLogin] = useState<JwtPayload>();
  const [loginStatus, setLoginStatus] = useState<boolean>(false);
  const [level, setLevel] = useState("");
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  let [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState(24);
  const [numbers, setNumbers] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [operators, setOperators] = useState(['+', '-', '*', '/']);
  const [solution, setSolution] = useState("");
  const [timerStatus, setTimerStatus] = useState<boolean>(false);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [solutionReveal, setSolutionReveal] = useState(false);


  useEffect(() => {
    let login = localStorage.getItem("login");
    if (login) {
      loginToBackend();
    }
    let status = localStorage?.getItem("loginStatus");
    if (status) {
      setLoginStatus(true)
    }
  }, [])

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  async function loginToBackend() {
    const resp = await fetch(`https://broken-calculator.ddns.net/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
        'auth-token': localStorage.getItem('auth-token') || ""
      },
      cache: 'no-cache',
      mode: 'cors'
    });
    const data = await resp.json();
    console.log(data)
    if (data.data) {
      localStorage.setItem("loginStatus", "true")
      setLoginStatus(true)
    }
  }

  async function getTargetNumber() {
    const resp = await fetch(`https://broken-calculator.ddns.net/target`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
      body: JSON.stringify({
        'level': level
      }),
      cache: 'no-cache',
      mode: 'cors'
    });
    const data = await resp.json();
    console.log(data)
    setNumbers(data.numbers)
    setTarget(data.target)
    console.log(target)
    setOperators(data.operators)
    setTimerStatus(true);
    setIsGameStarted(true);
    setSolution(data.expression)
    setIsActive(true);
  }

  const logout = () => {
    localStorage.removeItem("loginStatus");
    localStorage.removeItem("login");
    localStorage.removeItem("auth-token");
    setLoginStatus(false)
  }

  async function closeModal() {
    setIsOpen(false)
    setIsActive(false)
    setIsGameStarted(false)
    setSolutionReveal(false)
    setSeconds(0)
  }

  function openModal() {
    setIsOpen(true)
  }

  const onAnswerSolved = async (resp: any) => {
    openModal();
    console.log("Login Status = ", loginStatus)
    if (loginStatus) {
      const resp = await fetch(`https://broken-calculator.ddns.net/savegame`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
          'auth-token': localStorage.getItem('auth-token') || ""
        },
        body: JSON.stringify({
          'level': level,
          'solved': true,
          'duration': seconds
        }),
        cache: 'no-cache',
        mode: 'cors'
      });
      const data = await resp.json();
      console.log(data)
    }
    console.log(seconds);
    setIsActive(false);
  }

  const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLevel(event.target.value);
  }

  const startGame = () => {
    getTargetNumber();
    // setIsOpen(true)
  }


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
    <div>
      {!isGameStarted && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-lg mx-auto shadow-lg bg-white rounded-lg overflow-hidden">
            <div className="p-4">
              <h1 className="text-2xl font-semibold mb-4">Instructions</h1>
              <ul className="my-4">
                <li>&bull; Welcome to broken calculator !</li>
                <li>&bull; Have an eye on the timer as fastest solver will be displayed in leaderboard</li>
                <li>&bull; Click on Google button at the top to save the progress before starting the game</li>
                <li>&bull; Select one of level from the dropdown and the available options are easy, medium and hard</li>
                <li>&bull; Click on play to start the game</li>
              </ul>
              <div className="flex items-center mb-4 justify-center">
                <select className="bg-white border border-gray-300 rounded-md px-4 py-2 mr-4" value={level} onChange={handleLevelChange} >
                  <option value="" disabled>Select level</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition-colors" disabled={level === ""} onClick={() => startGame()}>
                  Play
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isGameStarted && (
        <div className="flex justify-center items-center h-screen">
          <div className="grid grid-cols-2 gap-2">
            <Calculator numbers={numbers} operators={operators} target={target} onSolved={onAnswerSolved} />
            <div className="timer">
              <h1>{formatTime(seconds)}</h1>
              <div className="target-number bg-white p-4 rounded-md shadow-md">
                <h2 className="text-xl font-semibold mb-2">Target Number</h2>
                <span className="text-3xl font-bold text-blue-500">{target}</span>
              </div>
              <button className="bg-red-500 text-white px-4 py-2 my-4 rounded-md shadow-md hover:bg-red-600 transition-colors" disabled={level === ""} onClick={() => {
                setSolutionReveal(true)
                openModal()
              }}>
                  Reveal
              </button>
            </div>
          </div>
        </div>
      )
      }


      {/* <div className="grid grid-cols-2 gap-2">
        <Calculator />
        <Timer />
      </div> */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {solutionReveal ? (<span>Solution Reveal</span>) : (<span>Calculated Successfully</span>)} 
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {solutionReveal ? (<span>{solution} = {target}</span>) : (<span> You have successfully calculated the target number in {seconds} seconds.</span>)}
                     
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Home
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
