import TopBar from './components/layout/TopBar.jsx';
import SectionTabs from './components/common/SectionTabs.jsx';
import AlertTicker from './components/common/AlertTicker.jsx';
import PageHeader from './components/panels/PageHeader.jsx';
import SensorsTab from './components/tabs/SensorsTab.jsx';
import ChartsTab from './components/tabs/ChartsTab.jsx';
import MapTab from './components/tabs/MapTab.jsx';
import { useSensors } from './context/SensorsContext.jsx';

// Register Chart.js once at startup.
import './components/charts/chartTheme.js';

export default function App() {
  const { activeTab, setActiveTab, alertTicker } = useSensors();

  return (
    <div className="app">
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
