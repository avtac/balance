import './App.css'
import { Region, HorizontalRegion, VerticalRegion } from './Layout.tsx'
import Diagram from './Diagram.tsx'

function App() {
  return (
    <section id="content">
      <HorizontalRegion fraction={"1.2fr"}>
        <Region>
        </Region>
        <VerticalRegion fraction={"2.0fr"}>
          <Region>
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
