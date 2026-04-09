import React from 'react';
import './feature.css';

const Features = () => {
  return (
    <section className="features-section" id="features">
      <div className="features-container">

        {/* Header content */}
        <div className="features-header">
          <h3 className="features-subtitle">
            Features
          </h3>
          <h2 className="features-title">
            Everything You Need
          </h2>
          <p className="features-desc">
            End-to-end AI web(Frontend) builder with real-time logs, live preview, and one-click export.
          </p>
        </div>

        {/* Features Grid */}
        <div className="features-grid">

          {/* Feature 1 */}
          <div className="features-card">
            <div className="features-icon-wrapper-purple">
              <svg className="features-icon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h4 className="features-card-title">Multi-Agent AI Pipeline</h4>
            <p className="features-card-desc">
              Requirement, Planner, and Coding agents work in sequence to transform your idea into production-ready code.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="features-card">
            <div className="features-icon-wrapper-cyan">
              <svg className="features-icon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="features-card-title">Real-Time Build Logs</h4>
            <p className="features-card-desc">
              WebSocket-powered live streaming of agent progress, token usage, and file generation events.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="features-card">
            <div className="features-icon-wrapper-green">
              <svg className="features-icon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h4 className="features-card-title">Live Code Preview</h4>
            <p className="features-card-desc">
              Sandboxed iframe renders your generated HTML/CSS/JS instantly as each file is produced.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="features-card">
            <div className="features-icon-wrapper-orange">
              <svg className="features-icon-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h4 className="features-card-title">Local LLM Support</h4>
            <p className="features-card-desc">
              Powered by Ollama running Llama 3 or Mistral locally — your code never leaves your machine.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="features-card">
            <div className="features-icon-wrapper-pink">
              <svg className="features-icon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="features-card-title">JWT Authentication</h4>
            <p className="features-card-desc">
              Secure login backed by FastAPI JWT tokens with MongoDB user collection for session management.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="features-card">
            <div className="features-icon-wrapper-purple">
              <svg className="features-icon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h4 className="features-card-title">Export & Deploy</h4>
            <p className="features-card-desc">
              Download your project as a ZIP archive or deploy directly from the File Manager Service.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;