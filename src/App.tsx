import './App.css'
import { MultiPane } from './Layout'
import Geometry from './Geometry'
import Diagram from './Diagram'
import Graph from './Graph.tsx'
import { useMemo, useState } from 'react'
import type { configT, aircraftT, operationConfigT } from './Types'
import { SeatConfig } from './Seats'
import { CargoConfig } from './Cargo'
import { Equipment } from './Equipment'
import AircraftConfigs from './Config'
import AircraftOperationConfig from './BOW'
import Header from './Header.tsx'
import AircraftConfig from './Aircraft.tsx'

function App() {
  const defaultValue: configT = {
    aircraft: [{
      id: crypto.randomUUID(),
      config: {
        tailNumber: "",
        type: "",
        emptyArm: 32,
        emptyWeight: 1450
      },
      seats: [{
        id: crypto.randomUUID(),
        name: "Pilot Seat",
        arm: 35,
        seatCount: 2,
        lateralDist: 0,
        maxWeight: 200
      }, {
        id: crypto.randomUUID(),
        name: "Back Seat",
        arm: 54,
        seatCount: 2,
        lateralDist: 0,
        maxWeight: 200
      }],
      cargoAreas: [{
        arm: 73,
        id: crypto.randomUUID(),
        name: "C 1",
        maxWeight: 75
      }, {
        arm: 91,
        id: crypto.randomUUID(),
        name: "C 2",
        maxWeight: 25
      }, {
        arm: 54,
        id: crypto.randomUUID(),
        name: "C 3",
        maxWeight: 225
      }],
      limits: {
        regions: [{
          name: "Normal",
          id: crypto.randomUUID(),
          color: '#D11F1F',
          data: [
            { id: crypto.randomUUID(), arm: 30, weight: 1400 },
            { id: crypto.randomUUID(), arm: 30, weight: 2000 },
            { id: crypto.randomUUID(), arm: 35, weight: 2550 },
            { id: crypto.randomUUID(), arm: 50, weight: 2550 },
            { id: crypto.randomUUID(), arm: 50, weight: 1400 }
          ]
        },
        {
          name: "Utility",
          id: crypto.randomUUID(),
          color: '#4294FF',
          data: [
            { id: crypto.randomUUID(), arm: 30, weight: 1400 },
            { id: crypto.randomUUID(), arm: 30, weight: 2000 },
            { id: crypto.randomUUID(), arm: 31.85, weight: 2200 },
            { id: crypto.randomUUID(), arm: 34, weight: 2200 },
            { id: crypto.randomUUID(), arm: 34, weight: 1400 }
          ]
        }

        ],
        limits: []
      },
      equipment: [],
      aircraftConfigs: [{
        id: crypto.randomUUID(),
        name: "Standard",
        seats: [],
        cargoAreas: [],
        equipment: [],
        fuelTanks: []
      }],
      operationConfigs: [{
        id: crypto.randomUUID(),
        config: "",
        name: "Standard",
        seats: [],
        cargoAreas: []
      }]
    }]
  };

  defaultValue.aircraft[0].operationConfigs[0].config = defaultValue.aircraft[0].aircraftConfigs[0].id;

  let storageConfig: configT = defaultValue;
  const local = localStorage.getItem("config");
  if (local != null)
    storageConfig = JSON.parse(local);

  const [config, setConfig] = useState(storageConfig);
  const [selectedAircraft, setSelectedAircraft] = useState(config.aircraft.length > 0 ? config.aircraft[0].id : "")
  const aircraftIndex = config.aircraft.findIndex(a => a.id === selectedAircraft);

  const [selectedConfig, setSelectedConfig] = useState(config.aircraft[aircraftIndex].aircraftConfigs.length > 0 ? config.aircraft[aircraftIndex].aircraftConfigs[0].id : "");
  const [selectedOpsConfig, setSelectedOpsConfig] = useState(config.aircraft[aircraftIndex].operationConfigs.length > 0 ? config.aircraft[aircraftIndex].operationConfigs[0].id : "")
  const [selectedPanel, setSelectedPanel] = useState(0);

  function setSelectedAircraftSpecial(aircraftId: string): void {
    if (aircraftId === selectedAircraft) return;
    setSelectedAircraft(aircraftId);
  }

  function setConfigSpecial(value: configT): void {
    localStorage.setItem("config", JSON.stringify(value));
    setConfig(value);
  }

  function setAircraftSpecial(value: aircraftT): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.aircraft[aircraftIndex] = value;
    localStorage.setItem("config", JSON.stringify(tmp));
    setConfig(tmp);
  }

  function setOpsConfig(opsConfigId: string): void {
    setSelectedOpsConfig(opsConfigId);
    const oI = config.aircraft[aircraftIndex].operationConfigs.findIndex((c: operationConfigT) => c.id === opsConfigId);
    if (oI >= 0 && config.aircraft[aircraftIndex].operationConfigs[oI].config != selectedConfig)
      setSelectedConfig(config.aircraft[aircraftIndex].operationConfigs[oI].config);
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
      <Header aircraft={config.aircraft[aircraftIndex]} setAircraft={setAircraftSpecial} />
      <section id="content">
        <div id="split">
          <div id='leftPanel'>
            <MultiPane selected={selectedPanel} setSelected={setSelectedPanel}>
              <AircraftConfig name={"Aircraft Setup"}
                config={config}
                setConfig={setConfigSpecial}
                selectedAircraft={selectedAircraft}
                setSelectedAircraft={setSelectedAircraftSpecial} />
              <Geometry name={"Geometry"} aircraft={config.aircraft[aircraftIndex]} setAircraft={setAircraftSpecial} />
              <div name={"Seats/Cargo"}>
                <SeatConfig aircraft={config.aircraft[aircraftIndex]} setAircraft={setAircraftSpecial} />
                <CargoConfig aircraft={config.aircraft[aircraftIndex]} setAircraft={setAircraftSpecial} />
              </div>
              <Equipment name={"Equipment"} aircraft={config.aircraft[aircraftIndex]} setAircraft={setAircraftSpecial} />
              <AircraftConfigs name={"Configs"} aircraft={config.aircraft[aircraftIndex]} setAircraft={setAircraftSpecial} selectedConfig={selectedConfig} setSelectedConfig={setSelectedConfig} />
              <AircraftOperationConfig
                name={"Ops Config"}
                aircraft={config.aircraft[aircraftIndex]}
                setAircraft={setAircraftSpecial}
                selectedConfig={selectedConfig}
                setSelectedConfig={setSelectedConfig}
                selectedOpsConfig={selectedOpsConfig}
                setSelectedOpsConfig={setOpsConfig} />
            </MultiPane>
          </div>
          <div id='rightPanel'>
            <div id='graphHolder'>
              <Graph
                aircraft={config.aircraft[aircraftIndex]}
                selectedConfig={selectedPanel >= 4 ? selectedConfig : ""}
                selectedOpsConfig={selectedPanel === 5 ? selectedOpsConfig : ""} />
            </div>
            <div id='diagramHolder'>
              <Diagram
                aircraft={config.aircraft[aircraftIndex]}
                selectedPanel={selectedPanel}
                selectedConfig={selectedConfig}
                selectedOpsConfig={selectedOpsConfig} />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default App;
