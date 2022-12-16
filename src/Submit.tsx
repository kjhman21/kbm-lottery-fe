import { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import ButtonLink from './ButtonLink';
import mobile from 'is-mobile';
import Caver from 'caver-js';
import axios, { AxiosError, isAxiosError } from 'axios';
import QRCode from 'react-qr-code';
import queryString from 'query-string';
import { Form } from 'react-bootstrap';
import lotteryabi from './lotteryabi.json';
import { KlaytnAddressContext } from './KlaytnAddressContext';
import { parseError } from './util';

const Page1 = () => {
  const klaytnAddress = useContext(KlaytnAddressContext);
  const [resultMessage, setResultMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [number, setNumber] = useState<string>("");
  const [round, setRound] = useState<number>(0);

  const getRound = async () => {
    var caver = new Caver(window.klaytn);

    try {
      const input = caver.abi.encodeFunctionCall( {
        "inputs": [],
        "name": "getRound",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },[]);
      const to = process.env.REACT_APP_LOTTERY_CONTRACT_ADDRESS;
      const r = await caver.rpc.klay.call({
        from: to,
        to, input,
        gas:'10000000',
      })

      setRound(caver.utils.hexToNumber(r));
      
    } catch(e) {
      if(axios.isAxiosError(e)) {
        var axiosError = e as {response:{data:{error:any}}};
        setResultMessage(""+axiosError.response.data.error);
      }
      console.log(e);
    }
  }

  const submit = async () => {
    var caver = new Caver(window.klaytn);
    setSubmitting(true);
    try {
      // calling submit Random
      const input = caver.abi.encodeFunctionCall({
        "inputs": [
          {
            "internalType": "uint256",
            "name": "num",
            "type": "uint256"
          }
        ],
        "name": "submitRandom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },[number])

      const receipt = await caver.rpc.klay.sendTransaction({
        from: klaytnAddress,
        to: process.env.REACT_APP_LOTTERY_CONTRACT_ADDRESS,
        input: input,
        gas: 1000000,
      });
      console.log(receipt);
      setResultMessage("랜덤 넘버 제출 성공!")
      setSubmitting(false);
      
    } catch(e) {
      setResultMessage(parseError(e));
      console.log(e);
    }
    setSubmitting(false);
  }

  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumber(e.currentTarget.value);
  }


  useEffect(() => {
    getRound();
  },[])


  return (
    <Container>
      <h1>한국 블록체인 밋업 난수 제출</h1>
      {klaytnAddress !== "" &&
        <div>
          <h1>클레이튼 주소: {klaytnAddress} <a href={`${process.env.REACT_APP_SCOPE_URL}/account/${klaytnAddress}`} target='_blank'>Scope</a>, <a href={`${process.env.REACT_APP_FINDER_URL}/account/${klaytnAddress}`} target='_blank'>Finder</a></h1>
          <h1>라운드: {round}</h1>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>난수 입력</Form.Label>
              <Form.Control onChange={onNumberChange} type="text" placeholder="난수를 입력하세요." />
            </Form.Group>
          </Form>
          <h1 style={{color:'red'}}>{resultMessage}</h1>
          <ButtonLink to="" disabled={submitting} onClick={()=>submit()}>제출{submitting && <>&nbsp;<Spinner animation="border" size='sm' /></>}</ButtonLink>
        </div>
      }
    </Container>
  );
}

export default Page1;
