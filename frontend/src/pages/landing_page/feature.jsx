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
            End-to-end AI web(Prototype) builder with real-time logs, live preview, and one-click export.
          </p>
        </div>

        {/* Features Grid */}
        <div className="features-grid">

          {/* Feature 1 */}
          <div className="features-card">
            <div className="features-icon-wrapper-purple">
              🚀
            </div>
            <h4 className="features-card-title">Multi-Agent AI Pipeline</h4>
            <p className="features-card-desc">
              Requirement, Planner, and Coding agents work in sequence to transform your idea into production-ready code.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="features-card">
            <div className="features-icon-wrapper-cyan">
              📊
            </div>
            <h4 className="features-card-title">Real-Time Build Logs</h4>
            <p className="features-card-desc">
              WebSocket-powered live streaming of agent progress, token usage, and file generation events.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="features-card">
            <div className="features-icon-wrapper-green">
              👨‍💻
            </div>
            <h4 className="features-card-title">Live Code Preview</h4>
            <p className="features-card-desc">
              Sandboxed iframe renders your generated HTML/CSS/JS instantly as each file is produced.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="features-card">
            <div className="features-icon-wrapper-orange">
              🧠
            </div>
            <h4 className="features-card-title">Local LLM Support</h4>
            <p className="features-card-desc">
              Powered by Ollama running Llama 3 or Mistral locally — your code never leaves your machine.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="features-card">
            <div className="features-icon-wrapper-pink">
              🔑
            </div>
            <h4 className="features-card-title">JWT Authentication</h4>
            <p className="features-card-desc">
              Secure login backed by FastAPI JWT tokens with MongoDB user collection for session management.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="features-card">
            <div className="features-icon-wrapper-purple">
                💻
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