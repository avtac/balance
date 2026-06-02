import type { ReactNode } from 'react';
import './Header.css'

function Header(): ReactNode {
  const title = "Balancr"
  return (
    <header id='header'>
      <nav>
        <button onClick={() => window.location.href = '/'}>Home</button>
        <button onClick={() => window.location.href = '/config'}>Config</button>
      </nav>
      <h1>
        <img src="/favicon.svg" alt={title + ' Icon'} />
        <span>{title}</span>
      </h1>
    </header>
  );
}

export default Header;
