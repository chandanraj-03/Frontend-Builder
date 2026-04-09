import React from 'react';
import './workflow.css';

const Workflow = () => {
  return (
    <section className="workflow-section" id="workflow">
      <div className="workflow-container">

        {/* Header content */}
        <div className="workflow-header">
          <h3 className="workflow-subtitle">
            Agent Pipeline
          </h3>
          <h2 className="workflow-title">
            The 7-Stage Workflow
          </h2>
          <p className="workflow-header-desc">
            A sequential AI compiler pipeline where each agent transforms
            structured JSON output into progressively refined artifacts.
            Every stage feeds deterministically into the next.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="workflow-grid">

          {/* Step 0: Input */}
          <div className="workflow-step group">
            <div className="workflow-connector"></div>
            <div className="workflow-step-label-1">Stage 0</div>
            <h4 className="workflow-step-title">Input</h4>
            <p className="workflow-step-desc">
              Provide a free-text prompt, select a model, and optionally apply a color theme.
            </p>
            <span className="workflow-agent-badge">User Context</span>
          </div>

          {/* Step 1: Conversation */}
          <div className="workflow-step group">
            <div className="workflow-connector"></div>
            <div className="workflow-step-label-2">Stage 1</div>
            <h4 className="workflow-step-title">Conversation</h4>
            <p className="workflow-step-desc">
              Parses user intent, identifies the application type, and determines complexity.
            </p>
            <span className="workflow-agent-badge">Conversation Agent</span>
          </div>

          {/* Step 2: Requirements */}
          <div className="workflow-step group">
            <div className="workflow-connector"></div>
            <div className="workflow-step-label-3">Stage 2</div>
            <h4 className="workflow-step-title">Requirements</h4>
            <p className="workflow-step-desc">
              Organizes extracted features into functional, UX, and non-functional requirements.
            </p>
            <span className="workflow-agent-badge">Requirement Agent</span>
          </div>

          {/* Step 3: Page Discovery */}
          <div className="workflow-step group">
            {/* Note: Connector hidden on 4th item of visual row to prevent overflow */}
            <div className="workflow-step-label-4">Stage 3</div>
            <h4 className="workflow-step-title">Page Discovery</h4>
            <p className="workflow-step-desc">
              Determines all necessary pages, components, and navigational links.
            </p>
            <span className="workflow-agent-badge">Page Discovery Agent</span>
          </div>

          {/* Step 4: Planning */}
          <div className="workflow-step group">
            <div className="workflow-connector"></div>
            <div className="workflow-step-label-5">Stage 4</div>
            <h4 className="workflow-step-title">Planning</h4>
            <p className="workflow-step-desc">
              Designs folder architecture and produces a comprehensive file manifest.
            </p>
            <span className="workflow-agent-badge">Planning Agent</span>
          </div>

          {/* Step 5: Code Generation */}
          <div className="workflow-step group">
            <div className="workflow-connector"></div>
            <div className="workflow-step-label-6">Stage 5</div>
            <h4 className="workflow-step-title">Code Gen</h4>
            <p className="workflow-step-desc">
              Specialized CSS, HTML, and JS agents generate and write files to disk.
            </p>
            <span className="workflow-agent-badge">Code Agent</span>
          </div>

          {/* Step 6: Post-build */}
          <div className="workflow-step group">
            <div className="workflow-step-label-7">Stage 6</div>
            <h4 className="workflow-step-title">Post-Build</h4>
            <p className="workflow-step-desc">
              Creates README.md, generates ZIP export, and opens live preview server.
            </p>
            <span className="workflow-agent-badge">Readme Agent</span>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Workflow;