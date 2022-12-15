/// <reference types="react-scripts" />
/// <reference types="caver-js" />

interface Window {
    klaytn: RequestProvider |
        {selectedAddress:string, on:any, enable:any},
    location:{
        host:string,
        pathname:string,
        href:string,
        search:string,
        reload:any,
    }
}