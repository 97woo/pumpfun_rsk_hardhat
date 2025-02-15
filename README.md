# pump-fun
사전 준비사항

Node.js와 npm이 설치되어 있어야 합니다
MetaMask 지갑이 필요합니다
Git이 설치되어 있어야 합니다

설치 및 설정 방법
스마트 컨트랙트 배포

저장소를 클론하고 컨트랙트 디렉토리로 이동합니다:

bashCopygit clone [저장소-URL]
cd [프로젝트-디렉토리]/contract

의존성 패키지를 설치합니다:

bashCopynpm install

환경 변수를 설정합니다:

.env.sample을 .env로 복사합니다
필요한 변수들을 설정합니다


로컬 Hardhat 노드를 시작합니다:

bashCopynpx hardhat node

컨트랙트를 컴파일하고 배포합니다:

bashCopynpx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
배포된 컨트랙트 주소를 메모해두세요. 프론트엔드 설정에 필요합니다:
CopyTokenFactory deployed to: 0xE38aF3FDa379401445FFD7b9cD57D0D33d03790E
프론트엔드 설정

프론트엔드 디렉토리로 이동합니다:

bashCopycd ../frontend

의존성 패키지를 설치합니다:

bashCopynpm install

프론트엔드를 설정합니다:

.env 파일에 배포된 컨트랙트 주소를 설정합니다
artifacts에서 컨트랙트 ABI를 복사하여 abi.js에 붙여넣습니다


개발 서버를 시작합니다:

bashCopynpm start
지갑 설정

MetaMask에 새 계정을 추가합니다:

"계정 가져오기" 클릭
Hardhat 로컬 네트워크에서 제공한 프라이빗 키를 입력합니다



Hardhat 로컬 네트워크의 계정 예시:
CopyAccount #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

프론트엔드 인터페이스를 통해 지갑을 DApp에 연결합니다

테스트
모든 설정이 완료되면 다음과 같은 작업을 수행할 수 있습니다:

새로운 토큰 생성
기존 토큰 관리
프론트엔드를 통한 스마트 컨트랙트 상호작용
