import { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import ButtonLink from './ButtonLink';
import mobile from 'is-mobile';
import Caver from 'caver-js';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { KlaytnAddressContext } from './KlaytnAddressContext';
import { parseError } from './util';

const Page1 = () => {
  const klaytnAddress = useContext(KlaytnAddressContext);
  const [resultMessage, setResultMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [round, setRound] = useState<number>(0);
  const [submitters, setSubmitters] = useState<number>(0);
  const [submittable, setSubmittable] = useState<boolean>(true);
  const [numNFTOwners, setNumNFTOwners] = useState<number>(0);
  const [roundInfo, setRoundInfo] = useState<roundInfo[]>([]);

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
      setResultMessage(parseError(e))
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
      setResultMessage(parseError(e))
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
      setResultMessage(parseError(e))
      console.log(e);
    }
  }
  
  const loadSubmitters = async () => {
    var caver = new Caver(window.klaytn);

    try {
      const input = caver.abi.encodeFunctionCall( {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "round",
            "type": "uint256"
          }
        ],
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
      },[round]);
      const to = process.env.REACT_APP_LOTTERY_CONTRACT_ADDRESS;
      const r = await caver.rpc.klay.call({
        from: to,
        to, input,
        gas:'10000000',
      })
      const s = caver.abi.decodeParameter("address[]", r)

      setSubmitters(s.length);
      
    } catch(e) {
      setResultMessage(parseError(e))
      console.log(e);
    }
  }

  const _calcRound = async (round: number) => {
    var caver = new Caver(window.klaytn);
    var rnd = 0;
    try {
      const input = caver.abi.encodeFunctionCall( {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "round",
            "type": "uint256"
          }
        ],
        "name": "calcRandom",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },[round]);
      const to = process.env.REACT_APP_LOTTERY_CONTRACT_ADDRESS;
      const r = await caver.rpc.klay.call({
        from: to,
        to, input,
        gas:'10000000',
      })
      console.log(`round ${round} value: ${r}`);

      rnd = parseInt(caver.utils.toBN(r).mod(caver.utils.toBN(numNFTOwners)).toString())

    } catch(e) {
      setResultMessage(parseError(e))
      console.log(e);
    }

    return rnd;
  }

  const getTokenIdOwner = async (tokenId:number) => {
    var caver = new Caver(window.klaytn);
    var owner:string = "";

    try {
      const input = caver.abi.encodeFunctionCall( {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ownerOf",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },[tokenId]);
      const to = process.env.REACT_APP_NFT_CONTRACT_ADDRESS;
      const r = await caver.rpc.klay.call({
        from: to,
        to, input,
        gas:'10000000',
      })

      owner = caver.abi.decodeParameter("address",r);
      
    } catch(e) {
      setResultMessage(parseError(e))
      console.log(e);
    }
    return owner;
  }

  const calcRandom = async () => {
    var w:roundInfo[] = []
    for(var r = 0; r <= round; r++) {
      const tokenId = await _calcRound(r);
      const winner = await getTokenIdOwner(tokenId);
      w.push({
        round: r,
        tokenId,
        winner
      });
    }
    setRoundInfo(w);
  }

  useEffect(() => {
    loadRound();
    loadSubmitters();
    loadSubmittable();
    loadNumNFTOwners();
  },[])


  return (
    <Container>
      <h1>한국 블록체인 밋업 난수 제출 - 통계</h1>
      <div>
        {klaytnAddress !== "" ?
        <h1>클레이튼 주소: {klaytnAddress} <a href={`${process.env.REACT_APP_SCOPE_URL}/account/${klaytnAddress}`} target='_blank'>Scope</a>, <a href={`${process.env.REACT_APP_FINDER_URL}/account/${klaytnAddress}`} target='_blank'>Finder</a></h1>
        :<h1>카이카스 로그인이 필요합니다. 로그인하시면 본인 계정의 경우 빨간색으로 표기됩니다.</h1>
        }
        <h1>라운드: {round}</h1>
        <h1>제출자: {submitters}</h1>
        <h1>submittable: {submittable?"true":"false"}</h1>
        <h1>NFT Total Supply: {numNFTOwners}</h1>
        <h1 style={{color:'red'}}>{resultMessage}</h1>
        <ButtonLink to="" disabled={submitting} onClick={()=>calcRandom()}>랜덤값 계산{submitting && <>&nbsp;<Spinner animation="border" size='sm' /></>}</ButtonLink>
        {roundInfo.length > 0 &&
          <Table striped bordered hover>
            <thead>
              <tr>
                <td>Round</td>
                <td>Selected Token ID</td>
                <td>Klaytn Address</td>
              </tr>
            </thead>
            <tbody>
              {roundInfo.map((row,idx)=>{
                var color:string = '';
                if(row.winner.toLowerCase() === klaytnAddress.toLowerCase()) {
                  color = 'red';
                }
                return (
                  <tr key={`r${idx}`}>
                    <td>{row.round}</td>
                    <td>{row.tokenId}</td>
                    <td style={{color}}>{row.winner}</td>
                  </tr>
                );
              })
              }
            </tbody>
          </Table>
        }
      </div>
    </Container>
  );
}

interface roundInfo {
  round: number,
  tokenId: number,
  winner: string
}

export default Page1;
