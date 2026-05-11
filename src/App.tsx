import './App.css'
import { MultiPane } from './Layout'
import Geometry from './Geometry'
import Diagram from './Diagram'
import Graph from './Graph.tsx'
import { useState } from 'react'
import type { configT } from './Types'
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
      emptyWeight: 1700
    },
    seats: [{
      id: crypto.randomUUID(),
      name: "Pilot Seat",
      arm: 0,
      seatCount: 1,
      lateralDist: 0,
      maxWeight: 300
    }],
    cargoAreas: [],
    limits: {
      regions: [{
        name: "",
        id: crypto.randomUUID(),
        color: '#FFFFFF',
        data: [
          {id: crypto.randomUUID(), arm: 30, weight: 1400},
          {id: crypto.randomUUID(), arm: 30, weight: 2000},
          {id: crypto.randomUUID(), arm: 35, weight: 2550},
          {id: crypto.randomUUID(), arm: 50, weight: 2550},
          {id: crypto.randomUUID(), arm: 50, weight: 1400}
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

  const [selectedPanel, setSelectedPanel] = useState(0);

  return (
    <section id="content">
      <div id="split">
        <div id='leftPanel'>
          <MultiPane selected={selectedPanel} setSelected={setSelectedPanel}>
            <Geometry name={"Geometry"} config={config} setConfig={setConfigSpecial} />
            <div name={"Seats/Cargo"}>
              <h2>Seats</h2>
              <SeatConfig config={config} setConfig={setConfigSpecial} />
              <h2>Cargo</h2>
              <CargoConfig config={config} setConfig={setConfigSpecial} />
            </div>
            <Equipment name={"Equipment"} config={config} setConfig={setConfigSpecial} />
            <AircraftConfigs name={"Configs"} config={config} setConfig={setConfigSpecial} selectedConfig={selectedConfig} setSelectedConfig={setSelectedConfig} />
            <AircraftOperationConfig name={"Ops Config"} config={config} setConfig={setConfigSpecial} selectedConfig={selectedConfig} setSelectedConfig={setSelectedConfig} />
          </MultiPane>
        </div>
        <div id='rightPanel'>
          <div id='graphHolder'>
            <Graph config={config} selectedConfig={selectedPanel >= 3 ? selectedConfig : undefined}/>
          </div>
          <div id='diagramHolder'>
            <Diagram config={config} selectedConfig={selectedConfig} filter={selectedPanel >= 3} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default App;
