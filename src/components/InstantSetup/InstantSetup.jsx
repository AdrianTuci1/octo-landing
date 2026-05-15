import './InstantSetup.css';

const InstantSetup = () => {
  return (
    <section className="setup-section">
      <div className="setup-container">
        <div className="label-wrapper">
          <span className="section-label">INSTANT SETUP</span>
        </div>
        
        <h2 className="setup-title">
          Run a single command to<br />
          launch Octomus and start<br />
          shipping faster.
        </h2>

        {/* The background starts mid-title */}
        <div className="setup-bg-box">
          <div className="setup-content-bottom">
            <div className="code-box">
              <code className="code-content">
                brew install --cask octomus
              </code>
              <button className="copy-button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>

            <div className="setup-description">
              A terminal-native workspace that runs on 
              <span className="tag">
                <span>Local machine</span>
              </span>, 
              scales to 
              <span className="tag">
                <span>Cloud agents</span>
              </span>, 
              works with 
              <span className="tag">
                <span>Claude, Codex, Gemini</span>
              </span>, 
              and keeps 
              <span className="tag">
                <span>the full editor</span>
              </span> 
              in the same flow, with smart completions, natural-language agents, and parallel execution built in.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstantSetup;
