import './App.css'
import Diagram from './Diagram.tsx'

function Region({children}) {
  return (
    <div className='region'>
      {children}
    </div>
  );
}

function HorizontalRegion({children, fraction="1fr"}) {
  return (
    <div className='horizontalRegion' style={{ '--fraction': fraction }}>
      {children}
    </div>
  );
}

function VerticalRegion({children, fraction="1fr"}) {
  return (
    <div className='verticalRegion' style={{ '--fraction': fraction }}>
      {children}
    </div>
  );
}

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
