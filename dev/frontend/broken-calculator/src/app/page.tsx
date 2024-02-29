import Image from "next/image";
import Calculator from "./Calculator";

export default function Home() {
  return (
    <main className="flex h-100 align-items-center justify-between">
      <Calculator />
    </main>
  );
}
