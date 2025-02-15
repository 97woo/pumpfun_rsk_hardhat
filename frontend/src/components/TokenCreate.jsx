import React, { useState } from 'react';
import '../App.css'; 
import { useNavigate } from 'react-router-dom';
import { abi } from './abi'; 
import { ethers } from 'ethers';
import ConnectWallet from './ConnectWallet';

const TokenCreate = () => {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log("Signer address:", await signer.getAddress());
  
      const factoryAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      console.log("Factory Address from .env:", factoryAddress);
  
      const contractInstance = new ethers.Contract(factoryAddress, abi, signer);
      console.log("Contract instance:", contractInstance);
  
      const transaction = await contractInstance.createMemeToken(
        name,
        ticker,
        imageUrl,
        description,
        {
          value: ethers.parseUnits("0.0001", "ether"),
        }
      );
      const receipt = await transaction.wait();
  
      alert(`Transaction successful! Hash: ${receipt.hash}`);
      console.log("Creating token:", { name, ticker, description, imageUrl });
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };
  

  return (
    <div className="app">
      <nav className="navbar">
        <ConnectWallet />
      </nav>
      <div className="token-create-container">
      <h3 className="start-new-coin" onClick={() => navigate('/')}>[go back]</h3>
        <p className="info-text">MemeCoin creation fee: 0.0001 ETH</p>
        <p className="info-text">Max supply: 1 million tokens. Initial mint: 200k tokens.</p>
        <p className="info-text">If funding target of 24 TRBTC is met, a liquidity pool will be created on sushiswap.</p>
        <div className="input-container">
          <input
            type="text"
            placeholder="Token Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Ticker Symbol"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="input-field"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="input-field"
          />
          <button className="create-button" onClick={handleCreate}>Create MemeToken</button>
        </div>
      </div>
    </div>
  );
};

export default TokenCreate;