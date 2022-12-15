import { createContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ListUuid from './ListUuid';
import Mint from './Mint';
import Submit from './Submit';
import Stat from './Stat';
import Admin from './Admin';
import './App.css';
import MyNavBar from './MyNavBar';
import { KlaytnAddressContext } from './KlaytnAddressContext';

function App() {
  const [klaytnAddress, setKlaytnAddress] = useState("");

  const loadKlaytnAddress = async () => {
    var klaytn = window.klaytn;
    if(typeof klaytn !== "undefined") {
      if(typeof klaytn.selectedAddress === "string") {
        setKlaytnAddress(klaytn.selectedAddress);
      }
      klaytn.on('accountsChanged', function(accounts:string[]) {
        setKlaytnAddress(accounts[0]);
      })
    }
  }

  const clearKlaytnAddress = async () => {
    setKlaytnAddress("");
  }

  useEffect(()=>{
    loadKlaytnAddress();
  },[]);

  return (
    <KlaytnAddressContext.Provider value={klaytnAddress}>
    <MyNavBar updateKlaytnAddress={()=>loadKlaytnAddress()} clearKlaytnAddress={()=>clearKlaytnAddress()} />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Stat/>} />
        <Route path="/listUuid" element={<ListUuid/>} />
        <Route path="/mint" element={<Mint/>} />
        <Route path="/submit" element={<Submit/>} />
        <Route path="/admin" element={<Admin/>} />
      </Routes>
    </BrowserRouter>
    </KlaytnAddressContext.Provider>
  );
}

export default App;
