import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { useContext, useEffect, useState } from 'react';
import mobile from 'is-mobile';
import { KlaytnAddressContext } from "./KlaytnAddressContext";

const MyNavBar = (prop:Prop) => {
  const klaytnAddress = useContext(KlaytnAddressContext);
  const isAdmin = true;

  const nonAdminPath = [
    {href:'/submit', title:'Submit Random'},
  ]
  const adminPath = [
    {href:'/listUuid', title:"UUID List"},
    {href:"/admin", title:"admin"}
  ]

  const loadWallet = async () => {
    if(mobile() && window.klaytn === undefined) {
      window.location.href = `kaikas://wallet/browser?url=${encodeURIComponent(window.location.href)}`;
    } else {
      var klaytn = window.klaytn;
      if(klaytn) {
        await klaytn.enable();
        prop.updateKlaytnAddress();
      }
    }
  }

  const clearWallet = async () => {
    prop.clearKlaytnAddress();
  }

  return (
    <Navbar collapseOnSelect expand='lg' bg="primary" variant="dark">
    <Container>
      <Navbar.Brand href="/">KBM#7 Lottery</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="me-auto">
          {nonAdminPath.map((x,i)=>{
            return <Nav.Link key={`nav-${i}`} href={x.href} active={x.href===window.location.pathname}>{x.title}</Nav.Link>
          })}

          {isAdmin && <>
            {adminPath.map((x,i)=>{
              return <Nav.Link key={`nav-${i}`} href={x.href} active={x.href===window.location.pathname}>{x.title}</Nav.Link>
            })}
          </>}
        </Nav>
        <Nav>
          <Nav.Link href="#">
            {klaytnAddress === "" ?
            <Button onClick={()=>loadWallet()}>Connect to Kaikas</Button>
            :<Button onClick={()=>clearWallet()}>{klaytnAddress}</Button>
            }
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
  );
}

type NonAdminPath = {
  href:string,
  title:string,
}

type Prop = {
  updateKlaytnAddress:()=>any,
  clearKlaytnAddress:()=>any,
}

export default MyNavBar;