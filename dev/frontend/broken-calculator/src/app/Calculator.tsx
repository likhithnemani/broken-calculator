"use client"
// import { useGoogleOneTapLogin } from '@react-oauth/google';
import React, { useState, useEffect } from 'react';

function Calculator(props: any) {
    const [showOperators, setShowOperators] = useState(true);
    const [res, setRes] = useState('');
    const [numberStates, setNumberStates] = useState(Array(14).fill(true));

    const toggleOperators = () => {
        setShowOperators(!showOperators);
    };

    useEffect(() => {
        const toggleRandomNumberStates = () => {
            var newNumberStates = numberStates.map((value, index) => {
                return false;
            });
            props.numbers.forEach((num: any) => {
                newNumberStates[num] = true
            });
            if (props.numbers.indexOf(0) != -1) {
                newNumberStates[0] = true
            }
            if (props.operators.indexOf('+') != -1) {
                newNumberStates[10] = true
            }
            if (props.operators.indexOf('-') != -1) {
                newNumberStates[11] = true
            }
            if (props.operators.indexOf('*') != -1) {
                newNumberStates[12] = true
            }
            if (props.operators.indexOf('/') != -1) {
                newNumberStates[13] = true
            }
            setNumberStates(newNumberStates);
        };
        toggleRandomNumberStates();
    }, []);

    const appendToString = (number: any) => {
        let ops = ['+', '-', '*', '/'];
        if (res.length > 0 && ops.indexOf(res.charAt(res.length - 1)) == -1) {
            if (ops.indexOf(number) == -1) {
                // console.log(number)
                return;
            }
        }
        setRes(prevRes => prevRes + number + "");
    }

    const numberButtons = [];
    for (let i = 1; i <= 9; i++) {
        numberButtons.push(
            <button key={i} className="calculator__key" onClick={() => appendToString(i)} style={{ opacity: numberStates[i] ? 1 : 0 }}>{i}</button>
        );
    }

    function hasTwoDigitNumber(expression: any) {
        const components = expression.split(/[\+\-\*\/=]/);
        const lastComponent = components[components.length - 1].trim();
    
        // Check if the last component is a two-digit number
        if (lastComponent.length === 2 && !isNaN(lastComponent)) {
            return false;
        }
        
        return true;
    }

    const evaluate = () => {
        try {
            if (!hasTwoDigitNumber(res)) {
                console.log("Invalid expression")
                throw new Error("Invalid expression");
            }
            var ans = eval(res);
            setRes(prev => ans + "");
            console.log(ans);
            console.log(parseInt(props.target))
            if (ans == parseInt(props.target)) {
                console.log(true)
                props.onSolved(true);
            }
        }
        catch(err) {
            setRes(prev => "Error");
        }
    }

    // useGoogleOneTapLogin({
    //     onSuccess: credentialResponse => {
    //         console.log(credentialResponse);
    //         // Handle success
    //     },
    //     onError: () => {
    //         console.log('Login Failed');
    //         // Handle error
    //     },
    // });

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
