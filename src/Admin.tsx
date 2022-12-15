import { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import ButtonLink from './ButtonLink';
import mobile from 'is-mobile';
import Caver from 'caver-js';
import axios from 'axios';
import { KlaytnAddressContext } from './KlaytnAddressContext';
import { parseError } from './util';

const Page1 = () => {
  const klaytnAddress = useContext(KlaytnAddressContext);
  const [resultMessage, setResultMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [round, setRound] = useState<number>(0);
  const [submitters, setSubmitters] = useState<number>(0);
  const [submittable, setSubmittable] = useState<boolean>(true);
  const [randomNumber, setRandomNumber] = useState<number|undefined>(undefined);
  const [numNFTOwners, setNumNFTOwners] = useState<number>(0);
  const [startNewRoundInProgress, setStartNewRoundInProgress] = useState<boolean>(false);
  const [stopRoundInProgress, setStopRoundInProgress] = useState<boolean>(false);

  const loadNumNFTOwners = async () => {
    var caver = new Caver(window.klaytn);

    try {
      const input = caver.abi.encodeFunctionCall( {
        "inputs": [],
        "name": "totalSupply",
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
      const to = process.env.REACT_APP_NFT_CONTRACT_ADDRESS;
      const r = await caver.rpc.klay.call({
        from: to,
        to, input,
        gas:'10000000',
      })

      setNumNFTOwners(caver.utils.hexToNumber(r));
      
    } catch(e) {
      if(axios.isAxiosError(e)) {
        var axiosError = e as {response:{data:{error:any}}};
        setResultMessage(""+axiosError.response.data.error);
      }
      console.log(e);
    }
  }
  const loadRound = async () => {
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

  const loadSubmittable = async () => {
    var caver = new Caver(window.klaytn);

    try {
      const input = caver.abi.encodeFunctionCall( {
        "inputs": [],
        "name": "isSubmittable",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
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

      setSubmittable(caver.utils.hexToNumber(r) !== 0);
      
    } catch(e) {
      if(axios.isAxiosError(e)) {
        var axiosError = e as {response:{data:{error:any}}};
        setResultMessage(""+axiosError.response.data.error);
      }
      console.log(e);
    }
  }
  
  const loadSubmitters = async () => {
    var caver = new Caver(window.klaytn);

    try {
      const input = caver.abi.encodeFunctionCall( {
        "inputs": [],
        "name": "getSubmitters",
        "outputs": [
          {
            "internalType": "address[]",
            "name": "",
            "type": "address[]"
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
      const s = caver.abi.decodeParameter("address[]", r)

      setSubmitters(s.length);
      
    } catch(e) {
      if(axios.isAxiosError(e)) {
        var axiosError = e as {response:{data:{error:any}}};
        setResultMessage(""+axiosError.response.data.error);
      }
      console.log(e);
    }
  }

  const startNewRound = async () => {
    var caver = new Caver(window.klaytn);
    setStartNewRoundInProgress(true);
    try {
      // calling submit Random
      const input = caver.abi.encodeFunctionCall({
        "inputs": [],
        "name": "startNewRound",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },[])

      const receipt = await caver.rpc.klay.sendTransaction({
        from: klaytnAddress,
        to: process.env.REACT_APP_LOTTERY_CONTRACT_ADDRESS,
        input: input,
        gas: 1000000,
      });
      console.log(receipt);
      setResultMessage("새 라운드 시작 성공!")
      setSubmitting(false);

    } catch(e) {
      if(axios.isAxiosError(e)) {
        var axiosError = e as {response:{data:{error:any}}};
        setResultMessage(""+axiosError.response.data.error);
      }
      console.log(e);
    }
    setStartNewRoundInProgress(false);
  }

  const stopRound = async () => {
    var caver = new Caver(window.klaytn);
    setStopRoundInProgress(true);
    try {
      // calling submit Random
      const input = caver.abi.encodeFunctionCall({
        "inputs": [],
        "name": "stopRound",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },[])

      const receipt = await caver.rpc.klay.sendTransaction({
        from: klaytnAddress,
        to: process.env.REACT_APP_LOTTERY_CONTRACT_ADDRESS,
        input: input,
        gas: 1000000,
      });
      console.log(receipt);
      setResultMessage("라운드 중지 성공!")
      setSubmitting(false);

    } catch(e) {
      setResultMessage(parseError(e));
      console.log(e);
    }
    setStopRoundInProgress(false);
  }

  useEffect(() => {
    loadRound();
    loadSubmitters();
    loadSubmittable();
    loadNumNFTOwners();
  },[])


  return (
    <Container>
      <h1>한국 블록체인 밋업 난수 제출 - 관리자</h1>
      {klaytnAddress !== "" &&
        <div>
          <h1>클레이튼 주소: {klaytnAddress} <a href={`${process.env.REACT_APP_SCOPE_URL}/account/${klaytnAddress}`} target='_blank'>Scope</a>, <a href={`${process.env.REACT_APP_FINDER_URL}/account/${klaytnAddress}`} target='_blank'>Finder</a></h1>
          <h1>라운드: {round}</h1>
          <h1>제출자: {submitters}</h1>
          <h1>submittable: {submittable?"true":"false"}</h1>
          <h1>NFT Total Supply: {numNFTOwners}</h1>
          <h1 style={{color:'red'}}>{resultMessage}</h1>
          {randomNumber !== undefined && <h1>토큰 ID: {randomNumber}</h1>}
          <ButtonLink to="" disabled={startNewRoundInProgress} onClick={()=>startNewRound()}>새 라운드 시작{submitting && <>&nbsp;<Spinner animation="border" size='sm' /></>}</ButtonLink>
          <ButtonLink to="" disabled={stopRoundInProgress} onClick={()=>stopRound()}>라운드 종료{submitting && <>&nbsp;<Spinner animation="border" size='sm' /></>}</ButtonLink>
        </div>
      }
    </Container>
  );
}

export default Page1;