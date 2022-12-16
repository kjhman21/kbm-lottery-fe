import { useContext, useState } from 'react';
import Container from 'react-bootstrap/Container';
import ButtonLink from './ButtonLink'; import Caver from 'caver-js';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { KlaytnAddressContext } from './KlaytnAddressContext';
import { parseError } from './util';
import { Table } from 'react-bootstrap';

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
      setErrorMessage(parseError(e));
      console.log(e);
    }
  }

  return (
    <Container>
      <h1>List UUID - Admin</h1>
      <h1>addr: {klaytnAddress}</h1>
      {klaytnAddress !== "" && <ButtonLink to="#" onClick={()=>listUuid()}>List uuid</ButtonLink>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <td style={{textAlign:"center"}} width="10%">ID</td>
            <td style={{textAlign:"center"}} width="45%">QR for Mint</td>
            <td style={{textAlign:"center"}} width="45%">QR for Random Submission</td>
          </tr>
        </thead>
        <tbody>
          {uuids && uuids.map((x,i)=>{
            const mintLink = `${process.env.REACT_APP_FE_URL}/mint?uuid=${uuids[0]}`
            const kaikasMintLink =`kaikas://wallet/browser?url=${mintLink}` 
            const submitRandomLink= `${process.env.REACT_APP_FE_URL}/submit`;
            const kaikasSubmitRandomLink =`kaikas://wallet/browser?url=${submitRandomLink}` 
          return <tr key={`qr-${i}`}>
            <td style={{textAlign:'center'}}>{i}</td>
            <td style={{textAlign:'center'}}>
              아래 QR코드를 스캔하여 NFT를 민팅하세요.
              <div style={{height:'auto', padding:'16px', width:'100%'}}>
              <QRCode size={100} value={kaikasMintLink}/><br/>
              <a href={mintLink}>{mintLink}</a></div>
            </td>
            <td style={{textAlign:'center'}}>
              아래 QR코드를 스캔하여 랜덤값을 제출하세요.
              <div style={{height:'auto', padding:'16px', width:'100%'}}>
              <QRCode size={100} value={kaikasSubmitRandomLink}/><br/>
              <a href={submitRandomLink}>{submitRandomLink}</a></div>
            </td>
            </tr>})}
        </tbody>
      </Table>
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
