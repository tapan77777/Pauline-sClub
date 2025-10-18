import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Paulines Club",
  description: "Basketball Excellence",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}





// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyAi22QemzcvQASgiQxfPERKQMTlYh_rTeE",
//   authDomain: "pauline-s-club.firebaseapp.com",
//   projectId: "pauline-s-club",
//   storageBucket: "pauline-s-club.firebasestorage.app",
//   messagingSenderId: "580228741619",
//   appId: "1:580228741619:web:0e071576fac6e717e03a86"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);