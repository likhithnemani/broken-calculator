// pages/leaderboard.js
"use client"
import { GoogleLogin } from '@react-oauth/google';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Leaderboard() {

  const [login, setLogin] = useState<JwtPayload>();
  const [loginStatus, setLoginStatus] = useState<boolean>(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [level, setLevel] = useState("easy");


  useEffect(() => {
    leaderboard();
  }, [])


  async function leaderboard(_level: any = level) {
    const resp = await fetch(`http://localhost:4000/leaderboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
      body: JSON.stringify({
        "level": _level
      }),
      cache: 'no-cache',
      mode: 'cors'
    });
    const data = await resp.json();
    console.log(data)
    setLeaderboardData(data.leaderboard)
  }

  const logout = () => {
    localStorage.removeItem("loginStatus");
    localStorage.removeItem("login");
    localStorage.removeItem("auth-token");
    setLoginStatus(false)
  }

  const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLevel(event.target.value);
    leaderboard(event.target.value);
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center w-screen min-h-screen py-10">
        <h1 className="text-xl text-gray-900 font-bold py-4" style={{fontSize: '30px'}}>Leaderboard</h1>
        <select className="bg-white border border-gray-300 rounded-md px-4 py-2" value={level} onChange={handleLevelChange} >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
        <div className="flex flex-col mt-6">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full text-sm text-gray-400">
                  <thead className="bg-gray-800 text-xs uppercase font-medium">
                    <tr>
                      <th></th>
                      <th scope="col" className="px-6 py-3 text-left tracking-wider">
                        Profile
                      </th>
                      <th scope="col" className="px-6 py-3 text-left tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left tracking-wider">
                        Level
                      </th>
                      <th scope="col" className="px-6 py-3 text-left tracking-wider">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800">
                    {leaderboardData && leaderboardData.map((data: any, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-black bg-opacity-20' : ''}>
                        <td className="pl-4">{index + 1}</td>
                        <td className="flex px-6 py-4 whitespace-nowrap">
                          <img className="w-5 h-5 rounded-full" src={data?.profile_pic} alt="" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{data?.user_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{data?.level}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{data?.duration} seconds</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
