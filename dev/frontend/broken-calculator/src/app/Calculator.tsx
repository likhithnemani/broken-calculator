"use client"
import { useGoogleOneTapLogin } from '@react-oauth/google';
import React, { useState, useEffect } from 'react';

const Calculator = () => {
    const [showOperators, setShowOperators] = useState(true);
    const [res, setRes] = useState('');
    const [numberStates, setNumberStates] = useState(Array(14).fill(true));

    const toggleOperators = () => {
        setShowOperators(!showOperators);
    };

    useEffect(() => {
        const toggleRandomNumberStates = () => {
            const newNumberStates = numberStates.map((value, index) => {
                let t = Math.random();
                return t < 0.5 ? !value : value;
            });
            setNumberStates(newNumberStates);
        };

        toggleRandomNumberStates();
    }, []);

    const appendToString = (number: any) => {
        setRes(prevRes => prevRes + number + "");
    }

    const numberButtons = [];
    for (let i = 1; i <= 9; i++) {
        numberButtons.push(
            <button key={i} className="calculator__key" onClick={() => appendToString(i)} style={{ opacity: numberStates[i] ? 1 : 0 }}>{i}</button>
        );
    }

    const evaluate = () => {
        try {
            var ans = eval(res);
            setRes(prev => ans + "");
        }
        catch(err) {
            setRes(prev => "Error");
        }
    }

    useGoogleOneTapLogin({
        onSuccess: credentialResponse => {
            console.log(credentialResponse);
            // Handle success
        },
        onError: () => {
            console.log('Login Failed');
            // Handle error
        },
    });

    return (
        <div className="calculator">
            <div className="calculator__output">{res}</div>
            <div className="calculator__keys">
                <button className="calculator__key calculator__key--operator" onClick={() => appendToString('+')} style={{ opacity: numberStates[10] ? 1 : 0 }}>+</button>
                <button className="calculator__key calculator__key--operator" onClick={() => appendToString('-')} style={{ opacity: numberStates[11] ? 1 : 0 }}>-</button>
                <button className="calculator__key calculator__key--operator" onClick={() => appendToString('*')} style={{ opacity: numberStates[12] ? 1 : 0 }}>&times;</button>
                <button className="calculator__key calculator__key--operator" onClick={() => appendToString('/')} style={{ opacity: numberStates[13] ? 1 : 0 }}>÷</button>
                {numberButtons}
                <button className="calculator__key" onClick={() => appendToString('.')}>.</button>
                <button className="calculator__key" onClick={() => appendToString(0)} style={{ opacity: numberStates[0] ? 1 : 0 }}>0</button>
                <button className="calculator__key" onClick={() => setRes(prev => "")}>AC</button>
                <button className="calculator__key calculator__key--enter" onClick={() => evaluate()}>=</button>
            </div>
        </div>
    );
};

export default Calculator;
