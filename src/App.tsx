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
      <HorizontalRegion fraction={"1.2fr"}>
        <Region>
          <Geometry config={config} setConfig={setConfigSpecial} />
        </Region>
        <VerticalRegion fraction={"2.0fr"}>
          <Region>
            <Graph config={config} />
          </Region>
          <Region>
            <Diagram />
          </Region>
        </VerticalRegion>
      </HorizontalRegion>
    </section>
  )
}

export default App;
