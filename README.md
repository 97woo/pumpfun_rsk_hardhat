<img src="https://rootstock.io/og.png" width="70%" alt="rsklogo">

# pumpfun_rsk_hardhat DApp

이 프로젝트는 Hardhat을 사용하여 로컬 RSK 테스트넷에 배포된 스마트 컨트랙트와 이를 위한 React 프론트엔드로 구성된 Pumpfun DApp입니다.
Hardhat을 통해 로컬 RSK 테스트넷을 구동하고, 스마트 컨트랙트 개발부터 배포까지의 전체 과정을 실습해보는 방법을 안내합니다.

## 사전 준비사항

- Node.js와 npm이 설치되어 있어야 합니다
- MetaMask 지갑이 필요합니다
- Git이 설치되어 있어야 합니다

## 설치 및 설정 방법

### 스마트 컨트랙트 배포

1. 저장소를 클론하고 컨트랙트 디렉토리로 이동합니다:

```
git clone https://github.com/97woo/pumpfun_rsk_hardhat.git
cd [프로젝트-디렉토리]/contract
```

2. 의존성 패키지를 설치합니다:

```
npm install
```

3. 환경 변수를 설정합니다:
   - `.env.sample`을 `.env`로 복사합니다
   - 필요한 변수들을 설정합니다

4. 로컬 Hardhat 노드를 시작합니다:

```
npx hardhat node
```

5. 컨트랙트를 컴파일하고 배포합니다:

```
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

배포된 컨트랙트 주소를 메모해두세요. 프론트엔드 설정에 필요합니다:

```
TokenFactory deployed to: 0xE38aF3FDa379401445FFD7b9cD57D0D33d03790E
```

### 프론트엔드 설정

1. 프론트엔드 디렉토리로 이동합니다:

```
cd ../frontend
```

2. 의존성 패키지를 설치합니다:

```
npm install
```

3. 프론트엔드를 설정합니다:
   - `.env` 파일에 배포된 컨트랙트 주소를 설정합니다
   - `artifacts`에서 컨트랙트 ABI를 복사하여 `abi.js`에 붙여넣습니다

4. 개발 서버를 시작합니다:

```
npm start
```

## 지갑 설정

1. MetaMask에 새 계정을 추가합니다:
   - "계정 가져오기" 클릭
   - Hardhat 로컬 네트워크에서 제공한 프라이빗 키를 입력합니다
   
Hardhat 로컬 네트워크의 계정 예시:
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

2. 프론트엔드 인터페이스를 통해 지갑을 DApp에 연결합니다

## 테스트

모든 설정이 완료되면 다음과 같은 작업을 수행할 수 있습니다:
- 새로운 토큰 생성
- 프론트엔드를 통한 스마트 컨트랙트 상호작용




