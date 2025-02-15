import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import '../App.css'; 
import { abi } from './abi';       // TokenFactory ABI
import { tokenAbi } from './tokenAbi'; // MemeToken(ERC20) ABI
import ConnectWallet from './ConnectWallet';

const TokenDetail = () => {
  const { tokenAddress } = useParams();
  const location = useLocation();
  const { card } = location.state || {};

  // 토큰의 판매/공급 정보
  const [totalSupply, setTotalSupply] = useState('0');
  const [remainingTokens, setRemainingTokens] = useState('0');

  // 구매 관련 상태
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [cost, setCost] = useState('0');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate(); 

  // 카드가 없으면 기본값으로 대체
  const tokenDetails = card || {
    name: 'Unknown',
    symbol: 'Unknown',
    description: 'No description available',
    tokenImageUrl: 'https://via.placeholder.com/200',
    fundingRaised: '0 TRBTC',
    creatorAddress: '0x0000000000000000000000000000000000000000',
  };

  // 펀딩 진행 바 계산용
  const fundingGoal = 24; 
  // 카드 정보에서 가져오는 펀딩 금액(초기 표시용). 
  // (실제로 체인에서 다시 읽으려면 fetchData() 내에 별도 로직 추가)
  const fundingRaised = parseFloat(tokenDetails.fundingRaised.replace('TRBTC', ''));
  const fundingRaisedPercentage = (fundingRaised / fundingGoal) * 100;

  // 전체 판매 가능 토큰
  const SALE_CAP = 800000;
  const remainingTokensPercentage = (parseFloat(remainingTokens) / SALE_CAP) * 100;

  // 페이지 최초 로딩 시 토큰 공급량(판매분) + 남은 토큰 계산
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) RPC 연결
        const provider = new ethers.JsonRpcProvider(process.env.REACT_APP_RPC_URL);
        // 2) MemeToken 컨트랙트 totalSupply() 읽기
        const memeTokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
        const totalSupplyWei = await memeTokenContract.totalSupply();

        // 3) Ether 단위 변환 (ex: 234567.1234)
        let totalSupplyInEther = parseFloat(ethers.formatUnits(totalSupplyWei, 'ether'));

        // 4) 초기 200,000개(팀/LP) 제외 → 현재까지 퍼블릭으로 판매된 양
        let soldAmountForSale = totalSupplyInEther - 200000;
        if (soldAmountForSale < 0) {
          soldAmountForSale = 0;
        }
        setTotalSupply(soldAmountForSale.toString());

        // 5) 남은 토큰 = 800,000 - 판매된 양
        let remaining = SALE_CAP - soldAmountForSale;
        if (remaining < 0) {
          remaining = 0;
        }
        setRemainingTokens(remaining.toString());

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [tokenAddress]);

  // (A) 본딩커브 가격 계산
  const getCost = async () => {
    if (!purchaseAmount) return;

    try {
      const provider = new ethers.JsonRpcProvider(process.env.REACT_APP_RPC_URL);

      // 1) MemeToken totalSupply → currentSupply (wei)
      const memeTokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
      const totalSupplyWei = await memeTokenContract.totalSupply();

      // 2) (currentSupply - 200,000 * 10^18) → scaled
      const DECIMALS_BN = BigInt(10) ** BigInt(18);
      const INIT_SUPPLY_BN = BigInt(200000) * DECIMALS_BN;

      let currentSupplyScaledBn = BigInt(totalSupplyWei.toString()) - INIT_SUPPLY_BN;
      if (currentSupplyScaledBn < 0n) {
        currentSupplyScaledBn = 0n;
      }
      const currentSupplyScaled = currentSupplyScaledBn / DECIMALS_BN;

      // 3) Factory 컨트랙트로 calculateCost(currentSupplyScaled, tokensToBuy)
      const factoryContract = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS, 
        abi, 
        provider
      );
      const tokensToBuyBn = BigInt(parseInt(purchaseAmount, 10));
      const costInWei = await factoryContract.calculateCost(currentSupplyScaled, tokensToBuyBn);

      // 4) cost (wei -> eth)
      setCost(ethers.formatUnits(costInWei, 'ether'));
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error calculating cost:', error);
    }
  };

  // (B) 실제 구매
  const handlePurchase = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const factoryContract = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        abi,
        signer
      );

      // buyMemeToken(tokenAddress, qty, { value })
      const tx = await factoryContract.buyMemeToken(
        tokenAddress, 
        parseInt(purchaseAmount, 10),
        {
          value: ethers.parseUnits(cost, 'ether'),
        }
      );
      const receipt = await tx.wait();
      alert(`Transaction successful! Hash: ${receipt.hash}`);

      // 구매 후 남은 토큰 재계산 (또는 새로고침 등)
      // 아래처럼 fetchData() 다시 호출하면 최신 공급량 반영됨
      // (필요시 사용)
      // await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error during purchase:', error);
    }
  };

  // --- UI 디자인: 기존 구조 & CSS 그대로 유지 ---
  return (
    <div className="token-detail-container">
      <nav className="navbar">
        <ConnectWallet />
      </nav>

      <h3 className="start-new-coin" onClick={() => navigate('/')}>[go back]</h3>

      <div className="token-details-section">
        <div className="token-details">
          <h2>Token Detail for {tokenDetails.name}</h2>
          <img 
            src={tokenDetails.tokenImageUrl} 
            alt={tokenDetails.name} 
            className="token-detail-image" 
          />
          <p><strong>Creator Address:</strong> {tokenDetails.creatorAddress}</p>
          <p><strong>Token Address:</strong> {tokenAddress}</p>
          <p><strong>Funding Raised:</strong> {tokenDetails.fundingRaised}</p>
          <p><strong>Token Symbol:</strong> {tokenDetails.symbol}</p>
          <p><strong>Description:</strong> {tokenDetails.description}</p>
        </div>

        <div className="right-column">
          <div className="progress-bars">
            {/* 펀딩 목표 진행 바 */}
            <div className="progress-container">
              <p>
                <strong>Bonding Curve Progress:</strong> {fundingRaised} / {fundingGoal} TRBTC
              </p>
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${fundingRaisedPercentage}%` }}
                ></div>
              </div>
              <p>
                When the market cap reaches {fundingGoal} TRBTC, all the liquidity 
                from the bonding curve will be deposited into Uniswap, and the 
                LP tokens will be burned. Progression increases as the price goes up.
              </p>
            </div>

            {/* 남은 토큰 진행 바 */}
            <div className="progress-container">
              <p>
                <strong>Remaining Tokens Available for Sale:</strong>{' '}
                {remainingTokens} / {SALE_CAP}
              </p>
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${remainingTokensPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="buy-tokens">
            <h3>Buy Tokens</h3>
            <input
              type="number"
              placeholder="Enter amount of tokens to buy"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
              className="buy-input"
            />
            <button onClick={getCost} className="buy-button">
              Purchase
            </button>
          </div>
        </div>
      </div>

      {/* 구매 모달 */} 
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h4>Confirm Purchase</h4>
            <p>Cost of {purchaseAmount} tokens: {cost} TRBTC</p>
            <button onClick={handlePurchase} className="confirm-button">
              Confirm
            </button>
            <button onClick={() => setIsModalOpen(false)} className="cancel-button">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenDetail;