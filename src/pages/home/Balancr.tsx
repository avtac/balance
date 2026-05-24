import './Balancr.css'
import { MultiPane } from '../../Layout'
import Diagram from '../../Diagram'
import Graph from '../../Graph.tsx'
import { useMemo, useState } from 'react'
import { type configT, type operationConfigT, DiagramModes } from '../../Types'
import Header from '../../Header.tsx'
import Setup from './Setup.tsx'
import { UnitContext } from '../../UnitsContext.tsx'
import Config from './Config.tsx'

function Balancr() {
  const defaultValue = {} as configT;

  let storageConfig: configT = defaultValue;
  const local = localStorage.getItem("config");
  if (local != null)
    storageConfig = JSON.parse(local);

  const [config, setConfig] = useState(storageConfig);
  const [selectedAircraft, setSelectedAircraft] = useState(config.aircraft.length > 0 ? config.aircraft[0].id : "")
  const aircraftIndex = config.aircraft.findIndex(a => a.id === selectedAircraft);

  const [selectedConfig, setSelectedConfig] = useState(aircraftIndex >= 0 && config.aircraft[aircraftIndex].aircraftConfigs.length > 0 ? config.aircraft[aircraftIndex].aircraftConfigs[0].id : "");
  const [selectedOpsConfig, setSelectedOpsConfig] = useState(aircraftIndex >= 0 && config.aircraft[aircraftIndex].operationConfigs.length > 0 ? config.aircraft[aircraftIndex].operationConfigs[0].id : "")
  const [selectedPanel, setSelectedPanel] = useState(0);

  useMemo(() => {
    if (config.aircraft.findIndex(a => a.id === selectedAircraft) < 0)
      setSelectedAircraftSpecial(config.aircraft[0].id);
    else return;
  }, [config])

  function setSelectedAircraftSpecial(aircraftId: string): void {
    if (aircraftId === selectedAircraft) return;
    setSelectedAircraft(aircraftId);

    const selectedAircraftIndex = config.aircraft.findIndex(a => a.id === aircraftId);
    if (selectedAircraftIndex < 0) return;
    const aircraft = config.aircraft[selectedAircraftIndex];

    setSelectedOpsConfig(aircraft.operationConfigs.length > 0 ? aircraft.operationConfigs[0].id : "");
    setSelectedConfig(aircraft.aircraftConfigs.length > 0 ? aircraft.operationConfigs[0].config : "");
  }

  function setSelectedOpsConfigSpecial(opsConfigId: string): void {
    if (opsConfigId === selectedOpsConfig) return;
    const selectedAircraftIndex = config.aircraft.findIndex(a => a.id === selectedAircraft);
    if (selectedAircraftIndex < 0) return;

    const aircraft = config.aircraft[selectedAircraftIndex];
    const selectedOpsConfigIndex = aircraft.operationConfigs.findIndex(o => o.id === opsConfigId);
    if (selectedOpsConfigIndex < 0) return;

    setSelectedOpsConfig(opsConfigId);
    setSelectedConfig(aircraft.operationConfigs[selectedOpsConfigIndex].config);
  }

  function setConfigSpecial(value: configT): void {
    localStorage.setItem("config", JSON.stringify(value));
    setConfig(value);
  }

  useMemo(() => {
    if (selectedPanel === 4) {
      const opsConfigIndex = config.aircraft[aircraftIndex].operationConfigs.findIndex((c: operationConfigT) => c.id === selectedOpsConfig);
      // Set the selected config to the one being used by the ops config
      if (opsConfigIndex >= 0 && config.aircraft[aircraftIndex].operationConfigs[opsConfigIndex].config)
        setSelectedConfig(config.aircraft[aircraftIndex].operationConfigs[opsConfigIndex].config);
    }
  }, [selectedPanel]);

  return (
    <>
      <Header />
      <section id="content">
        <UnitContext value={config.setup}>
          <div id="split">
            <div id='leftPanel'>
              <MultiPane selected={selectedPanel} setSelected={setSelectedPanel}>
                <Setup
                  name={"Setup"}
                  config={config}
                  setConfig={setConfigSpecial}
                  selectedAircraft={selectedAircraft}
                  setSelectedAircraft={setSelectedAircraftSpecial}
                  selectedOpsConfig={selectedOpsConfig}
                  setSelectedOpsConfig={setSelectedOpsConfigSpecial} />
                <Config
                  name={"Config"}
                  aircraft={config.aircraft[aircraftIndex]}
                  selectedOpsConfig={selectedOpsConfig} />
              </MultiPane>
            </div>
            <div id='rightPanel'>
              <div id='graphHolder'>
                <Graph
                  aircraft={config.aircraft[aircraftIndex]}
                  selectedConfig={selectedConfig}
                  selectedOpsConfig={selectedOpsConfig} />
              </div>
              <div id='diagramHolder'>
                <Diagram
                  aircraft={config.aircraft[aircraftIndex]}
                  diagramMode={selectedPanel >= 0 ? DiagramModes.Ops : DiagramModes.All}
                  selectedConfig={selectedConfig}
                  selectedOpsConfig={selectedOpsConfig} />
              </div>
            </div>
          </div>
        </UnitContext>
      </section>
    </>
  )
}

export default Balancr;
