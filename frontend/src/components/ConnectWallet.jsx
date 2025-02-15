import React, { useState, useEffect } from 'react';

const ConnectWallet = () => {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkIfWalletIsConnected();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error("지갑 연결 확인 중 에러 발생:", error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);
    } else {
      setAccount('');
      setIsConnected(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("메타마스크를 설치해주세요!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAccount(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      console.error("지갑 연결 중 에러 발생:", error);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.ethereum) {
        // 메타마스크에서 연결 해제
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{
            eth_accounts: {}
          }]
        });
        // 상태 초기화
        setAccount('');
        setIsConnected(false);
      }
    } catch (error) {
      console.error("지갑 연결 해제 중 에러 발생:", error);
    }
  };

  return (
    <button 
      className="nav-button" 
      onClick={isConnected ? disconnectWallet : connectWallet}
    >
      {isConnected ? 
        `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 
        'Connect Wallet'}
    </button>
  );
};

export default ConnectWallet; 