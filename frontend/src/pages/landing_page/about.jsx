import React from "react";
import { Link } from "react-router-dom";
import "./about.css";
import backgroundVideo from "/Automated_Video_Generation.mp4";

const Hero = () => {
  return (
    <section id="about" className="about-section">
      <section className="hero-section">

        {/* LEFT SIDE */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            <span>React · FastAPI · MongoDB · Ollama</span>
          </div>

          <h1 className="hero-headline">
            Build websites<br />
            <span className="highlight">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;with just a prompt!!</span>
          </h1>

          <p className="hero-description">
            Our web application is built around a powerful multi-agent AI pipeline powered by Ollama and FastAPI.
            It automatically generates high-quality, production-ready code based on user input, then instantly previews the results so users can review and refine before deployment.
            Each AI agent is designed to handle specific tasks such as planning, coding, testing, and optimization, working together like a coordinated development team.
            The system significantly reduces manual effort, accelerates development cycles, and enables rapid prototyping. Within seconds, users can move from idea to deployable application,
            making software creation faster, smarter, and more efficient for developers and businesses alike.
          </p>

          <Link to="/login">
            <button className="hero-btn">
              Start Building Free →
            </button>
          </Link>
        </div>

        {/* RIGHT SIDE */}
        <div className="hero-terminal-wrapper">

          {/* Background Video */}
          <video
            className="video-bg"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>

          {/* Glass Terminal */}
          <div className="hero-terminal">

            <div className="terminal-header">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
              <span className="terminal-title">
                AI Builder Terminal
              </span>
            </div>

            <div className="terminal-body">
              <p>👉[Base Agent] Foundation class for all agents...</p>
              <p>👉[conversation_agent] Parses user prompt, extracts features...</p>
              <p>👉[requirement_agent] Organizes requirements...</p>
              <p>👉[page_discovery_agent] Discovers pages...</p>
              <p>👉[plan_agent] Plans architecture and folder structure...</p>
              <p>👉[code_agent] Generates code...</p>
              <p>👉[readme_agent] Generates readme file...</p>
              <p className="success">
                &nbsp;&nbsp;✓ Build complete! 3 files generated.
              </p>
            </div>

          </div>
        </div>

      </section>
    </section>
  );
};

export default Hero;