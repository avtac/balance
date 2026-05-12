import './App.css'
import { MultiPane } from './Layout'
import Geometry from './Geometry'
import Diagram from './Diagram'
import Graph from './Graph.tsx'
import { useMemo, useState } from 'react'
import type { configT, operationConfigT } from './Types'
import { SeatConfig } from './Seats'
import { CargoConfig } from './Cargo'
import { Equipment } from './Equipment'
import AircraftConfigs from './Config'
import AircraftOperationConfig from './BOW.tsx'

function App() {
  const defaultValue: configT = {
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
          {id: crypto.randomUUID(), arm: 30, weight: 1400},
          {id: crypto.randomUUID(), arm: 30, weight: 2000},
          {id: crypto.randomUUID(), arm: 35, weight: 2550},
          {id: crypto.randomUUID(), arm: 50, weight: 2550},
          {id: crypto.randomUUID(), arm: 50, weight: 1400}
        ]},
        {
        name: "Utility",
        id: crypto.randomUUID(),
        color: '#4294FF',
        data: [
          {id: crypto.randomUUID(), arm: 30, weight: 1400},
          {id: crypto.randomUUID(), arm: 30, weight: 2000},
          {id: crypto.randomUUID(), arm: 31.85, weight: 2200},
          {id: crypto.randomUUID(), arm: 34, weight: 2200},
          {id: crypto.randomUUID(), arm: 34, weight: 1400}
        ]}

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
        config: undefined,
        name: "Standard",
        seats: [],
        cargoAreas: []
    }]
  };

  const storageConfig = JSON.parse(localStorage.getItem("config"));

  const [config, setConfig] = useState(storageConfig ?? defaultValue);
  // const [config, setConfig] = useState(defaultValue);

  function setConfigSpecial(value: configT) {
    localStorage.setItem("config", JSON.stringify(value));
    setConfig(value);
  }

  const [selectedConfig, setSelectedConfig] = useState(config.aircraftConfigs.length > 0 ? config.aircraftConfigs[0].id : "");
  const [selectedOpsConfig, setSelectedOpsConfig] = useState(config.operationConfigs.length > 0 ? config.operationConfigs[0].id : "")

  const [selectedPanel, setSelectedPanel] = useState(0);

  function setOpsConfig(opsConfigId: string) {
    setSelectedOpsConfig(opsConfigId);
    const oI = config.operationConfigs.findIndex(c => c.id === opsConfigId);
    if (oI >= 0 && config.operationConfigs[oI].config != selectedConfig)
      setSelectedConfig(config.operationConfigs[oI].config);
  }

  useMemo(() => {
    if (selectedPanel === 4) {
      const opsConfigIndex = config.operationConfigs.findIndex((c: operationConfigT) => c.id === selectedOpsConfig);
      // Set the selected config to the one being used by the ops config
      if (opsConfigIndex >= 0 && config.operationConfigs[opsConfigIndex].config)
        setSelectedConfig(config.operationConfigs[opsConfigIndex].config);
    }
  }, [selectedPanel]);

  return (
    <section id="content">
      <div id="split">
        <div id='leftPanel'>
          <MultiPane selected={selectedPanel} setSelected={setSelectedPanel}>
            <Geometry name={"Geometry"} config={config} setConfig={setConfigSpecial} />
            <div name={"Seats/Cargo"}>
              <SeatConfig config={config} setConfig={setConfigSpecial} />
              <CargoConfig config={config} setConfig={setConfigSpecial} />
            </div>
            <Equipment name={"Equipment"} config={config} setConfig={setConfigSpecial} />
            <AircraftConfigs name={"Configs"} config={config} setConfig={setConfigSpecial} selectedConfig={selectedConfig} setSelectedConfig={setSelectedConfig} />
            <AircraftOperationConfig 
              name={"Ops Config"}
              config={config}
              setConfig={setConfigSpecial}
              selectedConfig={selectedConfig}
              setSelectedConfig={setSelectedConfig}
              selectedOpsConfig={selectedOpsConfig}
              setSelectedOpsConfig={setOpsConfig}/>
          </MultiPane>
        </div>
        <div id='rightPanel'>
          <div id='graphHolder'>
            <Graph
              config={config}
              selectedConfig={selectedPanel >= 3 ? selectedConfig : undefined}
              selectedOpsConfig={selectedPanel === 4 ? selectedOpsConfig : undefined}/>
          </div>
          <div id='diagramHolder'>
            <Diagram 
              config={config}
              selectedPanel={selectedPanel}
              selectedConfig={selectedConfig}
              selectedOpsConfig={selectedOpsConfig} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default App;
