# 🗨 프로젝트 설명

사용자가 입력한 개인 정보 + Motion_Bed를 사용하며 생성되는 수면 정보 + 사용자가 Motion_Bed를 제어한 피드백 데이터들을 기반으로

사용자에게 빅데이터 기반의 맞춤형 숙면환경을 제공해주는 플랫폼을 설계 및 구현하는 것을 목표로 합니다.
 
------ 
# ⚡ Entity
* 😴 User
  * 모바일 앱을 통해 로그인 및 기본 정보를 입력합니다.
  * 모션베드 사용을 통해 개인 수면 정보를 생성합니다.
  * 모바일 앱 및 컨트롤러로 모션베드를 제어할 수 있습니다.

* 🛏Motion_Bed
  * 사용자 수면 정보를 BigData_Server에 전송합니다.
  * 컨트롤러를 통해 사용자가 Motion_Bed를 제어할 수 있고, 제어에 따라 생성된 피드백 데이터를 BigData_Server에 전송합니다.
  * AI_Server를 통해 전송받은 제어신호로 사용자에게 추천되는 숙면환경을 조정합니다
    * 침대 기울기 조정을 통한 코골이 완화
    * 사용자에게 최적의 보일러 온도 설정

* 🖥BigData_Server
  * 사용자 수면 정보, 사용자 개인 정보 및 피드백 데이터를 전송받습니다.
  * BigData_DataBase에 사용자 수면 정보, 사용자 개인 정보 및 피드백 데이터를 전송합니다.
  * 누적된 사용자 수면 정보, 사용자 개인 정보 및 피드백 데이터를 통해 수면 패턴 분석을 진행합니다.
  * 분석된 사용자 수면 패턴을 AI_Server에 전송합니다.

* 💾BigData_DataBase
  * BigData_Server에게 사용자 수면 정보 및 사용자 개인 정보를 전송받아 저장합니다.
  * BigData_Server가 필요로 하면 저장된 정보를 전송해줍니다.

* 🖥AI_Server
  * BigData_Server를 통해 분석된 수면 패턴을 전달받습니다.
  * AI_DataBase에 수면 패턴을 전달합니다.
  * 누적된 수면 패턴을 통해 숙면 콘텐츠를 생성합니다.
  * 생성된 숙면 콘텐츠를 통해 Motion_Bed에게 제어신호를 전달하고, Mobile 앱으로 콘텐츠를 전송합니다.

* 💾AI_DataBase
  * AI_Server에게 수면 패턴을 전송받아 저장합니다.
  * AI_DataBase가 필요로 하면 저장된 정보를 전송해줍니다.

* 📱Mobile
  * 사용자 개인 정보를 BigData_Server에 전송합니다.
  * 사용자가 Motion_Bed를 제어하도록 도와주고, 제어에 따라 생성된 피드백 데이터를 BigData_Server에 전송합니다.
  * AI_Server를 통해 전송받은 숙면 콘텐츠를 사용자에게 디스플레이 해줍니다.
  
-------
  # 📘 ERD 
  ![ERD_re](https://user-images.githubusercontent.com/82440364/124862837-0b063280-dff1-11eb-9eff-35e60fa0959a.PNG)


  
