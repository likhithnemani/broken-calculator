import React from 'react';
import './styles.module.css';


const Calculator = () => {
  return (
    <div className="calculator">
        <div className="calculator__output">0</div>
        <div className="calculator__keys">
            <button className="calculator__key styles.calculator__key--operator">+</button>
            <button className="calculator__key calculator__key--operator">-</button>
            <button className="calculator__key calculator__key--operator">&times;</button>
            <button className="calculator__key calculator__key--operator">÷</button>
            <button className="calculator__key">7</button>
            <button className="calculator__key">8</button>
            <button className="calculator__key">9</button>
            <button className="calculator__key">4</button>
            <button className="calculator__key">5</button>
            <button className="calculator__key">6</button>
            <button className="calculator__key">1</button>
            <button className="calculator__key">2</button>
            <button className="calculator__key">3</button>
            <button className="calculator__key">0</button>
            <button className="calculator__key">.</button>
            <button className="calculator__key">AC</button>
            <button className="calculator__key calculator__key--enter">=</button>
        </div>
    </div>
  );
};

export default Calculator;
