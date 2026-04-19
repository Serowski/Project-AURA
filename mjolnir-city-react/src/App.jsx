import TopBar from './components/layout/TopBar.jsx';
import SectionTabs from './components/common/SectionTabs.jsx';
import AlertTicker from './components/common/AlertTicker.jsx';
import PageHeader from './components/panels/PageHeader.jsx';
import SensorsTab from './components/tabs/SensorsTab.jsx';
import ChartsTab from './components/tabs/ChartsTab.jsx';
import MapTab from './components/tabs/MapTab.jsx';
import { useSensors } from './context/SensorsContext.jsx';
import { classifyFrost } from './utils/thresholdCheck.js';

// Register Chart.js once at startup.
import './components/charts/chartTheme.js';

export default function App() {
  const { activeTab, setActiveTab, alertTicker, kpi } = useSensors();
  const frost = classifyFrost(kpi);

  return (
    <div className={`app ${frost !== 'OPTIMAL' ? 'app--critical-frost' : ''}`}>
      <img
        src="/images/bg-main-page.jpg"
        alt=""
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          objectPosition: 'center 15%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(16,18,22,0.72), rgba(16,18,22,0.85))',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <div className="critical-overlay" aria-hidden />
      <TopBar />

      <main className="main">
        <AlertTicker alert={alertTicker} />
        <PageHeader />
        <SectionTabs active={activeTab} onChange={setActiveTab} />

        {activeTab === 'sensors' && <SensorsTab />}
        {activeTab === 'charts'  && <ChartsTab />}
        {activeTab === 'map'     && <MapTab />}
      </main>
    </div>
  );
}
