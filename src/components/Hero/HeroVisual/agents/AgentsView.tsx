import './AgentsView.css';
import { ChevronDown, Search, CheckCircle2, Circle, Moon, GitBranch, Sparkles } from 'lucide-react';

type Run = {
  id: string;
  title: string;
  timeLabel: string;
  source: string;
  credits: number;
  status: 'completed' | 'running' | 'idle';
  userInitials: string;
  environment: string;
  artifact: string;
};

const mockRuns: Run[] = [
  {
    id: '1',
    title: 'Refactor billing webhook retries',
    timeLabel: 'now',
    source: 'Interactive',
    credits: 1.2,
    status: 'running',
    userInitials: 'A',
    environment: 'octomus/main',
    artifact: 'Preview'
  },
  {
    id: '2',
    title: 'Add dashboard empty states',
    timeLabel: '12 min ago',
    source: 'Interactive',
    credits: 3.8,
    status: 'completed',
    userInitials: 'M',
    environment: 'web/app-shell',
    artifact: 'PR draft'
  },
  {
    id: '3',
    title: 'Investigate flaky checkout spec',
    timeLabel: '38 min ago',
    source: 'Scheduled',
    credits: 2.4,
    status: 'completed',
    userInitials: 'R',
    environment: 'ci/playwright',
    artifact: 'Trace'
  },
  {
    id: '4',
    title: 'Generate migration for team roles',
    timeLabel: '1 hour ago',
    source: 'GitHub issue',
    credits: 5.1,
    status: 'completed',
    userInitials: 'N',
    environment: 'api/postgres',
    artifact: 'Patch'
  },
  {
    id: '5',
    title: 'Prepare release notes for v0.12',
    timeLabel: '2 hours ago',
    source: 'Slack',
    credits: 0.8,
    status: 'idle',
    userInitials: 'L',
    environment: 'docs',
    artifact: 'Draft'
  }
];

type AgentsViewProps = {
  activeMenu?: boolean;
  selectedRunId?: string;
};

export function AgentsView({ activeMenu = false, selectedRunId }: AgentsViewProps) {
  return (
    <div className="agents-view" aria-hidden="true">
      <header className="agents-header">
        <div>
          <h1 className="agents-title">Runs</h1>
          <p className="agents-subtitle">Live autonomous work across repos and tasks</p>
        </div>
        <div className="agents-header-actions">
          <button className="agents-btn-secondary">Get started</button>
          <button className="agents-btn-primary">New agent</button>
        </div>
      </header>

      <div className="agents-filters-bar">
        <div className="agents-filters-group">
          <div className={`filter-item ${activeMenu ? 'filter-item-active' : ''}`}>
            <span>Status: All</span>
            <ChevronDown size={14} />
            {activeMenu && (
              <div className="agents-menu-popover">
                <button><CheckCircle2 size={13} /> Completed</button>
                <button><Moon size={13} /> Running</button>
                <button><Circle size={13} /> Idle</button>
              </div>
            )}
          </div>
          <div className="filter-item">
            <span>Source: All</span>
            <ChevronDown size={14} />
          </div>
          <div className="filter-item">
            <span>Created on: All</span>
            <ChevronDown size={14} />
          </div>
          <div className="filter-item">
            <span>Has artifact: All</span>
            <ChevronDown size={14} />
          </div>
          <div className="filter-item">
            <span>Environment: All</span>
            <ChevronDown size={14} />
          </div>
        </div>
        <div className="agents-search-wrapper">
          <Search size={14} className="search-icon" />
          <input type="text" placeholder="Search" />
        </div>
      </div>

      <div className="agents-runs-list">
        {mockRuns.map((run) => (
          <div key={run.id} className={`run-card ${selectedRunId === run.id ? 'run-card-selected' : ''}`}>
            <div className="run-card-icon">
              {run.status === 'completed' ? (
                <div className="status-icon-completed-wrapper">
                  <CheckCircle2 size={16} />
                </div>
              ) : run.status === 'running' ? (
                <div className="status-icon-running-wrapper">
                  <Moon size={14} fill="currentColor" />
                </div>
              ) : (
                <Circle size={16} className="status-icon-idle" />
              )}
            </div>

            <div className="run-card-content">
              <div className="run-card-top">
                <span className="run-card-title">{run.title}</span>
                <div className="run-card-right">
                  <span className="run-artifact"><Sparkles size={12} /> {run.artifact}</span>
                  <span className="run-card-time">{run.timeLabel}</span>
                  <div className="run-user-avatar">{run.userInitials}</div>
                </div>
              </div>
              <div className="run-card-metadata">
                <span>Source: {run.source}</span>
                <span><GitBranch size={12} /> {run.environment}</span>
                <span>Credits used: {run.credits} credits</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
