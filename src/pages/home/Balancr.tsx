import './Balancr.css'
import { MultiPane } from '../../Layout'
import Diagram from '../../Diagram'
import Graph from '../../Graph.tsx'
import { useMemo, useState } from 'react'
import { type configT, type operationConfigT, DiagramModes, type aircraftT, type aircraftConfigT } from '../../Types'
import Header from '../../Header.tsx'
import Setup from './Setup.tsx'
import { UnitContext } from '../../UnitsContext.tsx'
import Config from './Config.tsx'
import { activeConfigData, uploadedConfigs } from '../../utility.ts'

function checkConfigChanged(activeConfig: configT) {
  const configsStrings = localStorage.getItem(uploadedConfigs);
  if (!configsStrings) return false;
  const configs: { [key: string]: configT } = JSON.parse(configsStrings);
  if (!Object.keys(configs).includes(activeConfig.id)) return false
  const baseConfig = configs[activeConfig.id]

  // Equipment is not checked
  type searchSubset = keyof Pick<aircraftConfigT, "seats" | "cargoAreas" | "fuelTanks">
  const searchItems: searchSubset[] = ['seats', 'cargoAreas', 'fuelTanks'];
  for (let i = 0; i < baseConfig.aircraft.length; i++) {
    for (let j = 0; j < baseConfig.aircraft[i].aircraftConfigs.length; j++) {
      for (const item of searchItems) {
        const base = baseConfig.aircraft[i].aircraftConfigs[j][item];
        const active = activeConfig.aircraft[i].aircraftConfigs[j][item];
        if (base.length !== active.length) return true;
        for (let k = 0; k < base.length; k++) {
          if (!active.includes(base[k])) return true;
          if (!base.includes(active[k])) return true;
        }
      }
    }
  }
  return false;
}

function Balancr() {
  const defaultValue = {} as configT;

  let storageConfig: configT = defaultValue;
  const local = localStorage.getItem(activeConfigData);
  if (local != null)
    storageConfig = JSON.parse(local);

  const [config, setConfig] = useState(storageConfig);
  const [selectedAircraft, setSelectedAircraft] = useState(config.aircraft && config.aircraft.length > 0 ? config.aircraft[0].id : "")
  const aircraftIndex = config.aircraft && config.aircraft.findIndex(a => a.id === selectedAircraft);

  // TODO: Save changes or changed data somewhere else for recall of config data
  // but flag that there have been changes made
  const [selectedConfig, setSelectedConfig] = useState(aircraftIndex >= 0 && config.aircraft[aircraftIndex].aircraftConfigs.length > 0 ? config.aircraft[aircraftIndex].aircraftConfigs[0].id : "");
  const [selectedOpsConfig, setSelectedOpsConfig] = useState(aircraftIndex >= 0 && config.aircraft[aircraftIndex].operationConfigs.length > 0 ? config.aircraft[aircraftIndex].operationConfigs[0].id : "")
  const [selectedPanel, setSelectedPanel] = useState(0);

  useMemo(() => {
    if (config.aircraft && config.aircraft.findIndex(a => a.id === selectedAircraft) < 0)
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
    localStorage.setItem(activeConfigData, JSON.stringify(value));
    setConfig(value);
  }

  function setAircraftSpecial(value: aircraftT): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.aircraft[aircraftIndex] = value;
    localStorage.setItem(activeConfigData, JSON.stringify(tmp));
    setConfig(tmp);
  }

  useMemo(() => {
    if (selectedPanel === 4) {
      const opsConfigIndex = config.aircraft[aircraftIndex].operationConfigs.findIndex((c: operationConfigT) => c.id === selectedOpsConfig);
      // Set the selected config to the one being used by the ops config
      if (opsConfigIndex >= 0 && config.aircraft[aircraftIndex].operationConfigs[opsConfigIndex].config)
        setSelectedConfig(config.aircraft[aircraftIndex].operationConfigs[opsConfigIndex].config);
    }
  }, [selectedPanel]);

  const changed = checkConfigChanged(config)
  return (
    <>
      <Header />
      <section id="content">
        {changed &&
          <div id="changeWarning">
            <p>Config has changed and does not match original</p>
          </div>
        }
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
                  aircraft={config.aircraft && config.aircraft[aircraftIndex]}
                  setAircraft={setAircraftSpecial}
                  selectedOpsConfig={selectedOpsConfig} />
              </MultiPane>
            </div>
            <div id='rightPanel'>
              <div id='graphHolder'>
                <Graph
                  aircraft={config.aircraft && config.aircraft[aircraftIndex]}
                  selectedConfig={selectedConfig}
                  selectedOpsConfig={selectedOpsConfig} />
              </div>
              <div id='diagramHolder'>
                <Diagram
                  aircraft={config.aircraft && config.aircraft[aircraftIndex]}
                  setAircraft={setAircraftSpecial}
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
