import { useContext, useState } from 'react';
import Container from 'react-bootstrap/Container';
import ButtonLink from './ButtonLink';
import Caver from 'caver-js';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { KlaytnAddressContext } from './KlaytnAddressContext';

const Page1 = () => {
  const klaytnAddress = useContext(KlaytnAddressContext);
  const [uuids, setUuids] = useState<Array<string>|undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string>("");

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
      if(axios.isAxiosError(e)) {
        var axiosError = e as {response:{data:{error:string}}};
        setErrorMessage(""+axiosError.response.data.error);
      }
      console.log(e);
    }
  }

  return (
    <Container>
      <h1>List UUID - Admin</h1>
      <h1>addr: {klaytnAddress}</h1>
      {klaytnAddress !== "" && <ButtonLink to="#" onClick={()=>listUuid()}>List uuid</ButtonLink>}
      {uuids && uuids.map((x,i)=>{
        const link = `${process.env.REACT_APP_FE_URL}/mint?uuid=${uuids[0]}`
        const kaikasLink =`kaikas://wallet/browser?url=${link}` 
      return <div key={`qr-${i}`} style={{height:'auto', background:'white', padding:'16px', width:'100%'}}>
        <QRCode size={100} value={kaikasLink}/><br/>
        <a href={link}>{link}</a>
      </div>})}
      {errorMessage !== "" &&
        <h1 style={{color:'red'}}>{errorMessage}</h1>
      }
    </Container>
  );
}

interface Klaytn {
  selectedAddress: string,
}

export default Page1;
