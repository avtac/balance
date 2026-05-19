import type { ReactNode } from 'react';
import './Header.css'
import { saveStringToFile } from './utility';
import type { aircraftT } from './Types';

interface headerProps {
  setAircraft: (arg0: aircraftT) => void;
}

function Header({ setAircraft }: headerProps): ReactNode {
  function saveFile() {
    const data = localStorage.getItem("config");
    if (data == undefined) return;
    saveStringToFile(data, "Config.json")
  }

  function openFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ".json";
    input.onchange = function(event) {
      const target = event.target as HTMLInputElement;
      if (!target) return;
      const files = target.files;
      if (!files) return;
      if (files.length > 1) return;
      const fileReader = new FileReader();
      fileReader.readAsText(files[0]);
      fileReader.onload = () => {
        const data: string = fileReader.result as string;
        if (!data) return;
        setAircraft(JSON.parse(data));
        localStorage.setItem('config', data)
      };
    };
    input.click();
  }

  const title = "Teeter Config"
  return (
    <header id='header'>
      <button onClick={openFile}>Open Config</button>
      <h1>{title}</h1>
      <button onClick={saveFile}>Save Config</button>
    </header>
  );
}

export default Header;
