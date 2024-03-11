import Image from "next/image";
import Calculator from "./Calculator";
import Document, { Html, Head, Main, NextScript } from 'next/document';
import Timer from "./Timer";
// import { useEffect } from 'react';


export default function Home() {
  
  return (
    <div className="grid grid-cols-2 gap-2">
      <Calculator />
      <Timer />
    </div>
  );
}
