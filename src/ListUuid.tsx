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
            <td style={{textAlign:"center"}}>ID</td>
            <td style={{textAlign:"center"}}>Kaikas Install</td>
            <td style={{textAlign:"center"}} >QR for Mint</td>
            <td style={{textAlign:"center"}} >QR for Random Submission</td>
            <td style={{textAlign:"center"}} >QR for Stat</td>
          </tr>
        </thead>
        <tbody>
          {uuids && uuids.map((x,i)=>{
            const kaikasInstallLink = 'https://play.google.com/store/apps/details?id=io.klutch.wallet&hl=en&gl=US'
            const mintLink = `${process.env.REACT_APP_FE_URL}/mint?uuid=${x}`
            const kaikasMintLink =`kaikas://wallet/browser?url=${mintLink}` 
            const submitRandomLink= `${process.env.REACT_APP_FE_URL}/submit`;
            const kaikasSubmitRandomLink =`kaikas://wallet/browser?url=${submitRandomLink}` 
            const statLink= `${process.env.REACT_APP_FE_URL}`;
            const kaikasStatLink=`kaikas://wallet/browser?url=${statLink}` 
          return <tr key={`qr-${i}`}>
            <td style={{textAlign:'center'}}>{i}</td>
            <td style={{textAlign:'center'}}>
              ?????? QR????????? ???????????? Kaikas??? ???????????????.
              <div style={{height:'auto', padding:'16px', width:'100%'}}>
              <QRCode size={100} value={kaikasInstallLink}/><br/>
              <a href={kaikasInstallLink}>{kaikasInstallLink}</a></div>
            </td>
            <td style={{textAlign:'center'}}>
              ?????? QR????????? ???????????? NFT??? ???????????????.
              <div style={{height:'auto', padding:'16px', width:'100%'}}>
              <QRCode size={100} value={kaikasMintLink}/><br/>
              <a href={mintLink}>{mintLink}</a></div>
            </td>
            <td style={{textAlign:'center'}}>
              ?????? QR????????? ???????????? ???????????? ???????????????.
              <div style={{height:'auto', padding:'16px', width:'100%'}}>
              <QRCode size={100} value={kaikasSubmitRandomLink}/><br/>
              <a href={submitRandomLink}>{submitRandomLink}</a></div>
            </td>
            <td style={{textAlign:'center'}}>
              ?????? QR????????? ???????????? ?????????????????? ???????????????.
              <div style={{height:'auto', padding:'16px', width:'100%'}}>
              <QRCode size={100} value={kaikasStatLink}/><br/>
              <a href={statLink}>{statLink}</a></div>
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
