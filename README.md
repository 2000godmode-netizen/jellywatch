# JellyWatch

해파리 출몰 지역과 해파리 안전 정보를 한눈에 보여주는 반응형 정적 웹앱입니다.

## 실행

`index.html`을 브라우저에서 열거나 정적 호스팅에 업로드하면 됩니다.

## 참고

현재 화면은 부산생활지도의 공식 ArcGIS REST 엔드포인트(`https://lifemap.busan.go.kr/arcgis/rest`)를 연결 기준으로 사용하고, 부산 연안 6개 해수욕장의 좌표·해안 구간을 구체적으로 표시합니다. 부산생활지도는 현재 시스템 점검 상태일 수 있으며, 해양 관측 실시간 값(수온·파고·풍속·해파리 출현)은 별도 공공데이터 API 키가 필요합니다. 키는 GitHub Pages 코드에 직접 넣지 말고 서버리스 프록시/환경변수로 연결하세요.

공식 출처: [부산생활지도](https://lifemap.busan.go.kr/tp/index.do), [부산생활지도 ArcGIS REST](https://lifemap.busan.go.kr/arcgis/rest), [기상청 API허브 해양관측](https://apihub.kma.go.kr/).

해파리 도감의 5종 분류는 [국립수산과학원 해파리정보 API 명세](https://www.nifs.go.kr/openApi/actionOpenapiInfoList.do?contentsCd=06)의 `jellyList` 기준을 반영했습니다. 이 API는 `https://www.nifs.go.kr/OpenAPI_json?id=jellyList&key=발급키&sdate=yyyymmdd&edate=yyyymmdd` 형식이며, 발급키가 필요한 공식 API입니다. GitHub Pages에는 키를 넣지 않고 서버리스 프록시에서 관리하도록 구성했습니다.

지도는 부산 연안만 표시하도록 구성했습니다. `window.JELLYWATCH_GOOGLE_MAPS_API_KEY`에 HTTP 리퍼러 제한을 설정한 공개용 Google Maps API 키를 넣으면 부산 연안 6개 관측 구간의 실제 지도와 마커가 표시되며, 키가 없을 때는 부산 상세 대체 지도가 표시됩니다. Google Cloud에서 Maps JavaScript API를 활성화하고 결제 계정을 설정해야 합니다. 키는 저장소에 직접 넣지 마세요.

부산 구간은 [부산생활지도 ArcGIS REST](https://lifemap.busan.go.kr/arcgis/rest?f=json) 상태를 확인하면서 해운대·광안리·송정·다대포·송도·일광 6개 관측 구간을 표시합니다. 부산생활지도 서버가 점검 중이거나 레이어 응답을 읽을 수 없을 때는 공식 API 주소와 상태를 표시하고, 좌표 기반 부산 연안 대체 지도를 사용합니다.
