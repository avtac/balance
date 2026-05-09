import './App.css'
import { Region, HorizontalRegion, VerticalRegion } from './Layout.tsx'
import Geometry from './Geometry.tsx'
import Diagram from './Diagram.tsx'
import Graph from './Graph.tsx'
import { useState } from 'react'
import type { configT } from './Types.tsx'

function App() {
  const defaultValue: configT = {
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
    }
  };

  const storageConfig = JSON.parse(localStorage.getItem("config"));

  const [config, setConfig] = useState(storageConfig ?? defaultValue);
  // const [config, setConfig] = useState(defaultValue);

  function setConfigSpecial(value: configT) {
    localStorage.setItem("config", JSON.stringify(value));
    setConfig(value);
  }

  return (
    <section id="content">
      <div id="split">
        <div id='leftPanel'>
          <Geometry config={config} setConfig={setConfigSpecial} />
        </div>
        <div id='rightPanel'>
          <div id='graphHolder'>
            <Graph config={config} />
          </div>
          <div id='diagramHolder'>
            <Diagram config={config}/>
          </div>
        </div>
      </div>
    </section>
  )
}

export default App;
