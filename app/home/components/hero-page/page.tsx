'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicJobsSection from '../PublicJobsSection';

const GoogleFonts = () => (
  <style suppressHydrationWarning>{`

    :root {
      --brand: #0096c7;
      --brand-dark: #007aa3;
      --brand-deeper: #005f80;
      --brand-light: #e0f4fb;
      --brand-lighter: #f0fafd;
      --ink: #0d1e2c;
      --ink-muted: #3d5166;
      --ink-soft: #6b8499;
      --surface: #ffffff;
      --surface-2: #f5f8fa;
      --surface-3: #eef4f7;
      --border: rgba(0,150,199,0.12);
      --border-strong: rgba(0,150,199,0.25);
    }

    .buronet-root * {
      font-family: 'Plus Jakarta Sans', sans-serif;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .buronet-root {
      background: #ffffff;
      color: var(--ink);
      overflow-x: hidden;
    }

    /* Animations */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(32px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-24px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.92); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes counterUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-8px); }
    }

    .animate-fade-up   { animation: fadeUp 0.7s cubic-bezier(.22,.68,0,1.2) both; }
    .animate-fade-in   { animation: fadeIn 0.6s ease both; }
    .animate-slide-r   { animation: slideRight 0.6s cubic-bezier(.22,.68,0,1.2) both; }
    .animate-scale-in  { animation: scaleIn 0.55s cubic-bezier(.22,.68,0,1.2) both; }
    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }
    .delay-4 { animation-delay: 0.4s; }
    .delay-5 { animation-delay: 0.5s; }
    .delay-6 { animation-delay: 0.6s; }
    .delay-7 { animation-delay: 0.7s; }
    .delay-8 { animation-delay: 0.8s; }

    /* Navbar */
    .buronet-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 0 2rem;
      height: 72px;
      display: flex; align-items: center; justify-content: space-between;
      transition: box-shadow 0.3s;
    }
    .buronet-nav.scrolled { box-shadow: 0 2px 24px rgba(0,150,199,0.1); }
    .nav-logo-wrap {
      display: flex; align-items: center; gap: 0.5rem; cursor: pointer;
    }
    .nav-logo-img {
      width: 28px; height: 28px;
    }
    .nav-logo {
      font-size: 1.8rem; font-weight: 800;
      color: var(--brand);
      letter-spacing: -0.5px;
    }
    .nav-links { display: flex; gap: 2rem; align-items: center; }
    .nav-links a {
      font-size: 1.05rem; font-weight: 600; color: var(--ink-muted);
      text-decoration: none; transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--brand); }
    .nav-cta { display: flex; gap: 0.75rem; align-items: center; }
    .btn-ghost {
      padding: 0.55rem 1.25rem; border-radius: 8px; font-size: 1rem;
      font-weight: 600; color: var(--ink); background: transparent;
      border: 1.5px solid var(--border-strong); cursor: pointer;
      transition: all 0.2s; font-family: inherit;
    }
    .btn-ghost:hover { border-color: var(--brand); color: var(--brand); }
    .btn-primary {
      padding: 0.55rem 1.35rem; border-radius: 8px; font-size: 1rem;
      font-weight: 600; color: #fff; background: var(--brand);
      border: none; cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .btn-primary:hover { background: var(--brand-dark); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,150,199,0.3); }

    /* Mobile hamburger button */
    .nav-hamburger {
      display: none; align-items: center; justify-content: center;
      width: 40px; height: 40px; border-radius: 8px; border: none;
      background: transparent; cursor: pointer; color: var(--ink);
      transition: background 0.2s;
    }
    .nav-hamburger:hover { background: var(--surface-2); }

    /* Mobile off-canvas menu */
    .mobile-overlay {
      display: none; position: fixed; inset: 0; z-index: 200;
      background: rgba(0,0,0,0.4);
      opacity: 0; transition: opacity 0.2s;
    }
    .mobile-overlay.open { opacity: 1; }
    .mobile-drawer {
      position: fixed; inset-y: 0; right: 0; z-index: 201;
      width: 300px; max-width: 85vw;
      background: #fff; border-left: 1px solid var(--border);
      box-shadow: -4px 0 32px rgba(0,0,0,0.12);
      transform: translateX(100%); transition: transform 0.3s cubic-bezier(.22,.68,0,1.2);
      display: flex; flex-direction: column;
    }
    .mobile-drawer.open { transform: translateX(0); }
    .mobile-drawer-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--border);
    }
    .mobile-drawer-head p { font-weight: 700; font-size: 1.05rem; color: var(--ink); }
    .mobile-drawer-body { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; }
    .mobile-nav-section-label {
      font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.7px; color: var(--ink-soft); padding: 0.5rem 0.75rem;
      background: var(--surface-2); border-radius: 6px; margin-bottom: 0.5rem;
    }
    .mobile-nav-link {
      display: block; padding: 0.7rem 0.75rem; border-radius: 8px;
      font-size: 1rem; font-weight: 600; color: var(--ink);
      text-decoration: none; transition: background 0.15s;
    }
    .mobile-nav-link:hover { background: var(--surface-2); color: var(--brand); }
    .mobile-actions { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.5rem; }
    .btn-mobile-primary {
      width: 100%; padding: 0.75rem; border-radius: 8px; border: none;
      background: var(--brand); color: #fff;
      font-size: 1rem; font-weight: 700; cursor: pointer; font-family: inherit;
      transition: background 0.2s;
    }
    .btn-mobile-primary:hover { background: var(--brand-dark); }
    .btn-mobile-ghost {
      width: 100%; padding: 0.75rem; border-radius: 8px;
      border: 1.5px solid var(--border-strong); background: transparent;
      color: var(--ink); font-size: 1rem; font-weight: 600;
      cursor: pointer; font-family: inherit; transition: all 0.2s;
    }
    .btn-mobile-ghost:hover { border-color: var(--brand); color: var(--brand); }

    /* Hero */
    .hero-section {
      min-height: 100vh;
      padding-top: 72px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 0;
      position: relative;
      overflow: hidden;
    }
    .hero-bg-accent {
      position: absolute; top: -120px; right: -80px;
      width: 600px; height: 600px; border-radius: 50%;
      background: radial-gradient(circle, rgba(0,150,199,0.06) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-bg-dots {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(circle, rgba(0,150,199,0.08) 1px, transparent 1px);
      background-size: 32px 32px;
      pointer-events: none;
      opacity: 0.6;
    }
    .hero-left {
      padding: 5rem 3rem 5rem 4rem;
      position: relative; z-index: 2;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: var(--brand-light); color: var(--brand-deeper);
      padding: 0.35rem 0.9rem; border-radius: 100px;
      font-size: 0.9rem; font-weight: 600; letter-spacing: 0.3px;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(0,150,199,0.2);
    }
    .badge-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--brand); position: relative;
    }
    .badge-dot::after {
      content: ''; position: absolute; inset: -3px;
      border-radius: 50%; background: rgba(0,150,199,0.3);
      animation: pulse-ring 1.5s ease-out infinite;
    }
    .hero-title {
      font-size: clamp(2.5rem, 4.5vw, 3.6rem);
      font-weight: 800; line-height: 1.1;
      color: var(--ink); letter-spacing: -1.5px; margin-bottom: 0.5rem;
    }
    .hero-title-accent {
      font-family: 'Instrument Serif', serif;
      font-style: italic; color: var(--brand);
      font-weight: 400; font-size: clamp(2.8rem, 5vw, 4rem);
      display: block; letter-spacing: -1px;
    }
    .hero-sub {
      font-size: 1.15rem; color: var(--ink-muted); line-height: 1.7;
      margin-bottom: 2rem; max-width: 440px; font-weight: 400;
    }
    .hero-actions { display: flex; gap: 0.875rem; flex-wrap: wrap; margin-bottom: 3rem; }
    .btn-hero-primary {
      padding: 0.8rem 1.75rem; border-radius: 10px; font-size: 1.05rem;
      font-weight: 700; color: #fff; background: var(--brand);
      border: none; cursor: pointer; transition: all 0.25s; font-family: inherit;
      box-shadow: 0 4px 20px rgba(0,150,199,0.35);
    }
    .btn-hero-primary:hover {
      background: var(--brand-dark); transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(0,150,199,0.4);
    }
    .btn-hero-outline {
      padding: 0.8rem 1.75rem; border-radius: 10px; font-size: 1.05rem;
      font-weight: 600; color: var(--ink); background: transparent;
      border: 1.5px solid rgba(13,30,44,0.18); cursor: pointer;
      transition: all 0.25s; font-family: inherit;
    }
    .btn-hero-outline:hover { border-color: var(--brand); color: var(--brand); }
    .hero-stats {
      display: flex; gap: 2rem; align-items: center;
    }
    .stat-item { text-align: left; }
    .stat-value {
      font-size: 1.65rem; font-weight: 800; color: var(--ink);
      letter-spacing: -0.5px; line-height: 1;
    }
    .stat-label { font-size: 0.88rem; color: var(--ink-soft); font-weight: 500; margin-top: 2px; }
    .stat-div { width: 1px; height: 36px; background: var(--border-strong); }

    /* Hero Image Side */
    .hero-right {
      position: relative; height: 100vh;
      display: flex; align-items: center; justify-content: center;
      overflow: visible;
    }
    .hero-image-wrap {
      position: relative; width: 100%; height: 100%;
      overflow: hidden;
    }
    .hero-image-wrap img {
      width: 100%; height: 100%; object-fit: cover;
      filter: brightness(0.88) saturate(1.1);
    }
    .hero-image-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(105deg, rgba(0,150,199,0.15) 0%, transparent 60%);
    }
    .hero-floating-card {
      position: absolute; bottom: 2.5rem; left: -2rem;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(12px);
      border-radius: 14px; padding: 1rem 1.25rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      border: 1px solid var(--border);
      min-width: 200px; animation: float 3s ease-in-out infinite;
    }
    .floating-card-label {
      font-size: 0.85rem; font-weight: 600; color: var(--ink-soft);
      text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 0.3rem;
    }
    .floating-card-value {
      font-size: 1.5rem; font-weight: 800; color: var(--brand);
    }
    .floating-card-sub { font-size: 0.88rem; color: var(--ink-soft); }
    .hero-floating-card-2 {
      position: absolute; top: 8rem; left: -1.5rem;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(12px);
      border-radius: 14px; padding: 0.875rem 1.1rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      border: 1px solid var(--border);
      animation: float 3.5s ease-in-out infinite 0.8s;
    }
    .badge-success {
      display: inline-flex; align-items: center; gap: 0.4rem;
      font-size: 0.9rem; font-weight: 700; color: #0a8c5a;
    }
    .dot-success { width: 8px; height: 8px; border-radius: 50%; background: #12b76a; }

    /* Section commons */
    .section { padding: 6rem 4rem; }
    .section-sm { padding: 4.5rem 4rem; }
    .section-bg-alt { background: var(--surface-2); }
    .section-tag {
      display: inline-flex; align-items: center; gap: 0.4rem;
      font-size: 0.85rem; font-weight: 700; color: var(--brand);
      text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 0.75rem;
    }
    .section-tag::before {
      content: ''; display: block; width: 20px; height: 2px;
      background: var(--brand); border-radius: 2px;
    }
    .section-title {
      font-size: clamp(1.9rem, 3vw, 2.6rem); font-weight: 800;
      color: var(--ink); letter-spacing: -0.8px; margin-bottom: 0.75rem; line-height: 1.15;
    }
    .section-sub {
      font-size: 1.1rem; color: var(--ink-muted); line-height: 1.7;
      max-width: 520px; font-weight: 400;
    }

    /* Features bento */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: auto auto;
      gap: 1rem;
      margin-top: 3rem;
    }
    .feat-card {
      background: var(--surface); border-radius: 16px;
      border: 1px solid var(--border); padding: 1.75rem;
      transition: all 0.3s cubic-bezier(.22,.68,0,1.2);
      cursor: pointer; position: relative; overflow: hidden;
    }
    .feat-card::before {
      content: ''; position: absolute; inset: 0; border-radius: 16px;
      background: linear-gradient(135deg, rgba(0,150,199,0.04) 0%, transparent 60%);
      opacity: 0; transition: opacity 0.3s;
    }
    .feat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,150,199,0.12); border-color: var(--border-strong); }
    .feat-card:hover::before { opacity: 1; }
    .feat-card.featured {
      background: var(--ink); color: #fff;
      grid-column: span 2;
    }
    .feat-card.featured .feat-desc { color: rgba(255,255,255,0.65); }
    .feat-card.featured .feat-icon-wrap { background: rgba(255,255,255,0.1); }
    .feat-card.tall { grid-row: span 2; }
    .feat-icon-wrap {
      width: 44px; height: 44px; border-radius: 12px;
      background: var(--brand-light); display: flex;
      align-items: center; justify-content: center;
      margin-bottom: 1.25rem;
      font-size: 1.3rem;
    }
    .feat-title {
      font-size: 1.15rem; font-weight: 700; color: var(--ink);
      margin-bottom: 0.4rem;
    }
    .feat-card.featured .feat-title { color: #fff; }
    .feat-desc { font-size: 0.95rem; color: var(--ink-muted); line-height: 1.6; }
    .feat-link {
      display: inline-flex; align-items: center; gap: 0.35rem;
      font-size: 0.92rem; font-weight: 600; color: var(--brand);
      margin-top: 1rem; text-decoration: none;
      transition: gap 0.2s;
    }
    .feat-card.featured .feat-link { color: rgba(255,255,255,0.8); }
    .feat-link:hover { gap: 0.55rem; }
    .feat-chip {
      display: inline-block; background: rgba(0,150,199,0.15); color: var(--brand);
      font-size: 0.8rem; font-weight: 700; padding: 0.25rem 0.6rem;
      border-radius: 100px; margin-bottom: 0.75rem;
      text-transform: uppercase; letter-spacing: 0.5px;
    }

    /* Opportunities */
    .opportunities-header {
      display: flex; align-items: flex-end;
      justify-content: space-between; margin-bottom: 2.5rem;
    }
    .view-all-link {
      font-size: 0.95rem; font-weight: 600; color: var(--brand);
      text-decoration: none; display: flex; align-items: center; gap: 0.3rem;
      transition: gap 0.2s;
    }
    .view-all-link:hover { gap: 0.5rem; }
    .jobs-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;
    }
    .job-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; padding: 1.5rem;
      transition: all 0.3s cubic-bezier(.22,.68,0,1.2);
      position: relative; overflow: hidden;
    }
    .job-card::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--brand); transform: scaleX(0); transform-origin: left;
      transition: transform 0.3s;
    }
    .job-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,150,199,0.1); border-color: var(--border-strong); }
    .job-card:hover::after { transform: scaleX(1); }
    .job-source-tag {
      font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.8px; padding: 0.25rem 0.6rem;
      border-radius: 6px; display: inline-block; margin-bottom: 0.85rem;
    }
    .tag-upsc { background: #e8f4ff; color: #1a5fa0; }
    .tag-psc  { background: #fff3e0; color: #b06000; }
    .tag-ssc  { background: #e8f5e9; color: #2e7d32; }
    .job-title { font-size: 1.1rem; font-weight: 700; color: var(--ink); margin-bottom: 0.3rem; line-height: 1.3; }
    .job-org   { font-size: 0.92rem; color: var(--ink-soft); margin-bottom: 1rem; }
    .job-meta  { display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 1.25rem; }
    .job-meta-item { display: flex; align-items: center; gap: 0.45rem; font-size: 0.92rem; color: var(--ink-muted); }
    .job-meta-icon { width: 16px; text-align: center; opacity: 0.6; }
    .job-deadline { display: flex; align-items: center; gap: 0.35rem; font-size: 0.88rem; font-weight: 600; }
    .deadline-urgent { color: #d92d20; }
    .deadline-normal { color: var(--ink-soft); }
    .btn-apply {
      width: 100%; padding: 0.6rem; border-radius: 8px;
      font-size: 0.95rem; font-weight: 700; cursor: pointer;
      background: transparent; border: 1.5px solid var(--brand);
      color: var(--brand); font-family: inherit;
      transition: all 0.2s;
    }
    .btn-apply:hover { background: var(--brand); color: #fff; }

    /* Why Buronet */
    .why-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;
      margin-top: 3rem;
    }
    .why-card {
      text-align: center; padding: 2rem 1.5rem;
      border-radius: 16px; border: 1px solid var(--border);
      background: var(--surface);
      transition: all 0.3s;
    }
    .why-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,150,199,0.1); border-color: var(--border-strong); }
    .why-icon-circle {
      width: 64px; height: 64px; border-radius: 50%;
      background: var(--brand-light);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.25rem; font-size: 1.6rem;
      transition: all 0.3s;
    }
    .why-card:hover .why-icon-circle {
      background: var(--brand); transform: scale(1.1);
    }
    .why-title { font-size: 1.35rem; font-weight: 700; color: var(--ink); margin-bottom: 0.5rem; }
    .why-desc { font-size: 0.975rem; color: var(--ink-muted); line-height: 1.65; }

    /* Deadline + Updates */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .panel {
      background: var(--surface); border-radius: 16px;
      border: 1px solid var(--border); padding: 1.75rem;
    }
    .panel-title { font-size: 1.1rem; font-weight: 800; color: var(--ink); margin-bottom: 1.25rem; }
    .deadline-row {
      display: flex; align-items: center; gap: 1rem;
      padding: 0.875rem 0; border-bottom: 1px solid var(--border);
    }
    .deadline-row:last-child { border-bottom: none; }
    .date-badge {
      min-width: 52px; text-align: center;
      background: var(--brand-light); border-radius: 10px;
      padding: 0.5rem; border: 1px solid rgba(0,150,199,0.2);
    }
    .date-month { font-size: 0.8rem; font-weight: 700; color: var(--brand); text-transform: uppercase; letter-spacing: 0.5px; }
    .date-day   { font-size: 1.25rem; font-weight: 800; color: var(--ink); line-height: 1.1; }
    .deadline-info { flex: 1; }
    .deadline-name  { font-size: 0.95rem; font-weight: 700; color: var(--ink); }
    .deadline-status { font-size: 0.85rem; color: var(--ink-soft); margin-top: 0.15rem; }
    .bell-btn {
      width: 32px; height: 32px; border-radius: 8px;
      background: var(--surface-2); border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; font-size: 0.9rem;
    }
    .bell-btn:hover { background: var(--brand-light); border-color: var(--brand); }
    .update-chip {
      font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 0.18rem 0.5rem;
      border-radius: 4px; display: inline-block; margin-bottom: 0.3rem;
    }
    .chip-rec  { background: #dcfce7; color: #166534; }
    .chip-pol  { background: #e0f2fe; color: #0369a1; }
    .update-row { padding: 0.75rem 0; border-bottom: 1px solid var(--border); }
    .update-row:last-child { border-bottom: none; }
    .update-title { font-size: 0.95rem; font-weight: 600; color: var(--ink); line-height: 1.4; margin-bottom: 0.25rem; }
    .update-time  { font-size: 0.85rem; color: var(--ink-soft); }

    /* FAQ */
    .faq-list { max-width: 720px; margin: 2.5rem auto 0; }
    .faq-item {
      border: 1px solid var(--border); border-radius: 12px;
      margin-bottom: 0.75rem; overflow: hidden;
      transition: border-color 0.2s;
    }
    .faq-item.open { border-color: var(--border-strong); }
    .faq-q {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.1rem 1.25rem; cursor: pointer;
      font-size: 1.05rem; font-weight: 600; color: var(--ink);
      background: var(--surface); user-select: none;
      gap: 1rem;
    }
    .faq-chevron {
      width: 24px; height: 24px; border-radius: 6px;
      background: var(--surface-2); display: flex;
      align-items: center; justify-content: center;
      font-size: 0.8rem; transition: all 0.3s; flex-shrink: 0;
    }
    .faq-item.open .faq-chevron {
      background: var(--brand); color: #fff; transform: rotate(180deg);
    }
    .faq-a {
      max-height: 0; overflow: hidden;
      transition: max-height 0.4s cubic-bezier(.4,0,.2,1), padding 0.3s;
      font-size: 0.95rem; color: var(--ink-muted); line-height: 1.7;
      padding: 0 1.25rem; background: var(--surface-2);
    }
    .faq-item.open .faq-a { max-height: 200px; padding: 1rem 1.25rem; }

    /* CTA */
    .cta-section {
      margin: 0 4rem 5rem;
      background: var(--ink);
      border-radius: 24px; padding: 5rem 4rem;
      text-align: center; position: relative; overflow: hidden;
    }
    .cta-bg {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 30% 50%, rgba(0,150,199,0.25) 0%, transparent 60%),
                  radial-gradient(ellipse at 70% 50%, rgba(0,150,199,0.15) 0%, transparent 60%);
      pointer-events: none;
    }
    .cta-title {
      font-size: clamp(2rem, 4vw, 3rem); font-weight: 800;
      color: #fff; letter-spacing: -1px; margin-bottom: 0.75rem;
    }
    .cta-title span { color: var(--brand); }
    .cta-sub { font-size: 1.1rem; color: rgba(255,255,255,0.6); margin-bottom: 2rem; }
    .btn-cta {
      display: inline-block; padding: 0.9rem 2.5rem;
      border-radius: 10px; font-size: 1.1rem; font-weight: 700;
      color: var(--ink); background: #fff;
      border: none; cursor: pointer; font-family: inherit;
      transition: all 0.25s;
    }
    .btn-cta:hover { background: var(--brand-light); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,150,199,0.3); }

    /* Footer */
    .footer {
      background: var(--ink); padding: 3.5rem 4rem 2rem;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .footer-grid {
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 3rem; margin-bottom: 3rem;
    }
    .footer-logo { font-size: 1.3rem; font-weight: 800; color: var(--brand); margin-bottom: 0.75rem; }
    .footer-desc { font-size: 0.92rem; color: rgba(255,255,255,0.45); line-height: 1.7; }
    .footer-col-title { font-size: 0.9rem; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 1rem; }
    .footer-links { list-style: none; }
    .footer-links li { margin-bottom: 0.6rem; }
    .footer-links a { font-size: 0.95rem; color: rgba(255,255,255,0.55); text-decoration: none; transition: color 0.2s; }
    .footer-links a:hover { color: #fff; }
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.08);
      padding-top: 1.5rem; display: flex;
      align-items: center; justify-content: space-between;
    }
    .footer-copy { font-size: 0.88rem; color: rgba(255,255,255,0.3); }
    .social-links { display: flex; gap: 0.75rem; }
    .social-btn {
      width: 32px; height: 32px; border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.12);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; color: rgba(255,255,255,0.5);
      cursor: pointer; transition: all 0.2s;
    }
    .social-btn:hover { border-color: var(--brand); color: var(--brand); }

    /* Scroll reveal */
    .reveal { opacity: 0; transform: translateY(28px); transition: all 0.7s cubic-bezier(.22,.68,0,1.2); }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }

    @media (max-width: 1024px) {
      .hero-section { grid-template-columns: 1fr; }
      .hero-right { display: none; }
      .hero-left { padding: 4rem 2rem; }
      .features-grid { grid-template-columns: 1fr 1fr; }
      .feat-card.featured { grid-column: span 2; }
      .jobs-grid { grid-template-columns: 1fr 1fr; }
      .why-grid { grid-template-columns: 1fr 1fr; }
      .two-col { grid-template-columns: 1fr; }
      .cta-section { margin: 0 2rem 4rem; padding: 3.5rem 2rem; }
      .section { padding: 4rem 2rem; }
      .section-sm { padding: 3rem 2rem; }
      .footer { padding: 3rem 2rem 2rem; }
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
    }

    @media (min-width: 641px) and (max-width: 1023px) {
      .nav-links { display: none; }
      .nav-hamburger { display: flex; }
      .nav-cta .btn-ghost, .nav-cta .btn-primary { display: none; }
    }

    @media (max-width: 640px) {
      .nav-links { display: none; }
      .nav-cta .btn-ghost, .nav-cta .btn-primary { display: none; }
      .nav-hamburger { display: flex; }
      .features-grid { grid-template-columns: 1fr; }
      .feat-card.featured { grid-column: span 1; }
      .jobs-grid { grid-template-columns: 1fr; }
      .why-grid { grid-template-columns: 1fr; }
      .footer-grid { grid-template-columns: 1fr; }
      .hero-stats { flex-wrap: wrap; gap: 1rem; }
      .stat-div { display: none; }
      .hero-left { padding: 3rem 1.25rem 4rem; }
    }
  `}</style>
);

const faqs = [
  {
    q: 'Is Buronet affiliated with any government body?',
    a: 'Buronet is an independent professional network and is not affiliated with any government organization. We source verified job listings from official government portals including UPSC, State PSCs, and SSC.',
  },
  {
    q: 'How do you verify job alerts?',
    a: 'Every job listing on Buronet is cross-referenced against official government recruitment portals. Our team manually verifies each posting before it goes live, ensuring 100% accuracy.',
  },
  {
    q: 'Is the platform free to use?',
    a: 'Core features including job listings, exam calendar, and community access are completely free. Premium features like 1-on-1 mentorship and advanced analytics are available under our Pro subscription.',
  },
  {
    q: 'How does the peer community work?',
    a: 'Our community connects verified aspirants and current civil servants. You can share preparation strategies, ask questions, join study groups, and build meaningful connections with people on the same journey.',
  },
];

const whyItems = [
  { icon: '🛡️', title: 'Verified Networking', desc: 'Connect with real candidates and serving officers through our ID-verified system, ensuring every connection is authentic and meaningful.' },
  { icon: '📰', title: 'Informative Bytes', desc: 'Stay current with policy changes, exam analyses, and civil services news curated and distilled into quick, actionable reads.' },
  { icon: '🔔', title: 'Smart Job Alerts', desc: 'Personalised notifications tuned to your exam preferences, location, and career goals — so you never miss a critical opportunity.' },
];

export default function Home() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRef = (el: HTMLElement | null, i: number) => { revealRefs.current[i] = el; };
  const goLogin = () => router.push('/login');
  const goRegister = () => router.push('/register');

  return (
    <div className="buronet-root">
      <GoogleFonts />

      {/* ===== Responsive Public Navbar ===== */}
      <nav className={`buronet-nav${scrolled ? ' scrolled' : ''}`}>
        {/* Logo */}
        <div className="nav-logo-wrap" onClick={goLogin}>
          <img src="/Logo.PNG" alt="Buronet Logo" className="nav-logo-img" />
          <span className="nav-logo">Buronet</span>
        </div>

        {/* Desktop links */}
        <div className="nav-links">
          <a href="#hero" onClick={(e) => { e.preventDefault(); document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }); }}>Home</a>
          <a href="#jobs" onClick={(e) => { e.preventDefault(); document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' }); }}>Jobs</a>
          <a href="#community" onClick={(e) => { e.preventDefault(); document.getElementById('community')?.scrollIntoView({ behavior: 'smooth' }); }}>Community</a>
          <a href="#resources" onClick={(e) => { e.preventDefault(); document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' }); }}>Resources</a>
        </div>

        {/* Desktop CTA + Mobile hamburger */}
        <div className="nav-cta">
          <button className="btn-ghost" onClick={goLogin}>Login</button>
          <button className="btn-primary" onClick={goRegister}>Join Now</button>
          <button
            className="nav-hamburger"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen(v => !v)}
          >
            {isMobileMenuOpen ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" /><path d="M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay${isMobileMenuOpen ? ' open' : ''}`}
        style={{ display: isMobileMenuOpen ? 'block' : 'none' }}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile drawer */}
      <div className={`mobile-drawer${isMobileMenuOpen ? ' open' : ''}`}>
        <div className="mobile-drawer-head">
          <p>Menu</p>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mobile-drawer-body">
          <div className="mobile-nav-section-label">Navigation</div>
          <a className="mobile-nav-link" href="#hero" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }); }}>Home</a>
          <a className="mobile-nav-link" href="#jobs" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' }); }}>Jobs</a>
          <a className="mobile-nav-link" href="#community" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); document.getElementById('community')?.scrollIntoView({ behavior: 'smooth' }); }}>Community</a>
          <a className="mobile-nav-link" href="#resources" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' }); }}>Resources</a>
          <div className="mobile-actions">
            <button className="btn-mobile-primary" onClick={() => { setIsMobileMenuOpen(false); goRegister(); }}>Join Now</button>
            <button className="btn-mobile-ghost" onClick={() => { setIsMobileMenuOpen(false); goLogin(); }}>Login</button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section id="hero" className="hero-section">
        <div className="hero-bg-dots" />
        <div className="hero-bg-accent" />

        <div className="hero-left">
          <div className="hero-badge animate-fade-up">
            <span className="badge-dot" /> India's #1 Government Career Network
          </div>

          <h1 className="hero-title animate-fade-up delay-1">
            Empowering India's
            <span className="hero-title-accent">Next Generation</span>
            of Civil Servants
          </h1>

          <p className="hero-sub animate-fade-up delay-2">
            Buronet bridges the gap between your ambition and government stability. Access verified job alerts, real-time exam updates, and a thriving community of aspirants.
          </p>

          <div className="hero-actions animate-fade-up delay-3">
            <button className="btn-hero-primary" onClick={goRegister}>Join Free →</button>
            <button className="btn-hero-outline" onClick={goLogin}>Explore Jobs</button>
          </div>

          <div className="hero-stats animate-fade-up delay-4">
            <div className="stat-item">
              <div className="stat-value">12k+</div>
              <div className="stat-label">Active Jobs</div>
            </div>
            <div className="stat-div" />
            <div className="stat-item">
              <div className="stat-value">85%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-div" />
            <div className="stat-item">
              <div className="stat-value">500k+</div>
              <div className="stat-label">Aspirants</div>
            </div>
          </div>
        </div>

        <div className="hero-right animate-scale-in delay-2">
          <div className="hero-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=900&q=85&auto=format&fit=crop"
              alt="Professional government workspace"
            />
            <div className="hero-image-overlay" />
          </div>

          <div className="hero-floating-card animate-fade-up delay-5">
            <div className="floating-card-label">New Listings Today</div>
            <div className="floating-card-value">247</div>
            <div className="floating-card-sub">Across UPSC, PSC & SSC</div>
          </div>

          <div className="hero-floating-card-2 animate-fade-up delay-6">
            <div className="badge-success">
              <span className="dot-success" />
              Live Updates Active
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento */}
      <section id="features" className="section">
        <div ref={el => addRef(el as HTMLElement, 0)} className="reveal">
          <div className="section-tag">Platform Features</div>
          <h2 className="section-title">Everything you need to succeed</h2>
          <p className="section-sub">One platform to track jobs, prep smarter, and connect with people who get it.</p>
        </div>

        <div className="features-grid">
          <div ref={el => addRef(el as HTMLElement, 1)} className="feat-card reveal reveal-delay-1">
            <div className="feat-chip">Live Updates</div>
            <div className="feat-icon-wrap">📋</div>
            <div className="feat-title">Live Job Openings</div>
            <div className="feat-desc">Latest notifications from UPSC, State PSCs, and SSC — verified and posted in real time.</div>
            <a href="#" className="feat-link" onClick={(e) => { e.preventDefault(); goLogin(); }}>Browse Jobs →</a>
          </div>

          <div ref={el => addRef(el as HTMLElement, 2)} className="feat-card reveal reveal-delay-2">
            <div className="feat-icon-wrap">👥</div>
            <div className="feat-title">Peer Community</div>
            <div className="feat-desc">Share preparation strategies and forge meaningful connections with fellow aspirants.</div>
            <a href="#" className="feat-link" onClick={(e) => { e.preventDefault(); goRegister(); }}>Join Now →</a>
          </div>

          <div ref={el => addRef(el as HTMLElement, 3)} className="feat-card tall reveal reveal-delay-3">
            <div className="feat-icon-wrap">🗓️</div>
            <div className="feat-title">Exam Calendar</div>
            <div className="feat-desc">Never miss a deadline. Our integrated tracker keeps every important date on your radar — admit cards, results, interviews, and more.</div>
            <a href="#" className="feat-link" onClick={(e) => { e.preventDefault(); goLogin(); }}>View Calendar →</a>
          </div>

          <div ref={el => addRef(el as HTMLElement, 4)} className="feat-card featured reveal reveal-delay-4">
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <div className="feat-chip">Premium</div>
                <div className="feat-title">Expert Mentorship</div>
                <div className="feat-desc">Direct guidance from IAS/IPS officers and top educators who have been there and done it.</div>
                <a href="#" className="feat-link" onClick={(e) => { e.preventDefault(); goLogin(); }}>Learn More →</a>
              </div>
              <div style={{ flexShrink: 0, width: 80, height: 80, borderRadius: 16, background: 'rgba(0,150,199,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🎓</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Opportunities — Dynamic (scraped from SarkariResult + IndGovtJobs) */}
      {/* OLD static section preserved below as comment for reference
      <section id="jobs" className="section section-bg-alt">
        static hardcoded 3 cards were here — replaced by PublicJobsSection
      </section>
      */}
      <PublicJobsSection />

      {/* Why Buronet */}
      <section id="community" className="section">
        <div ref={el => addRef(el as HTMLElement, 9)} className="reveal" style={{ textAlign: 'center' }}>
          <div className="section-tag" style={{ justifyContent: 'center' }}>Why Us</div>
          <h2 className="section-title" style={{ maxWidth: 480, margin: '0 auto 0.75rem' }}>Why choose Buronet?</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>The ecosystem designed for high-performing aspirants to turn their public service dreams into reality.</p>
        </div>

        <div className="why-grid">
          {whyItems.map((item, i) => (
            <div key={i} ref={el => addRef(el as HTMLElement, 10 + i)} className={`why-card reveal reveal-delay-${i + 1}`}>
              <div className="why-icon-circle">{item.icon}</div>
              <div className="why-title">{item.title}</div>
              <div className="why-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Critical Deadlines + Latest Updates */}
      <section className="section section-bg-alt">
        <div className="two-col">
          <div ref={el => addRef(el as HTMLElement, 13)} className="panel reveal">
            <div className="panel-title">⏰ Critical Deadlines</div>
            {[
              { month: 'JUN', day: '15', name: 'UPSC Civil Services Prelims 2024', status: 'Application window open' },
              { month: 'JUL', day: '02', name: 'SSC CGL Tier-I Examination', status: 'Admit card window opens' },
            ].map((d, i) => (
              <div key={i} className="deadline-row">
                <div className="date-badge">
                  <div className="date-month">{d.month}</div>
                  <div className="date-day">{d.day}</div>
                </div>
                <div className="deadline-info">
                  <div className="deadline-name">{d.name}</div>
                  <div className="deadline-status">{d.status}</div>
                </div>
                <button className="bell-btn">🔔</button>
              </div>
            ))}
          </div>

          <div ref={el => addRef(el as HTMLElement, 14)} className="panel reveal reveal-delay-2">
            <div className="panel-title">📡 Latest Updates</div>
            {[
              { chip: 'Recruitment', chipClass: 'chip-rec', title: 'New age relaxation policy for State PSC candidates announced', time: '2 hours ago · 3 Min Read' },
              { chip: 'Policy', chipClass: 'chip-pol', title: 'Digital India initiative introduces new training modules for civil servants', time: 'Yesterday · 5 Min Read' },
            ].map((u, i) => (
              <div key={i} className="update-row">
                <span className={`update-chip ${u.chipClass}`}>{u.chip}</span>
                <div className="update-title">{u.title}</div>
                <div className="update-time">{u.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="resources" className="section" style={{ textAlign: 'center' }}>
        <div ref={el => addRef(el as HTMLElement, 15)} className="reveal">
          <div className="section-tag" style={{ justifyContent: 'center' }}>FAQ</div>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`faq-item${openFaq === i ? ' open' : ''}`}
              ref={el => addRef(el as HTMLElement, 16 + i)}
              style={{ textAlign: 'left' }}
            >
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {faq.q}
                <span className="faq-chevron">▼</span>
              </div>
              <div className="faq-a">{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div ref={el => addRef(el as HTMLElement, 21)} className="reveal">
        <div className="cta-section">
          <div className="cta-bg" />
          <h2 className="cta-title" style={{ position: 'relative' }}>
            Ready to <span>Serve the Nation?</span>
          </h2>
          <p className="cta-sub" style={{ position: 'relative' }}>
            Join the most trusted community of Indian aspirants and start your journey today.
          </p>
          <button className="btn-cta" onClick={goRegister}>Start Your Journey →</button>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">Buronet</div>
            <p className="footer-desc">India's premier professional network for the government sector. Building trust, transparency, and careers in the public realm.</p>
          </div>
          <div>
            <div className="footer-col-title">Navigation</div>
            <ul className="footer-links">
              <li><a href="#hero" onClick={(e) => { e.preventDefault(); document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }); }}>Home</a></li>
              <li><a href="#jobs" onClick={(e) => { e.preventDefault(); document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' }); }}>Job Board</a></li>
              <li><a href="#community" onClick={(e) => { e.preventDefault(); document.getElementById('community')?.scrollIntoView({ behavior: 'smooth' }); }}>Community</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Support</div>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Connect</div>
            <div className="social-links">
              <button className="social-btn">𝕏</button>
              <button className="social-btn">in</button>
              <button className="social-btn">✉</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2024 Buronet. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}