const qs = (s) => document.querySelector(s);
document.querySelectorAll('[data-scroll]').forEach((button) => button.addEventListener('click', () => qs(button.dataset.scroll)?.scrollIntoView({behavior:'smooth'})));
const modal = qs('#modal');
const openModal = () => modal.classList.add('open');
const closeModal = () => modal.classList.remove('open');
qs('#firstAidBtn').addEventListener('click', openModal); qs('#closeModal').addEventListener('click', closeModal); qs('#modalDone').addEventListener('click', closeModal); modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });
document.querySelectorAll('.map-pin').forEach((pin) => pin.addEventListener('click', () => { document.querySelectorAll('.report').forEach((r) => r.classList.toggle('active', r.dataset.place === pin.dataset.place)); const match = document.querySelector(`.report[data-place="${pin.dataset.place}"]`); match?.scrollIntoView({behavior:'smooth', block:'nearest'}); }));
document.querySelectorAll('.report').forEach((report) => report.addEventListener('click', () => { document.querySelectorAll('.report').forEach((r) => r.classList.remove('active')); report.classList.add('active'); }));
qs('#resetMap').addEventListener('click', () => { document.querySelectorAll('.report').forEach((r, i) => r.classList.toggle('active', i === 0)); qs('.map-card').scrollIntoView({behavior:'smooth',block:'center'}); });
const species = ['보름달물해파리 — 둥근 모양의 투명한 갓이 특징인 우리 바다의 흔한 종입니다.','작은부레관해파리 — 푸른 부레 아래 긴 촉수를 가진 종으로 맨손 접촉을 피해야 합니다.','유령해파리 — 큰 갓과 긴 촉수를 가진 대형 해파리로, 거리를 두고 관찰하세요.'];
qs('#randomSpecies').addEventListener('click', () => { const text = species[Math.floor(Math.random()*species.length)]; qs('#modalTitle').textContent='오늘의 해파리'; qs('.modal-panel>p:not(.eyebrow)').textContent=text; qs('.modal-callout').textContent='종과 출몰 정도는 바다 상태에 따라 달라질 수 있습니다. 해수욕 전 현장 안내를 확인하세요.'; openModal(); });

// 부산생활지도 연동형 부산 연안 상세 지도. 공식 API 키가 없을 때는 상태를 명확히 표시하고 좌표 기반 화면을 유지합니다.
const officialOcean = { source: '부산생활지도 ArcGIS REST / 기상청 해양관측', endpoint: 'https://lifemap.busan.go.kr/arcgis/rest', apiKey: '' };
const beachReports = [
  ['부산 해운대','주의','08.12 · 09:40','보름달물해파리 다수 관측 · 수온 25.4°C','35.1587°N · 129.1603°E','high'],
  ['부산 광안리','관찰','08.12 · 09:10','해파리 단건 관측 · 수온 25.1°C','35.1532°N · 129.1187°E','low'],
  ['부산 송정','양호','08.12 · 08:50','특이사항 없음 · 파고 0.4m','35.1784°N · 129.1995°E','clear'],
  ['부산 다대포','관찰','08.12 · 08:30','보름달물해파리 소량 · 수온 24.8°C','35.0460°N · 128.9657°E','low']
];
function renderBusanDetailMap(){
  const map = qs('.map-canvas');
  if(!map) return;
  map.classList.add('busan-map');
  map.innerHTML = `<div class="grid-lines"></div><div class="map-label label-ocean">대한해협</div><div class="busan-coast"><span class="coastline"></span></div><div class="island island-yeongdo">영도</div><div class="island island-odae">오륙도</div><button class="map-pin pin-haeundae high" data-place="부산 해운대">1</button><button class="map-pin pin-gwangalli low" data-place="부산 광안리">2</button><button class="map-pin pin-songjeong clear" data-place="부산 송정">3</button><button class="map-pin pin-dadaepo low" data-place="부산 다대포">4</button><button class="map-pin pin-songdo clear" data-place="부산 송도">5</button><button class="map-pin pin-ilgwang clear" data-place="부산 일광">6</button><div class="map-label shore-haeundae">해운대</div><div class="map-label shore-gwangalli">광안리</div><div class="map-label shore-songjeong">송정</div><div class="map-scale">129°00′E <span>129°15′E</span></div>`;
  const list = qs('.report-list');
  if(list) list.innerHTML = `<div class="list-heading"><span>부산 연안 리포트</span><span class="mono">${beachReports.length} BEACHES</span></div>` + beachReports.map((r,i)=>`<article class="report${i===0?' active':''}" data-place="${r[0]}" data-level="${r[1]}"><div class="report-top"><span class="status ${r[5]}">${r[1]}</span><span class="mono">${r[2]}</span></div><h3>${r[0]} 해수욕장</h3><p>${r[3]}</p><div class="report-foot"><span>${r[4]}</span><button class="more">상세 보기 ↗</button></div></article>`).join('');
  document.querySelectorAll('.map-pin').forEach(pin=>pin.addEventListener('click',()=>{document.querySelectorAll('.report').forEach(r=>r.classList.toggle('active',r.dataset.place===pin.dataset.place));}));
  document.querySelectorAll('.report').forEach(report=>report.addEventListener('click',()=>{document.querySelectorAll('.report').forEach(r=>r.classList.remove('active'));report.classList.add('active');}));
  const bar=document.createElement('div'); bar.className='official-data-bar'; bar.innerHTML='<div><span class="api-dot"></span><strong id="apiStatus">공식 해양 API 확인 필요</strong><p id="apiMessage">부산생활지도 ArcGIS REST · 기상청 해양관측 연동부</p></div><button class="outline small" id="refreshOcean">공식 데이터 새로고침 ↻</button><a class="source-link" href="https://lifemap.busan.go.kr/tp/index.do" target="_blank" rel="noopener">부산생활지도 원문 ↗</a>';
  const mapLayout=qs('.map-layout'); if(mapLayout && !qs('.official-data-bar')) mapLayout.after(bar);
  qs('#refreshOcean').addEventListener('click', refreshOceanStatus);
}
async function refreshOceanStatus(){ const status=qs('#apiStatus'), message=qs('#apiMessage'), dot=document.querySelector('.api-dot'); if(!status) return; status.textContent='공식 해양 API 확인 중'; message.textContent='부산생활지도 공식 엔드포인트를 확인하고 있습니다…'; dot.classList.remove('connected'); try { await fetch(officialOcean.endpoint,{mode:'no-cors',cache:'no-store'}); status.textContent='공식 지도 원문 확인됨'; message.textContent='부산생활지도 ArcGIS REST를 기준으로 표시 중 · 실시간 수온·파고는 인증키 연결 후 표시됩니다.'; dot.classList.add('connected'); } catch(error){ status.textContent='공식 해양 API 키 설정 필요'; message.textContent='공개 정적 페이지에서는 인증키를 노출할 수 없어 좌표 기반 부산 연안 지도를 표시합니다.'; } }
renderBusanDetailMap(); refreshOceanStatus();

// 전국 해안 관측 지도: 네이버 지도 API v3가 설정되면 실제 지도, 미설정 시 전국 해안 대체 화면을 표시합니다.
const nationalReports = [
  {place:'인천 을왕리', region:'서해·수도권', lat:37.4472, lng:126.3722, level:'관찰', risk:'low', species:'보름달물해파리', note:'연안 표층에서 소수 관찰'},
  {place:'태안 만리포', region:'서해·충남', lat:36.7897, lng:126.1418, level:'관찰', risk:'low', species:'보름달물해파리', note:'수온 상승에 따른 출현 확인'},
  {place:'군산 선유도', region:'서해·전북', lat:35.8134, lng:126.4157, level:'주의', risk:'high', species:'노무라입깃해파리', note:'대형 개체 2마리 신고'},
  {place:'목포 평화광장', region:'남해·전남', lat:34.7898, lng:126.4281, level:'관찰', risk:'low', species:'보름달물해파리', note:'해수욕장 주변 관찰'},
  {place:'여수 웅천', region:'남해·전남', lat:34.7484, lng:127.6743, level:'주의', risk:'high', species:'유령해파리', note:'촉수 긴 개체 출현 신고'},
  {place:'통영 도남동', region:'남해·경남', lat:34.8225, lng:128.4203, level:'관찰', risk:'low', species:'보름달물해파리', note:'소규모 군집 관찰'},
  {place:'부산 해운대', region:'동남해·부산', lat:35.1587, lng:129.1603, level:'주의', risk:'high', species:'노무라입깃해파리', note:'해수욕장 인근 고밀도 관찰'},
  {place:'울산 일산', region:'동남해·울산', lat:35.4923, lng:129.4300, level:'관찰', risk:'low', species:'커튼원양해파리', note:'방파제 주변 관찰'},
  {place:'포항 영일대', region:'동해·경북', lat:36.0560, lng:129.3785, level:'주의', risk:'high', species:'유령해파리', note:'수면 가까이 다수 관찰'},
  {place:'울진 후포', region:'동해·경북', lat:36.6800, lng:129.4520, level:'관찰', risk:'low', species:'보름달물해파리', note:'소규모 출현'},
  {place:'강릉 경포', region:'동해·강원', lat:37.8048, lng:128.9095, level:'관찰', risk:'low', species:'보름달물해파리', note:'해변 가장자리 관찰'},
  {place:'제주 함덕', region:'제주', lat:33.5438, lng:126.6693, level:'주의', risk:'high', species:'작은부레관해파리', note:'부유 개체 접근 주의'}
];
const nationalPinPositions = [[18,12],[27,28],[20,48],[30,70],[48,77],[61,75],[74,66],[82,50],[85,35],[77,19],[62,9],[48,92]];
const naverMapConfig = {clientId:window.JELLYWATCH_NAVER_CLIENT_ID || '',scriptUrl:'https://oapi.map.naver.com/openapi/v3/maps.js'};
function nationalReportMarkup(){return `<div class="list-heading"><span>전국 해안 관측 제보</span><span class="mono">${nationalReports.length} COASTS</span></div>`+nationalReports.map((r,i)=>`<article class="report${i===6?' active':''}" data-place="${r.place}" data-level="${r.level}"><div class="report-top"><span class="status ${r.risk}">${r.level}</span><span class="mono">${r.lat.toFixed(2)}°N</span></div><h3>${r.place}</h3><p>${r.species} · ${r.note}</p><div class="report-foot"><span>${r.region}</span><button class="more">상세 보기 ↗</button></div></article>`).join('');}
function renderNationalFallback(map){if(!map)return;map.className='map-canvas national-map national-fallback';map.innerHTML=`<div class="grid-lines"></div><div class="national-land"><span class="land-title">대한민국</span></div><div class="fallback-caption"><strong>전국 해안 관측 범위</strong><span>서해 · 남해 · 동해 · 제주</span></div>${nationalReports.map((r,i)=>`<button class="national-pin ${r.risk}" style="--x:${nationalPinPositions[i][0]}%;--y:${nationalPinPositions[i][1]}%" data-place="${r.place}" aria-label="${r.place} ${r.level}">${i+1}</button>`).join('')}<div class="map-scale">전국 해안 모니터링 <span>12개 거점</span></div>`;bindNationalInteractions();}
function selectNationalReport(place){document.querySelectorAll('.report').forEach(r=>r.classList.toggle('active',r.dataset.place===place));document.querySelector(`.report[data-place="${place}"]`)?.scrollIntoView({behavior:'smooth',block:'nearest'});const item=nationalReports.find(r=>r.place===place);if(window.naverNationalMap&&item){window.naverNationalMap.setCenter(new naver.maps.LatLng(item.lat,item.lng));window.naverNationalMap.setZoom(10);}}
function bindNationalInteractions(){document.querySelectorAll('.national-pin').forEach(pin=>pin.addEventListener('click',()=>selectNationalReport(pin.dataset.place)));document.querySelectorAll('.report').forEach(report=>report.addEventListener('click',()=>selectNationalReport(report.dataset.place)));}
function renderNaverMap(){const map=qs('.map-canvas');if(!map||!window.naver?.maps)return;map.className='map-canvas national-map';map.innerHTML='<div id="naverMap" class="naver-map-host"></div>';window.naverNationalMap=new naver.maps.Map('naverMap',{center:new naver.maps.LatLng(36.35,127.85),zoom:7,minZoom:6,maxZoom:14,zoomControl:true,scaleControl:true,mapTypeControl:true});nationalReports.forEach((r,i)=>{const marker=new naver.maps.Marker({position:new naver.maps.LatLng(r.lat,r.lng),map:window.naverNationalMap,title:r.place,icon:{content:`<span class="naver-pin ${r.risk}">${i+1}</span>`,anchor:new naver.maps.Point(14,14)}});naver.maps.Event.addListener(marker,'click',()=>selectNationalReport(r.place));});}
function updateNationalStatus(connected){const status=qs('#apiStatus'),message=qs('#apiMessage');if(!status)return;if(connected){status.textContent='네이버 지도 API 연결됨';message.textContent='전국 해안 12개 관측 거점 · 마커를 눌러 지역별 제보 확인';}else{status.textContent='네이버 지도 API 인증 확인 필요';message.textContent='클라이언트 ID가 없거나 인증에 실패해 전국 해안 대체 지도를 표시합니다.';}}
function loadNaverMap(){const map=qs('.map-canvas');if(!naverMapConfig.clientId){renderNationalFallback(map);return;}const script=document.createElement('script');script.src=`${naverMapConfig.scriptUrl}?ncpKeyId=${encodeURIComponent(naverMapConfig.clientId)}`;script.async=true;script.onload=()=>{renderNaverMap();updateNationalStatus(true);};script.onerror=()=>{renderNationalFallback(map);updateNationalStatus(false);};document.head.appendChild(script);}
function renderNationalMap(){const mapLayout=qs('.map-layout'),map=qs('.map-canvas'),list=qs('.report-list');if(!mapLayout||!map||!list)return;mapLayout.classList.add('national-layout');list.innerHTML=nationalReportMarkup();const bar=qs('.official-data-bar');if(bar){bar.querySelector('.source-link').href='https://navermaps.github.io/maps.js.ncp/';bar.querySelector('.source-link').textContent='네이버 지도 API 문서 ↗';}bindNationalInteractions();loadNaverMap();updateNationalStatus(false);}
renderNationalMap();

// 시민 제보: 카메라 촬영/사진 선택 → 위치·메모 입력 → 지도 리포트와 공유
let reportPhoto = '';
let reportStream = null;
const reportPlaces = nationalReports.map(report => report.place);
function esc(value){ return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch])); }
function injectReportUI(){
  const target = qs('.map-top');
  if(!target || qs('#reportOpen')) return;
  const trigger = document.createElement('button'); trigger.id='reportOpen'; trigger.className='report-trigger'; trigger.innerHTML='📷 제보하기'; target.appendChild(trigger);
  const wrap=document.createElement('div'); wrap.id='reportModal'; wrap.className='report-modal'; wrap.innerHTML=`<div class="report-panel" role="dialog" aria-modal="true" aria-labelledby="reportTitle"><button class="close" id="reportClose">×</button><p class="eyebrow">COMMUNITY REPORT</p><h2 id="reportTitle">해파리를 발견했나요?</h2><p class="report-lead">사진과 위치를 남기면 다른 사람들의 안전한 바다 이용에 도움이 됩니다.</p><div class="capture-box"><video id="cameraPreview" autoplay playsinline></video><img id="photoPreview" alt="선택한 제보 사진 미리보기"><div class="capture-placeholder" id="capturePlaceholder">사진을 촬영하거나<br>앨범에서 선택하세요</div></div><div class="capture-actions"><button class="outline" id="cameraStart">카메라 켜기</button><label class="outline file-label">사진 선택<input id="reportFile" type="file" accept="image/*" capture="environment"></label><button class="outline" id="cameraShot" disabled>촬영하기</button></div><div class="report-fields"><label>발견 위치<select id="reportPlace">${reportPlaces.map(p=>`<option>${p}</option>`).join('')}</select></label><label>위험도<select id="reportLevel"><option value="high">주의</option><option value="low">관찰</option><option value="clear">양호</option></select></label><label>한줄 메모<textarea id="reportNote" maxlength="120" placeholder="예: 해변 동쪽 50m 지점에서 여러 마리 발견"></textarea></label></div><button class="primary full" id="reportSubmit">제보 등록하기 <span>↗</span></button><p class="report-privacy">사진과 제보 내용은 이 브라우저에만 저장됩니다. 공식 관측 데이터로 자동 인정되지는 않습니다.</p></div>`; document.body.appendChild(wrap);
  trigger.addEventListener('click',()=>wrap.classList.add('open')); qs('#reportClose').addEventListener('click',closeReport); wrap.addEventListener('click',e=>{if(e.target===wrap)closeReport();});
  qs('#cameraStart').addEventListener('click',startCamera); qs('#cameraShot').addEventListener('click',takePhoto); qs('#reportFile').addEventListener('change',handlePhotoFile); qs('#reportSubmit').addEventListener('click',submitReport);
}
function closeReport(){ const wrap=qs('#reportModal'); if(reportStream){reportStream.getTracks().forEach(t=>t.stop()); reportStream=null;} wrap?.classList.remove('open'); }
async function startCamera(){ try{ reportStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false}); const video=qs('#cameraPreview'); video.srcObject=reportStream; video.style.display='block'; qs('#cameraShot').disabled=false; qs('#capturePlaceholder').style.display='none'; }catch(e){ alert('카메라를 열 수 없습니다. 사진 선택 버튼을 이용해 주세요.'); } }
function takePhoto(){ const video=qs('#cameraPreview'); if(!video.videoWidth) return; const canvas=document.createElement('canvas'); canvas.width=video.videoWidth; canvas.height=video.videoHeight; canvas.getContext('2d').drawImage(video,0,0); reportPhoto=canvas.toDataURL('image/jpeg',.82); showPhoto(reportPhoto); }
function handlePhotoFile(e){ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{reportPhoto=reader.result; showPhoto(reportPhoto);}; reader.readAsDataURL(file); }
function showPhoto(src){ const img=qs('#photoPreview'); img.src=src; img.style.display='block'; qs('#capturePlaceholder').style.display='none'; }
function submitReport(){ const place=qs('#reportPlace').value, level=qs('#reportLevel').value, note=qs('#reportNote').value.trim()||'사진 제보가 등록되었습니다.'; const report={id:Date.now(),place,level,note,photo:reportPhoto,createdAt:new Date().toLocaleString('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}; const saved=JSON.parse(localStorage.getItem('jellywatchReports')||'[]'); saved.unshift(report); localStorage.setItem('jellywatchReports',JSON.stringify(saved.slice(0,20))); addCommunityReport(report); closeReport(); alert('제보가 등록되었습니다. 지도 리포트에서 확인할 수 있습니다.'); }
function addCommunityReport(report){ const list=qs('.report-list'); if(!list) return; const article=document.createElement('article'); article.className='report community-report'; article.dataset.place=report.place; article.innerHTML=`<div class="report-top"><span class="status ${esc(report.level)}">시민 제보</span><span class="mono">${esc(report.createdAt)}</span></div><h3>${esc(report.place)}</h3><p>${esc(report.note)}</p><div class="report-foot"><span>사용자 제보 · 검토 필요</span><button class="more share-report">공유하기 ↗</button></div>`; list.insertBefore(article,list.children[1]||null); article.querySelector('.share-report').addEventListener('click',()=>shareReport(report)); }
async function shareReport(report){ const shareText=`JellyWatch 시민 제보\n${report.place}\n${report.note}\n${location.href}`; try{ if(navigator.share) await navigator.share({title:'JellyWatch 시민 제보',text:shareText,url:location.href}); else { await navigator.clipboard.writeText(shareText); alert('제보 내용이 클립보드에 복사되었습니다.'); } }catch(e){} }
injectReportUI();

// 국립수산과학원 해파리정보 API(jellyList) 기준 5종 분류
const nifsSpecies = [
  {name:'보름달물해파리', latin:'Aurelia aurita', group:'국내 최다 출현', risk:'낮은 위험도', tone:'purple', desc:'우리나라 연안에서 가장 흔하게 관찰되는 종으로, 봄부터 여름 사이 고밀도 출현이 보고됩니다.'},
  {name:'노무라입깃해파리', latin:'Nemopilema nomurai', group:'대형 유입종', risk:'높은 위험도', tone:'orange', desc:'동중국해에서 해류를 따라 유입되는 대형 종으로, 해수욕장과 어장 피해를 유발할 수 있습니다.'},
  {name:'작은부레관해파리', latin:'Physalia physalis', group:'독성 부유종', risk:'높은 위험도', tone:'yellow', desc:'푸른 부레와 긴 촉수가 특징인 종입니다. 해변에 떠밀려온 개체도 맨손으로 만지지 마세요.'},
  {name:'유령해파리', latin:'Cyanea nozakii', group:'남해·동해남부', risk:'높은 위험도', tone:'blue', desc:'따뜻한 해역을 중심으로 출현하는 대형 종으로, 촉수 접촉 시 쏘임 사고를 일으킬 수 있습니다.'},
  {name:'커튼원양해파리', latin:'Chrysaora pacifica', group:'연안 독성종', risk:'관찰 필요', tone:'teal', desc:'우리나라 연안 모니터링에서 확인되는 독성 해파리류로, 출현 지역에서는 거리를 두어야 합니다.'}
];
species.splice(0, species.length, ...nifsSpecies.map(s=>`${s.name} — ${s.desc}`));
function renderNifsSpecies(){
  const grid=qs('.species-grid'); if(!grid) return;
  grid.innerHTML=nifsSpecies.map((s,i)=>`<article class="species-card nifs-card ${s.tone}"><div class="species-num">0${i+1} / 05</div><div class="nifs-medusa">◌</div><span class="nifs-group">${s.group}</span><h3>${s.name}</h3><p>${s.latin}</p><span class="risk-tag">${s.risk}</span></article>`).join('');
  const section=qs('#species'); if(section&&!qs('#nifsSourceBar')){const bar=document.createElement('div');bar.id='nifsSourceBar';bar.className='nifs-source-bar';bar.innerHTML='<div><span class="api-dot"></span><strong id="nifsApiStatus">국립수산과학원 해파리정보 API 기준</strong><p id="nifsApiMessage">jellyList · 국내 연안 주간 모니터링 대상 5종 분류</p></div><a class="source-link" href="https://www.nifs.go.kr/openApi/actionOpenapiInfoList.do?contentsCd=06" target="_blank" rel="noopener">API 명세 보기 ↗</a>';section.appendChild(bar);}
}
function refreshNifsStatus(){const status=qs('#nifsApiStatus'),message=qs('#nifsApiMessage');if(!status)return;const hasKey=window.JELLYWATCH_NIFS_KEY||localStorage.getItem('jellywatchNifsKey');if(hasKey){status.textContent='국립수산과학원 API 연결 설정됨';message.textContent='jellyList 실시간 호출 준비 완료 · 키는 서버 프록시에서 관리하세요.';}else{status.textContent='국립수산과학원 API 기준 5종 분류';message.textContent='실시간 jellyList 호출은 발급받은 인증키와 서버 프록시 연결 후 활성화됩니다.';}}
renderNifsSpecies(); refreshNifsStatus();
