import { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import ButtonLink from './ButtonLink';
import mobile from 'is-mobile';
import Caver from 'caver-js';
import axios, { AxiosError, isAxiosError } from 'axios';
import QRCode from 'react-qr-code';
import queryString from 'query-string';
import { KlaytnAddressContext } from './KlaytnAddressContext';
import { parseError } from './util';

const Page1 = () => {
  const klaytnAddress = useContext(KlaytnAddressContext);
  const [mintedMessage, setMintedMessage] = useState<string>("");
  const [uuid, setUuid] = useState<string|undefined>("")
  const [minting, setMinting] = useState<boolean>(false);

  const mint = async () => {
    var caver = new Caver(window.klaytn);

    setMinting(true);

    const message = 'mint';
    const timestamp = new Date().getTime();

    try {
      var signature = await caver.klay.sign(message+timestamp, klaytnAddress);
      const r = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/mint`, {
        uuid,
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

      setMintedMessage("민팅에 성공하였습니다!!")
      
    } catch(e)  {
      setMintedMessage(parseError(e));
      console.log(e);
    }
    setMinting(false);
  }

  useEffect(() => {
    const parsed = queryString.parse(window.location.search);
    setUuid(parsed.uuid?.toString());
    if(uuid === undefined) {
      setMintedMessage('UUID is null');
    }
  },[])

  return (
    <Container>
      <h1>한국 블록체인 밋업 NFT Airdrop</h1>
      {klaytnAddress !== "" ?
        <div>
          <h1>클레이튼 주소: {klaytnAddress} <a href={`${process.env.REACT_APP_SCOPE_URL}/account/${klaytnAddress}`} target='_blank'>Scope</a>, <a href={`${process.env.REACT_APP_FINDER_URL}/account/${klaytnAddress}`} target='_blank'>Finder</a></h1>
          <h1>UUID: {uuid}</h1>
          <h1 style={{color:'red'}}>{mintedMessage}</h1>
          <ButtonLink to="" disabled={uuid===undefined || minting} onClick={()=>mint()}>Mint{minting && <>&nbsp;<Spinner animation="border" size='sm' /></>}</ButtonLink>
        </div>
      :<h1>카이카스 로그인이 필요합니다.</h1>}
    </Container>
  );
}

interface Klaytn {
  selectedAddress: string,
}

export default Page1;
