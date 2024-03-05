'use client'

import { useState } from 'react';
import styles from './styles.module.css';
import { GoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';



const Calculator = () => {
    const [showOperators, setShowOperators] = useState(true);

    const toggleOperators = () => {
        setShowOperators(!showOperators);
    };

    const toggleIndexState = (array: any, index: number) => {
        return array.map((value: number, i: number) => (i === index ? !value : value));
    };

    var numberStates = Array.from({ length: 14 }, () => true);

    for (let i = 0; i < 14; i++) {
        let t = Math.random();
        if (t < 0.5) {
            numberStates = toggleIndexState(numberStates, i);
        }
    }

    for (let i = 0; i < 4; i++) {

    }

    const numberButtons = [];
    for (let i = 1; i <= 9; i++) {
      numberButtons.push(
        <button key={i} className="calculator__key" style={{ opacity: numberStates[i] ? 1 : 0 }}>{i}</button>
      );
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
            <div className="calculator__output">0</div>
            <div className="calculator__keys">
                <button className="calculator__key calculator__key--operator" style={{ opacity: numberStates[10] ? 1 : 0 }}>+</button>
                <button className="calculator__key calculator__key--operator" style={{ opacity: numberStates[11] ? 1 : 0 }}>-</button>
                <button className="calculator__key calculator__key--operator" style={{ opacity: numberStates[12] ? 1 : 0 }}>&times;</button>
                <button className="calculator__key calculator__key--operator" style={{ opacity: numberStates[13] ? 1 : 0 }}>÷</button>
                {numberButtons}
                <button className="calculator__key">.</button>
                <button className="calculator__key" style={{ opacity: numberStates[0] ? 1 : 0 }}>0</button>
                <button className="calculator__key">AC</button>
                <button className="calculator__key calculator__key--enter">=</button>
            </div>
        </div>

    );
};

export default Calculator;