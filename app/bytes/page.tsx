"use client";

import TopBar from '../../components/TopBar';
import MainContent from './components/MainContent';
import VideoList from './components/VideoList';
import MessagingIconNavbar from '../messaging/components/MessagingIconNavbar';
import Navbar from '../../components/Navbar';
import BytesNavbar from './components/BytesNavbar';
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root{
    --light-color: 241 241 241;
    --dark-color: 15 15 15;
    --primary-color: 255 0 0;
    --secondary-color: 62 166 255;
    --success-color: 3 179 10;
    --like-color: 16 110 190;
    --font-poppins: 'Poppins', system-ui, sans-serif;
    scroll-behavior: smooth;
  }
  ::-webkit-scrollbar {
    width: 0;
  }
  html {
    color-scheme: dark;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: var(--font-poppins);
    outline: none;
  }
  body {
    position: relative;
    background-color: rgb(var(--dark-color));
    color: rgb(var(--light-color));
  }
  .container {
    margin-inline: auto;
    width: min(90%, 70rem);
  }
  a {
    text-decoration: none;
    color: inherit;
    transition: 0.15s;
  }
  input{
    background-color: transparent;
  }
  button {
    cursor: pointer;
    border: none;
    background-color: transparent;
    user-select: none;
  }
  & span.loader {
    margin-bottom: 2rem;
    width: 1rem;
    height: 1rem;
    border: 2px solid #FFF;
    border-bottom-color: rgb(var(--dark-color));
    border-radius: 50%;
    display: inline-block;
    animation: rotation 1s linear infinite;
  }
  @keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
  }
`;

const BytesPage = () => {
  return (
    <>
      <TopBar />
      {/* Show Navbar up to 1024px, MessagingIconNavbar after 1024px */}
      <div className="hidden laptop:block">
        <MessagingIconNavbar />
      </div>
      {/* Mobile layout: navbar part of document flow */}
      <div className="laptop:hidden h-dvh flex flex-col bg-[#EEF0F4] overflow-hidden pt-[61px]">
        {/* Main content area - fills remaining space after topbar and navbar */}
        <main className="flex-1 overflow-hidden">
          <GlobalStyle />
          <VideoList />
        </main>
        {/* Mobile navbar - part of normal flow, not fixed */}
        <BytesNavbar activeItem="Bytes" />
      </div>
      {/* Desktop layout */}
      <div className="hidden laptop:block h-dvh ultra:h-[calc((100dvh/1.25) + 61px)] flex flex-col bg-[#EEF0F4] overflow-hidden">
        <main className="mt-[61px]">
          <GlobalStyle />
          <VideoList />
        </main>
      </div>
    </>
  );
};

export default BytesPage; 