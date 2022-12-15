import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import ButtonLink from './ButtonLink';
import mobile from 'is-mobile';
import Caver from 'caver-js';
import axios from 'axios';
import QRCode from 'react-qr-code';

const Page1 = () => {
  const [klaytnAddress, setKlaytnAddress] = useState<string>("");
  const [uuids, setUuids] = useState<Array<string>|undefined>(undefined);

  const initKlaytnAccount = async () => {
    var addr = "";
    var klaytn = window.klaytn;
    if(typeof klaytn !== "undefined") {
      if(typeof klaytn.selectedAddress === "string") {
        addr = klaytn.selectedAddress;
        setKlaytnAddress(addr);
      }
    }
  }

  const setAccountInfo = (klaytn:Klaytn) => {
    setKlaytnAddress(klaytn.selectedAddress);
  }

  const loadWallet = async () => {
    if(mobile() && window.klaytn === undefined) {
      window.location.href = `kaikas://wallet/browser?url=${encodeURIComponent(window.location.href)}`;
    } else {
      var klaytn = window.klaytn;
      if(klaytn) {
        await klaytn.enable();
        setKlaytnAddress(klaytn.selectedAddress);
      }
    }
  }

  const listUuid = async () => {
    var caver = new Caver(window.klaytn);
    const message = 'list_uuid';
    const timestamp = new Date().getTime();
    var signature = await caver.klay.sign(message+timestamp, klaytnAddress);

    try {
      const r = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/list_uuid`, {
        klaytnAddress,
        signature,
        message,
        timestamp
      },{
        headers: {
          'Content-Type':'application/json',
          'Accept':'application/json',
        }
      })
      
      setUuids(r.data);
      console.log('r', r.data)

    } catch(e) {
      console.log(e);
    }
  }

  useEffect(() => {
    initKlaytnAccount();
  },[])


  return (
    <Container>
      <h1>Page 1</h1>
      <h1>addr: {klaytnAddress}</h1>
      <ButtonLink to="/page2">Go to Page 2</ButtonLink>
      {klaytnAddress === "" && <ButtonLink to="#" onClick={()=>loadWallet()}>Connect to Kaikas</ButtonLink>}
      {klaytnAddress !== "" && <ButtonLink to="#" onClick={()=>listUuid()}>List uuid</ButtonLink>}
      {uuids && (<div style={{height:'auto', background:'white', padding:'16px', width:'100px'}}>
        <QRCode size={100} value={uuids[0]}/>
      </div>)}
    </Container>
  );
}

interface Klaytn {
  selectedAddress: string,
}

export default Page1;
