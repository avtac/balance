import type { ReactNode } from 'react';
import './Header.css'

function Header(): ReactNode {
  const title = "Teeter"
  return (
    <header id='header'>
      <button onClick={() => window.location.href = '/'}>Home</button>
      <h1>{title}</h1>
    </header>
  );
}

export default Header;
