import './Layout.css'

function Region({children}) {
  return (
    <div className='region'>
      {children}
    </div>
  );
}

function Subregion({children}) {
  return (
    <div className='subregion'>
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

export { Region, Subregion, HorizontalRegion, VerticalRegion }
