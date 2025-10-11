"use client";

import Navbar from '../../components/Navbar';
import TopBar from '../../components/TopBar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import VideoList from './components/VideoList';
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
  html, body {
    overflow-x: hidden;
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
    <div className="min-h-screen flex flex-col bg-[#EEF0F4]">
      <TopBar />
      <div className="flex flex-1 pt-[61px]">
        <div className="w-[239px]" /> {/* Placeholder for fixed navbar */}
        <Navbar activeItem="Bytes" />
        <main className="flex-1 px-6 ml-6 h-[80vh]">
          <GlobalStyle />
          <VideoList />
        </main>
      </div>
    </div>
  );
};

export default BytesPage; 