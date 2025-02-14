// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Token.sol";
import "hardhat/console.sol";

contract TokenFactory {

    struct memeToken {
        string name;
        string symbol;
        string description;
        string tokenImageUrl;
        uint fundingRaised;
        address tokenAddress;
        address creatorAddress;
    }

    address[] public memeTokenAddresses;

    mapping(address => memeToken) public addressToMemeTokenMapping;

    uint constant MEMETOKEN_CREATION_PLATFORM_FEE = 0.0001 ether; //TRBTC
    uint constant MEMECOIN_FUNDING_DEADLINE_DURATION = 10 days;
    uint constant MEMECOIN_FUNDING_GOAL = 24 ether; //TRBTC

    uint constant DECIMALS = 10 ** 18;
    uint constant MAX_SUPPLY = 1000000 * DECIMALS;
    uint constant INIT_SUPPLY = 20 * MAX_SUPPLY / 100;

    uint256 public constant INITIAL_PRICE = 30000000000000;  // 초기 가격 (P0)
    uint256 public constant K = 8 * 10**15;  // 성장률 (k)

    // 토큰 구매 비용 계산 함수 (exponential bonding curve)
    function calculateCost(uint256 currentSupply, uint256 tokensToBuy) public pure returns (uint256) {
        uint256 exponent1 = (K * (currentSupply + tokensToBuy)) / 10**18;
        uint256 exponent2 = (K * currentSupply) / 10**18;

        uint256 exp1 = exp(exponent1);
        uint256 exp2 = exp(exponent2);

        uint256 cost = (INITIAL_PRICE * 10**18 * (exp1 - exp2)) / K;
        return cost;
    }

    // Taylor series 근사를 통한 e^x 계산 함수
    function exp(uint256 x) internal pure returns (uint256) {
        uint256 sum = 10**18;  
        uint256 term = 10**18;
        uint256 xPower = x;
        
        for (uint256 i = 1; i <= 20; i++) {
            term = (term * xPower) / (i * 10**18);
            sum += term;

            if (term < 1) break;
        }

        return sum;
    }

    // meme token 생성 함수
    function createMemeToken(string memory name, string memory symbol, string memory imageUrl, string memory description) public payable returns(address) {
        require(msg.value >= MEMETOKEN_CREATION_PLATFORM_FEE, "Fee not paid for memetoken creation");
        Token ct = new Token(name, symbol, INIT_SUPPLY);
        address memeTokenAddress = address(ct);
        memeToken memory newlyCreatedToken = memeToken(name, symbol, description, imageUrl, 0, memeTokenAddress, msg.sender);
        memeTokenAddresses.push(memeTokenAddress);
        addressToMemeTokenMapping[memeTokenAddress] = newlyCreatedToken;
        return memeTokenAddress;
    }

    // meme token 조회 함수
    function getAllMemeTokens() public view returns(memeToken[] memory) {
        memeToken[] memory allTokens = new memeToken[](memeTokenAddresses.length);
        for (uint i = 0; i < memeTokenAddresses.length; i++) {
            allTokens[i] = addressToMemeTokenMapping[memeTokenAddresses[i]];
        }
        return allTokens;
    }

    // meme token 구매 함수
    function buyMemeToken(address memeTokenAddress, uint tokenQty) public payable returns(uint) {
        require(addressToMemeTokenMapping[memeTokenAddress].tokenAddress != address(0), "Token is not listed");
        
        memeToken storage listedToken = addressToMemeTokenMapping[memeTokenAddress];
        Token memeTokenCt = Token(memeTokenAddress);

        require(listedToken.fundingRaised <= MEMECOIN_FUNDING_GOAL, "Funding has already been raised");

        uint currentSupply = memeTokenCt.totalSupply();
        console.log("Current supply of token is ", currentSupply);
        console.log("Max supply of token is ", MAX_SUPPLY);
        uint available_qty = MAX_SUPPLY - currentSupply;
        console.log("Qty available for purchase ", available_qty);

        uint scaled_available_qty = available_qty / DECIMALS;
        uint tokenQty_scaled = tokenQty * DECIMALS;

        require(tokenQty <= scaled_available_qty, "Not enough available supply");

        uint currentSupplyScaled = (currentSupply - INIT_SUPPLY) / DECIMALS;
        uint requiredEth = calculateCost(currentSupplyScaled, tokenQty);
        console.log("TRBTC required for purchasing meme tokens is ", requiredEth);

        require(msg.value >= requiredEth, "Incorrect value of ETH sent");

        // fundingRaised 업데이트 (유동성 풀 생성 제거)
        listedToken.fundingRaised += msg.value;

        // 토큰 민팅
        memeTokenCt.mint(tokenQty_scaled, msg.sender);
        console.log("User balance of the tokens is ", memeTokenCt.balanceOf(msg.sender));
        console.log("New available qty ", MAX_SUPPLY - memeTokenCt.totalSupply());

        return 1;
    }
}