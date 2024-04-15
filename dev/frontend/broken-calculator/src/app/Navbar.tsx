"use client"

import { GoogleLogin } from "@react-oauth/google";
import { JwtPayload, jwtDecode } from "jwt-decode";
import Link from "next/link";
import { useEffect, useState } from "react";

const navbar = () => {

    const [login, setLogin] = useState<JwtPayload>();
    const [loginStatus, setLoginStatus] = useState<boolean>(false);

    useEffect(() => {
       let status = localStorage.getItem("loginStatus");
       if (status) {
        setLoginStatus(true);
       }
      }, [])

    async function loginToBackend() {
        const resp = await fetch(`http://localhost:4000/login`, {
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

    const logout = () => {
        localStorage.removeItem("loginStatus");
        localStorage.removeItem("login");
        localStorage.removeItem("auth-token");
        setLoginStatus(false)
    }


    return (
        <div>
            <nav className="bg-gray-800 p-4 fixed top-0 left-0 right-0 z-10">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center">
                        <svg className="w-8 h-8 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM4 10a6 6 0 1112 0 6 6 0 01-12 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-white font-semibold text-lg">Broken Calculator</span>
                    </div>

                    {/* Login Button */}
                    {loginStatus ? (
                        <div>
                            {/* Navigation links for logged-in users */}
                            <ul className="flex items-center">
                                <li className="text-white mr-4"><Link href='/'>Home</Link></li>
                                <li className="text-white mr-4"><Link href='/leaderboard' >Leaderboard</Link></li>
                                <li className="text-white mr-4" onClick={() => logout()}>Logout</li>
                            </ul>
                        </div>
                    ) : (
                        <GoogleLogin shape="pill" type="icon" onSuccess={credentialResponse => {
                            if (credentialResponse.credential) {
                                const decodedToken = jwtDecode(credentialResponse.credential);
                                localStorage.setItem("auth-token", credentialResponse.credential);
                                setLogin(decodedToken);
                                loginToBackend();
                            }
                        }}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                        />
                    )}
                </div>
            </nav>
        </div>
    );
}

export default navbar;