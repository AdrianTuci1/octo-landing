import './CTASection.css';

const CTASection = () => {
  return (
    <section className="download-section">
      <div className="download-container">
        <div className="download-header">
          <span className="download-label">ALL DOWNLOADS</span>
          <h2 className="download-title">Get Octomus today</h2>
          <p className="download-subtitle">
            Uncompromising power, zero cost. Octomus is free to download and built to stay that way forever.
          </p>
        </div>

        <div className="download-grid">
          {/* Mac Column */}
          <div className="download-col">
            <div className="os-header">
              <svg className="os-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.39 5.98.67 7.28-.62 1.57-1.42 3.12-2.72 4.93zm-4.41-13.43c-.04-3.56 2.96-6.55 6.46-6.85.34 3.73-3.11 6.84-6.46 6.85z" />
              </svg>
              <h3 className="os-name">Mac</h3>
            </div>
            <div className="download-main-card">
              <span className="file-type">macOS</span>
              <span className="version-info">Version 10.14+</span>
            </div>
            <div className="terminal-command">
              <span className="command-text">$ BREW INSTALL --CASK OCTOMUS</span>
              <svg className="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </div>
          </div>

          {/* Linux Column */}
          <div className="download-col">
            <div className="os-header">
              <img src="/os/linux.png" alt="Linux" className="os-icon-img" />
              <h3 className="os-name">Linux</h3>
            </div>
            <div className="multi-download-cards">
              <div className="download-main-card half">
                <span className="file-type">.deb</span>
                <span className="version-info">Debian, Ubuntu</span>
              </div>
              <div className="download-main-card half">
                <span className="file-type">.rpm</span>
                <span className="version-info">Red Hat, Fedora, SUSE</span>
              </div>
            </div>
            <div className="other-formats">
              <div className="format-row">
                <span>.deb</span>
                <div className="arch-btns">
                  <button>x64</button>
                  <button>ARM64</button>
                </div>
              </div>
              <div className="format-row">
                <span>.rpm</span>
                <div className="arch-btns">
                  <button>x64</button>
                  <button>ARM64</button>
                </div>
              </div>
              <div className="format-row">
                <span>.tar.zst <small>Arch Linux</small></span>
                <div className="arch-btns">
                  <button>x64</button>
                  <button>ARM64</button>
                </div>
              </div>
              <div className="format-row">
                <span>AppImage</span>
                <div className="arch-btns">
                  <button>x64</button>
                  <button>ARM64</button>
                </div>
              </div>
            </div>
          </div>

          {/* Windows Column */}
          <div className="download-col">
            <div className="os-header">
              <svg className="os-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.451H0m11.25-9.658L24 0v11.549H11.25M0 12.451h9.75V21.9L0 20.551m11.25-8.1V24L24 21.899V12.451" />
              </svg>
              <h3 className="os-name">Windows</h3>
            </div>
            <div className="multi-download-cards">
              <div className="download-main-card half">
                <span className="file-type">.exe</span>
                <span className="version-info">Windows 11/10 x64</span>
              </div>
              <div className="download-main-card half">
                <span className="file-type">.exe</span>
                <span className="version-info">Windows 11/10 ARM64</span>
              </div>
            </div>
            <div className="terminal-command">
              <span className="command-text">$ WINGET INSTALL OCTOMUS</span>
              <svg className="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </div>
            <div className="other-formats">
              <div className="format-row">
                <span>.exe</span>
                <div className="arch-btns">
                  <button>x64</button>
                  <button>ARM64</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
