import { Children, isValidElement, useState, type ReactNode } from 'react';
import { type nameProps } from './Types.ts'
import './Layout.css'

interface childrenProps {
  children: ReactNode
}

function Region({ children }: childrenProps) {
  return (
    <div className='region'>
      <div className='internalPadding'>
        {children}
      </div>
    </div>
  );
}

interface subregionProps extends childrenProps {
  name?: string,
  id?: string,
}

function Subregion({ children, name, id }: subregionProps) {
  name;
  return (
    <div className='subregion'>
      <div className='internalPadding' id={id}>
        {children}
      </div>
    </div>
  );
}

function Grouping({ children }: childrenProps) {
  return (
    <div className='grouping'>
      {children}
    </div>
  );
}

interface splitRegionProps extends childrenProps {
  fraction: string
}

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

function HorizontalRegion({ children, fraction = "1fr" }: splitRegionProps) {
  return (
    <div className='horizontalRegion' style={{ '--fraction': fraction }}>
      {children}
    </div>
  );
}

function VerticalRegion({ children, fraction = "1fr" }: splitRegionProps) {
  return (
    <div className='verticalRegion' style={{ '--fraction': fraction }}>
      {children}
    </div>
  );
}

interface MultiPaneProps extends childrenProps {
  selected?: number,
  setSelected?: (arg0: number) => void;
}

function MultiPane({ selected, setSelected, children }: MultiPaneProps) {
  if (!selected && !setSelected)
    [selected, setSelected] = useState(0);

  function addButton(child: ReactNode, index: number) {
    if (!isValidElement(child)) return;
    if (!setSelected) return;
    if (!child.props) return;

    const props = child.props as nameProps
    const name = props.name ?? 'Missing Component Name';
    return <button
      className={'topButton' + (selected === index ? ' selected' : '')}
      onClick={() => setSelected(index)}>
      {name}
    </button>
  }

  return (
    <div className='multiPane internalPadding'>
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
