import './App.css'
import { Region, HorizontalRegion, VerticalRegion } from './Layout.tsx'
import Geometry from './Geometry.tsx'
import Diagram from './Diagram.tsx'
import Graph from './Graph.tsx'
import { useState } from 'react'
import type { configT } from './Types.tsx'

function App() {
  const defaultValue: configT = {
    seats: [],
    cargoAreas: [],
    limits: {
      regions: [{
        name: "",
        id: crypto.randomUUID(),
        data: [
          {arm: 30, weight: 1400},
          {arm: 30, weight: 2000},
          {arm: 35, weight: 2550},
          {arm: 50, weight: 2550},
          {arm: 50, weight: 1400}
        ]}
      ],
      limits: []
    }
  };

  const [config, setConfig] = useState(defaultValue);

  return (
    <section id="content">
      <HorizontalRegion fraction={"1.2fr"}>
        <Region>
          <Geometry config={config} setConfig={setConfig} />
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
