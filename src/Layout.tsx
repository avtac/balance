import { Children, isValidElement, useState, type ReactNode } from 'react';
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

function Grouping({children}) {
  return (
    <div className='grouping'>
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

function MultiPane({ selected = undefined, setSelected = undefined, children }) {
  if (!selected && !setSelected)
    [selected, setSelected] = useState(0);

  function addButton(child: ReactNode, index: number) {
    if (!isValidElement(child)) return;

    let name = child.props.name ?? 'Missing Component Name';
    return <button
              className={'topButton' + (selected === index ? ' selected' : '')}
              onClick={() => setSelected(index)}>
              {name}
            </button>
  }

  return (
    <div className='multiPane'>
      <div id='topBar'>
        {Children.map(children, addButton)}
      </div>
      <div id='body'>
        {Children.map(children, (child: ReactNode, index: number) => {
          return index === selected && child;
        })}
      </div>
    </div>
  );
}

export { Region, Subregion, HorizontalRegion, VerticalRegion, Grouping, MultiPane }
