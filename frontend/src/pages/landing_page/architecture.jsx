import React from "react";
import "./architecture.css";

const Architecture = () => {
  return (
    <section className="architecture-section" id="architecture">
      <div className="architecture-container">

        {/* Header */}
        <div className="architecture-header">
          <h3 className="architecture-subtitle">
            Architecture
          </h3>
          <h2 className="architecture-title">
            Four-Layer AI System
          </h2>
          <p className="architecture-desc">
            The React frontend communicates with a FastAPI backend that orchestrates
            a multi-agent pipeline. Agents call a local Ollama transformer model
            to generate structured plans, source code, and documentation.
            All artifacts and project data are persisted in MongoDB.
          </p>
        </div>

        {/* Layers Grid */}
        <div className="architecture-grid">

          {/* Frontend Layer */}
          <div className="architecture-card">
            <div className="architecture-card-header">
              <h4 className="architecture-card-title-cyan">
                1️⃣ Frontend Layer
              </h4>
            </div>

            <ul className="architecture-list">
              <li className="architecture-list-item">
                <span className="architecture-dot-cyan"></span>
                <span className="architecture-item-text">Authentication UI (JWT)</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-cyan"></span>
                <span className="architecture-item-text">Prompt Interface</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-cyan"></span>
                <span className="architecture-item-text">WebSocket Client (Live Logs)</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-cyan"></span>
                <span className="architecture-item-text">Live Preview Iframe</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-cyan"></span>
                <span className="architecture-item-text">Download / Deploy Controls</span>
              </li>
            </ul>
          </div>

          {/* Backend Layer */}
          <div className="architecture-card">
            <div className="architecture-card-header">
              <h4 className="architecture-card-title-purple">
                2️⃣ Backend Orchestration Layer
              </h4>
            </div>

            <ul className="architecture-list">
              <li className="architecture-list-item">
                <span className="architecture-dot-purple"></span>
                <span className="architecture-item-text">FastAPI Server</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-purple"></span>
                <span className="architecture-item-text">Agent Orchestrator</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-purple"></span>
                <span className="architecture-item-text">Requirement Agent</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-purple"></span>
                <span className="architecture-item-text">Planner Agent</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-purple"></span>
                <span className="architecture-item-text">Code Agents (HTML / CSS / JS)</span>
              </li>
            </ul>
          </div>

          {/* Transformer Layer */}
          <div className="architecture-card">
            <div className="architecture-card-header">
              <h4 className="architecture-card-title-purple">
                3️⃣ Transformer Intelligence Layer
              </h4>
            </div>

            <ul className="architecture-list">
              <li className="architecture-list-item">
                <span className="architecture-dot-purple"></span>
                <span className="architecture-item-text">Ollama (Local LLM Runtime)</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-purple"></span>
                <span className="architecture-item-text">qwen3:8b Model</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-purple"></span>
                <span className="architecture-item-text">Structured Prompt Engineering</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-purple"></span>
                <span className="architecture-item-text">Multi-Agent Coordination</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-purple"></span>
                <span className="architecture-item-text">Multi-Model Support</span>
              </li>
            </ul>
          </div>

          {/* Data Layer */}
          <div className="architecture-card">
            <div className="architecture-card-header">
              <h4 className="architecture-card-title-green">
                4️⃣ Data & Persistence Layer
              </h4>
            </div>

            <ul className="architecture-list">
              <li className="architecture-list-item">
                <span className="architecture-dot-green"></span>
                <span className="architecture-item-text">MongoDB: Users</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-green"></span>
                <span className="architecture-item-text">MongoDB: Projects</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-green"></span>
                <span className="architecture-item-text">MongoDB: Generated Artifacts</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-green"></span>
                <span className="architecture-item-text">File Manager Service</span>
              </li>
              <li className="architecture-list-item">
                <span className="architecture-dot-green"></span>
                <span className="architecture-item-text">State Checkpointing</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Architecture;