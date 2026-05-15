import './GpuProfiling.css';
import GpuBackgroundBox from './GpuBackgroundBox';


const GpuProfiling = () => {
  return (
    <section className="gpu-section">
      <GpuBackgroundBox />
      <div className="gpu-container">
        <div className="gpu-top-label">
          SPOTLIGHT LAUNCHER
        </div>

        <div className="gpu-content-top">
          <h2 className="gpu-title">
            A terminal launcher built for speed, context, and control.
          </h2>
          <div className="gpu-description-box">
            <p className="gpu-text">
              Octomus gives you Spotlight-style search, intelligent command suggestions, and an easy switch into agent mode when you want the task handled for you. <a href="#learn" style={{color: 'var(--text-primary)', textDecoration: 'none'}}>Learn more →</a>
            </p>
            <div className="gpu-logos">
              <div className="gpu-logo-item">
                <span>Commands</span>
              </div>
              <div className="gpu-logo-item">
                <span>Autocomplete</span>
              </div>
              <div className="gpu-logo-item">
                <span>Agents</span>
              </div>
            </div>
          </div>
        </div>

        <div className="gpu-dashboard-placeholder">
          <div className="dashboard-nav">
            <div className="dash-nav-item">Launcher</div>
            <div className="dash-nav-item">Autocomplete</div>
            <div className="dash-nav-item active">Agent Mode</div>
            <div className="dash-nav-item">Editor</div>
          </div>
          <div className="dashboard-main">
            <div className="chart-placeholder">
              <div className="chart-line" style={{height: '40%'}}></div>
            </div>
            <div className="chart-placeholder">
              <div className="chart-line" style={{height: '30%', borderTopColor: '#10b981'}}></div>
            </div>
          </div>
        </div>
      </div>
    </section>

  );
};

export default GpuProfiling;
