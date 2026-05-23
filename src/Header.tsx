import type { ReactNode } from 'react';
import './Header.css'

function Header(): ReactNode {
  const title = "Teeter"
  return (
    <header id='header'>
      <div>
        <button onClick={() => window.location.href = '/'}>Home</button>
        <button onClick={() => window.location.href = '/config'}>Config</button>
      </div>
      <h1>{title}</h1>
    </header>
  );
}

export default Header;
