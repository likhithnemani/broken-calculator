import Image from "next/image";
import Calculator from "./Calculator";
import Document, { Html, Head, Main, NextScript } from 'next/document';
// import { useEffect } from 'react';


export default function Home() {
  
  return (
    <main className="flex h-100 align-items-center justify-between">
      <Calculator />
    </main>
  );
}
