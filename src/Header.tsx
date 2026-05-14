import type { ReactNode } from 'react';
import './Header.css'

function Header(): ReactNode {
  const title = "Teeter Config"
  return (
    <header id='header'>
      <h1>{title}</h1>
    </header>
  );
}

export default Header;
