Module `shinsegae` → js/places/shinsegae.js (신세계백화점 강남점), round 4. Neighbours for smoke: gotomall centralcity jwmarriott.

Independent reviewers compared the current build with 2025/2026 Kakao roadview frames, aerial photos and older photos (renders in shots/verify/). Fix every issue below, highest priority first, then re-check the rest still holds. The user, who knows the place, complained it looked imagined and airport/railway-like — every visible element must be justified by a reference.

## Issues to fix
- (high) 꽃 로고와 SHINSEGAE 글자가 동측 탑 북면에 붙어 있습니다. 실제로는 서측 탑 북면, Piaget 초상 광고 바로 위에 있습니다. 동측 탑(CHANEL 광고 쪽) 북면에는 로고가 없습니다.
  where: js/places/shinsegae.js towerLogo 호출부(약 303~304행): towerLogo('N', UW - TOWER_W / 2, ...)
  evidence: refs/roadview/ssg_06(남향, 좌측 끝에 경부선 계단형 입면이 보이므로 왼쪽=동쪽): 꽃+SHINSEGAE는 오른쪽=서측 탑 위, Piaget 광고 위에 있고, 왼쪽 탑(CHANEL)에는 로고가 없습니다. refs/roadview/cc_01(북서 광장에서 남동향)도 서측 탑 북면 Piaget 위에 SHINSEGAE가 있습니다. refs/roadview/ssg_05도 서측 탑 북면 상단에 SHINSEGAE가 보입니다. 모델 shots/verify/shinsegae/ssg06.png·cmp_1.png에서는 로고가 왼쪽(동측) 탑에 있고, ssg05.png의 서측 탑 북면에는 로고가 없습니다.
  FIX: towerLogo('N', UW - TOWER_W / 2, TOWERS[1][2] - 8.5)를 towerLogo('N', TOWER_W / 2, TOWERS[0][2] - 8.5)로 옮깁니다(u=9.25, 서측 탑 북면, 상단 창 줄 바로 아래). 동측 탑 북면 로고는 삭제합니다. 코드 주석의 'brief: east/north' 전제가 로드뷰와 반대입니다. 서측 탑 서면(W) 로고는 로드뷰로 확인되지 않았습니다. cc_01 서면 상단에는 창만 보이므로 빼는 쪽을 권합니다.
- (high) 외벽 석재가 어둡고 채도 높은 초콜릿 갈색 단색으로 렌더됩니다. 실제는 더 밝은 분홍빛 모브(로즈 토프) 톤이고, 약 0.3m 단의 엇갈린 벽돌식 줄눈과 옅은 수평 띠가 멀리서도 뚜렷하게 보입니다.
  where: stone('ssg_granite', '#9b8179') 텍스처, 외벽 전면
  evidence: 실제 평균색: ssg_06 탑 #796f72·#8e7d7e, ssg_05 #846f67, cc_01 #8e7d7a, ssg_03 동측 벽 #736f76입니다. R이 G보다 10~17 높고 B는 G와 같거나 높은 모브 계열입니다. 모델 렌더는 ssg06.png·v03.png·vW.png 모두 #66544f로, 더 어둡고 B<G인 갈색입니다. refs/roadview/ssg_03을 확대하면 0.3m 안팎의 엇갈린 줄눈과 옅은 수평 띠 2줄이 선명합니다. 모델 v03.png는 같은 벽이 거의 무늬 없는 평면입니다.
  FIX: 렌더가 약 0.65배로 어두워지는 점을 감안해 바탕색을 #9b8179에서 약 #c2abaf(밝은 로즈 토프)로 올립니다. 렌더 목표는 맑은 날 #857579~#8e7d7e입니다. 줄눈 대비를 높입니다: 어두운 선 rgba(54,40,36,0.18)→0.35, 밝은 선 0.15→0.35. 반복 [2.4,1.2]에 4단이면 0.3m 단이므로 단 높이는 유지합니다. 옅은 수평 띠(0xac958b)는 색을 #d2c3c0 쪽으로 밝힙니다. 동측 벽에는 퍼골라 위 약 8m와 10.5m 높이에 2줄을 둡니다.
- (high) 정문 앞 보행 광장과 캔옵 아래, 출입 슬롯 바닥이 밝은 회색 판석입니다. 실제 캔옵 아래 바닥은 짙은 차콜색입니다.
  where: K.slab(rect(0, -7.4, UW, 0), ... 'ssg_paving'), K.slab(rect(23, 0, 44, 5), ...)
  evidence: refs/roadview/ssg_02 캔옵 아래 바닥 평균 #302e2d~#434242이고, ssg_01도 같은 짙은 바닥입니다. 모델 shots/verify/shinsegae/v01b.png·ssg01.png 같은 영역은 #949088로 매우 밝습니다.
  FIX: 정문 앞 rect(0,-7.4,UW,0)와 슬롯 rect(23,0,44,5)의 재질을 짙은 화강석 판석으로 바꿉니다: ssg_paving 바탕 #9d9a94→약 #4a4744, 줄눈 #3a3836. 차로 쪽 rect(-10,-22,77,-14.6) 보행 광장은 그대로 두어도 됩니다.
- (high) The SHINSEGAE wordmark and flower are on the wrong tower and too faint to read. Today the model puts them on the EAST tower's north face (plus the west tower's west face). The real 2026 sign is on the WEST tower's NORTH face, directly under the top row of square windows, in bright white letters. The east tower top is bare.
  where: js/places/shinsegae.js towerLogo calls (~line 302-303) and the ssg_wordmark texture (~line 163)
  evidence: In refs/roadview/ssg_06 (crop shots/verify/critic/z_ssg06_logo_ref.png), the right (west) tower carries a red flower + white 'SHINSEGAE' just below the window row and the left (east) tower has none. refs/roadview/cc_01 shows the same face, with the PIAGET portrait below it. In the model (shots/verify/critic/ssg06.png, crop z_ssg06_logo_model.png), only a faint '...AE' appears on the east tower and the west tower's north face is blank. shots/verify/critic/cc01.png and ssg_logo.png also show only a tiny red dot.
  FIX: Replace towerLogo('N', UW - TOWER_W/2, …) with towerLogo('N', TOWER_W/2, TOWERS[0][2] - 6.5) so it sits about 2.5 m under the window row at top-4. Drop the west-face logo: cc_01 shows only a narrow vertical light banner on that face. Make the wordmark about 13 m × 1.9 m in pure #ffffff, with slight emissive (~0.25) so it reads on the brown stone. Make the flower about 2.8 m in #d7192d, left of the text.
- (medium) 쇼윈도가 하얗게 빛나는 상자로 보입니다(emissive 밝은 배경에 회색 받침 3개). 실제는 짙은 내부에 조명 받은 상품 하나가 보이는 쇼윈도이고, 차양도 평판이 아니라 앞이 경사진 붉은 천 차양입니다.
  where: awningWindow(): faceQuad({tex:'emit', color:0xe8e2d6}...), 차양 faceBox 0x8f2639
  evidence: refs/roadview/ssg_02 좌우 확대: 진한 배경에 시계 하나가 조명을 받고 있고, 붉은 경사 천 차양 앞면에 작은 흰 SHINSEGAE 글자가 있으며 프레임은 깊게 들어가 있습니다. refs/roadview/ssg_03 동측 붉은 차양 아래도 어두운 개구부입니다. 모델 v03.png·vW.png·vNE.png·ssg01.png에서는 흰 발광 패널이 멀리서도 하얀 상자로 튑니다.
  FIX: 배경 emissive 0xe8e2d6을 무발광 #1c1a19로 바꾸고, 중앙에 0.5m 정도의 작은 emit 스포트(상품) 1개만 둡니다. 차양은 수평 판 대신 위 0.1m에서 아래 0.9m로 튀어나오는 약 25° 경사면으로 만들고(색 #a8202c), 경사 앞면에 흰 SHINSEGAE 0.19m 글자를 유지합니다. 동측(E) 차양 폭은 실제 기준 약 2.5m 두 개를 0.5m 간격으로 둡니다(현재 4.4m×2).
- (medium) 서측 탑 북면 1층(u 0~18)이 빈 석벽입니다. 실제는 나무 뒤로 붉은 테두리 쇼윈도 여러 칸과 화단이 이어지고, 2층 높이 NW 모서리 가까이에 사각 액자형 창(또는 스크린)이 하나 있습니다.
  where: 북면 1층 서측 탑 구간 u 0~18.5, v 0
  evidence: refs/roadview/cc_01 하단 확대: 서측 탑 북면 아래 나무 뒤로 붉은·흰 테두리 쇼윈도가 4칸 이상 보이고, 그 앞에 낮은 석재 화단과 산울타리가 있습니다. 2층 높이 NW 모서리 쪽에 밝은 사각 창이 있습니다. 모델 shots/verify/shinsegae/vW.png는 같은 구간이 무창 석벽이고, u 18.8 쇼윈도 하나만 있습니다.
  FIX: awningWindow('N', u, 3.2)를 u ≈ 3.5, 7.5, 11.5, 15.0에 추가합니다(폭 3.2m, 위 실제와 같은 어두운 내부). 그 앞 v -1.6~-0.2에 높이 0.6m 석재 화단과 높이 1m 산울타리(#3f593c)를 u 0~17로 둡니다. 2층(y ≈ 8.5) u ≈ 2.5에 squareWindow('N', 2.5, 8.5, 1.6, true)를 하나 추가합니다.
- (medium) 유리 곡면 베이와 커튼월이 청록색에 세로 줄무늬로 보입니다. 실제는 더 밝은 청회색이고, 층마다 수평 멀리언 띠가 주된 무늬입니다.
  where: K.texture('ssg_glass', ...) — 세로 하이라이트(w*0.17)와 세로 테두리선
  evidence: refs/roadview/ssg_06 확대: 커튼월과 곡면 베이 유리 평균 #748890·#6a7f86(청회색)이고, 곡면 베이에 수평 띠 4~5줄이 뚜렷합니다. 모델 ssg06.png 같은 영역은 #4f5f5f·#556554(녹청)이고, 빗물 같은 세로 줄무늬가 보입니다.
  FIX: ssg_glass 바탕 그라디언트를 #80999a→#627c7e에서 #a9bcc4→#8ea3ac(청회색)로 바꿉니다. 세로 하이라이트 띠는 제거합니다. 텍스처 하단에 굵기 6px 정도의 어두운 수평 스팬드럴 선(#4c5a60)을 그려 floorH 3.2마다 수평 띠가 생기게 합니다. 세로 멀리언은 1px, 낮은 대비로 둡니다.
- (medium) 정문 캔옵이 너무 낮아(4.65m) 유리 출입부 상부가 가려지고, 출입부가 낮고 납작한 문짝처럼 보입니다. 실제는 캔옵 밑면까지 검은 멀리언 격자의 유리벽이 통째로 올라가는 높은 유리 출입부입니다.
  where: gridCanopy('N', ENTRY, 25.4, 6.8, 4.65); entrance('N', ENTRY, 10.4, 5)
  evidence: refs/roadview/ssg_01·ssg_02: 문(약 3m) 위로 문 높이의 약 1배만큼 유리 트랜섬 격자가 캔옵 밑까지 이어지고, 유리 출입부 높이는 약 5.8m로 읽힙니다. 기둥(검은 원형 2개)은 유리 출입부 바로 바깥에 있습니다. 모델 shots/verify/shinsegae/ssg01.png·v01b.png는 문 띠(SHINSEGAE) 위가 캔옵 그늘의 검은 면이라 유리 개구부가 가로로 납작해 보입니다(약 2.8:1, 실제 약 2.1:1).
  FIX: 북측 gridCanopy 높이를 4.65에서 약 5.9로 올립니다(기둥 높이도 같이). entrance('N') 트랜섬 top 5.86을 캔옵 밑(5.7)까지 맞추고, 트랜섬에 1.2m 간격 검은 세로 멀리언과 2.9m 높이 가로 멀리언을 넣습니다. 출입 유리 폭은 10.4에서 약 12m로 소폭 넓힙니다.
- (medium) 동측 벽 사각 창 2개가 퍼골라보다 약 1.9m 위에 떠 있습니다. 실제는 창 아랫변이 퍼골라 지붕선에 거의 닿아 있습니다. 또 실제 동측 벽 NE 모서리 부근에는 사각 창 열이 없는데, 모델에는 10m부터 4.8m 간격으로 창 열이 있습니다.
  where: squareWindow('E', v, 5.4, 1.2, true) for v of [8,14]; for f of ['W','E'] squareWindow(f, 2.2, 10 + i*4.8, ...); gridCanopy('E', 13, 22, 3.4, 3.55)
  evidence: refs/roadview/ssg_03 확대: 그릴 창 2개의 아랫변이 퍼골라 지붕 위선과 거의 같은 높이이고, 그 위로 옅은 수평 띠 2줄과 왼쪽 작은 환기구 하나 외에는 무창입니다. 오른쪽 NE 모서리까지 이어지는 벽에도 창이 없습니다. 모델 shots/verify/shinsegae/ssg03.png·v03.png에서는 창과 퍼골라 사이가 비어 있고, 오른쪽 위(모서리 쪽)에 창이 하나 더 보입니다.
  FIX: 동측 창을 squareWindow('E', v, 4.0, 1.3, true)로 내리거나, 퍼골라를 3.55에서 약 4.0으로 올려 창 아랫변과 붙입니다. 동측 붉은 차양 위끝은 퍼골라보다 약 1m 아래(≈3.0m)로 둡니다. 'E' 면의 v=2.2 창 열(6개)은 삭제합니다('W' 면 열은 근거가 없으면 같이 빼기를 권합니다). 동측 벽 왼쪽(v ≈ 2 쪽이 아니라 퍼골라 남단 쪽) 약 10m 높이에 0.6m 사각 환기구 하나를 추가할 수 있습니다.
- (medium) 동측 주차장의 장애인 주차면(파란 면)이 건물 쪽 A열에 있습니다. 실제는 펜스와 산울타리 쪽 B열에 3면 이상 있고, 바퀴멈춤은 펜스 쪽입니다. 주차장 북단에는 주차 정산·차단기 설비가 있는데 모델에는 없습니다.
  where: 동측 주차장 루프: const accessible = row === 'A' && i < 3
  evidence: refs/roadview/ssg_04 확대(북향): 오른쪽 녹색 펜스 바로 앞 열에 파란 장애인 면이 3~4면 연속되고, 노랑·검정 바퀴멈춤이 펜스 쪽에 있습니다. 왼쪽 북단에는 차단기와 정산기 기둥(노랑·검정 받침)이 보입니다. 모델 shots/verify/shinsegae/ssg04.png·v04.png는 파란 면이 왼쪽(건물 쪽) A열에 있고 북단은 비어 있습니다.
  FIX: accessible 조건을 row === 'B' && i >= 4 && i < 8 (v ≈ 4~14, 동측 벽 퍼골라 맞은편)로 옮깁니다. 바퀴멈춤 박스(0.15×0.15×1.6, #222/#e2c23a 줄무늬)는 u 90.1에 둡니다. 북단 u ≈ 71~75, v ≈ -11에 정산기 기둥 2개(0.4×0.4×1.6, #2f3533)와 차단기 받침(#e2c23a)·바(3m, 흰색)를 추가합니다.
- (medium) SHINSEGAE 글자가 실제보다 작고 가늘어 신반포로에서 거의 읽히지 않습니다. 꽃 로고도 글자에서 약 3m 떨어져 따로 떠 있습니다. 실제는 굵은 흰 대문자가 탑 폭의 약 2/3를 차지하고, 꽃이 첫 글자 S 바로 왼쪽에 붙어 있습니다.
  where: K.texture('ssg_wordmark') (font '500 104px'), towerLogo(): 꽃 c + left*6.5, 글자 c - left*1.1, 11.7×1.5
  evidence: refs/roadview/cc_01 확대: 탑 북면 폭 대비 글자열이 약 0.65(약 12m), 대문자 높이 약 1.4m, 꽃 지름 약 2.5m이고 꽃과 S 사이 간격은 약 0.5m입니다. ssg_06 확대에서도 같은 비례입니다. 모델 shots/verify/shinsegae/ssg06.png·cc01.png는 글자가 약 7m 폭, 대문자 약 0.9m의 가는 회색 선으로 보이고 꽃이 멀리 떨어진 작은 빨간 점입니다.
  FIX: ssg_wordmark 폰트를 '800 112px'로 바꾸고 캔버스 1024×128을 꽉 채웁니다(maxWidth 유지, 글자색 #ffffff). 쿼드를 13×1.9m로 키웁니다. towerLogo에서 글자 중심을 c - left*1.4, 꽃(2.5m)을 c + left*6.4로 두어 꽃 오른쪽 끝이 글자 시작 0.5m 앞에 오게 합니다. 높이는 상단 창 줄 아래(top - 8.5) 그대로 둡니다.
- (low) 탑 상단 작은 창이 면마다 6개 정사각형(1.35m)입니다. 실제는 면마다 5개이고, 세로가 약간 긴 직사각형입니다.
  where: for (const [u0,u1,top] of TOWERS) for (let i = 0; i < 6; i++) squareWindow(..., top - 4, 1.35)
  evidence: refs/roadview/ssg_06 확대: 왼쪽(동측) 탑과 오른쪽(서측) 탑 북면 상단에 각각 5개입니다. refs/roadview/cc_01 서측 탑 북면도 5개이고, refs/photos/shinsegae/01(2009)도 면마다 5개의 세로형 창입니다. 모델 ssg06.png·cc01.png는 6개 정사각입니다.
  FIX: i < 5, c = 2.6 + i * (TOWER_W - 5.2) / 4로 5개를 고르게 배치하고, 창 크기를 폭 1.5 × 높이 2.1(squareWindow에 w/h 분리)로 하며 중심을 top - 3.6에 둡니다.
- (low) 탑 사이 유리 커튼월 볼륨 지붕(GLASS_TOP 48)에 실제로는 나무와 관목이 보이는 옥상 녹지가 있습니다. 모델은 맨 지붕입니다.
  where: K.prism(rect(TOWER_W, BAY_BACK, UW - TOWER_W, VS), YB, GLASS_TOP, { top: 0x74817a ... })
  evidence: refs/roadview/ssg_06 확대: 유리 볼륨 윗선 바로 위로 녹색 수관이 두 무더기(볼륨 좌측 1/3과 우측 끝) 솟아 있습니다. 모델 shots/verify/shinsegae/ssg06.png는 유리 볼륨 윗선이 맨 하늘입니다.
  FIX: y=48 지붕 위 u 20~47, v 9~16 띠에 높이 0.6m 화단(#5d5a55)과 K.tree(h 3.5~4.5, kind 'zelkova') 5~6그루를 둡니다. 특히 u ≈ 24~30과 u ≈ 42~46에 몰아서 배치합니다.
- (low) 동측 퍼골라가 NE 모서리 직전(v 2)까지 이어집니다. 실제 퍼골라는 모서리보다 꽤 남쪽에서 끝나고, 그 북쪽은 소나무 열이 벽 앞을 가립니다.
  where: gridCanopy('E', 13, 22, 3.4, 3.55) → v 2~24
  evidence: refs/roadview/ssg_03 확대: 퍼골라 지붕은 화면 왼쪽에서 x≈830(전체 1160 중)까지이고, 그 오른쪽으로는 벽 앞에 소나무 4~5그루가 모서리(x≈1110)까지 이어집니다. 퍼골라 기둥은 쌍기둥(2개씩)입니다. 모델 shots/verify/shinsegae/ssg03.png·v03.png는 퍼골라가 모서리 근처까지 가고 소나무는 모서리 북쪽(v -20~0)에만 있습니다.
  FIX: 퍼골라 범위를 v 약 8~30으로 옮깁니다(gridCanopy('E', 19, 22, ...)). 기둥은 0.6m 간격의 쌍기둥으로 둡니다. layeredPine을 u 69.2, v = 1, 3.5, 6에 3그루 추가해 NE 모서리 아래 벽 앞을 가립니다.
- (low) The west tower has portrait billboards on both its north and west faces. The reference shows the PIAGET portrait only on the north face; the west face carries a narrow vertical light banner. The main-entrance show windows are empty white boxes, where the reference has lit watch/jewellery displays and 'POLO CLUB' lettering under the red awnings.
  where: west tower west face; show windows flanking the 신반포로 entrance
  evidence: refs/roadview/cc_01 and ssg_02 vs shots/verify/critic/cc_gate.png and ssg_ent.png
  FIX: Replace the west-face portrait with a ~3 × 14 m pale vertical banner. Fill the show windows with dark interiors, small lit display plinths and white brand lettering on the red awnings.

## Reference material (ground truth)
- NEW Kakao roadview frames captured 2025-06 / 2026-06 by the operator, described one by one in refs/roadview/manifest.json (read it): refs/roadview/ssg_*.jpg (Shinsegae), gb_*.jpg (경부선 terminal), cc_*.jpg (센트럴시티), bp_*.jpg (반포쇼핑타운 / 신반포로).
- refs/roadview/viewpoints.json: reviewer-calibrated camera positions [x,y,z,yawDeg,pitchDeg] matching the roadview frames (yaw 0 = north/-z, 90 = west, 180 = south, 270 = east).
- shots/verify/<module>/: the reviewers' renders and side-by-side sheets of the CURRENT build (look at them).
- shots/r3cmp/cmp.png: older side-by-side comparison, LEFT = roadview, RIGHT = the current model rendered from roughly the same standing point. Camera positions used for the model renders (x, y=feet, z, yawDeg; yaw 0 = looking north/-z, 90 = west, 180 = south, 270 = east):
  ssg06 = (-58, 0, -100, 190)  · cc01 = (-150, 0, -62, 215) · gb04 = (160, 0, -165, 105) · gb03 = (60, 0, -140, 180) · ssg01 = (-93, 0, -52, 180) · gb01 = (200, 0, -185, 180)
- Aerial photos in world coordinates (north up, yellow grid 10 m, labels every 50 m; slightly off-nadir): refs/aerial/shinsegae_centralcity.jpg, refs/aerial/gyeongbu_lots.jpg.
- Older photos and notes: refs/photos/shinsegae/, data/research/shinsegae_visual.json (2008–2016; the 2025/2026 roadview wins when they disagree).

## Rules
- Read AGENTS.md, docs/PLACE_API.md, js/kit.js, js/places/_junctions.js and the current module first.
- Everything visible must be justified by a reference. Where nothing shows a detail, keep it plain rather than inventing. Record remaining guesses in data/research/shinsegae.json → modeling.guesses.
- Korean express-bus terminal complex, not an airport/railway: no GATE/게이트, no English-first DEPARTURES boards, no airport glass lounges.
- Keep floor counts, junctions/wells naming this module, spawns (3–12), elevators listing all floors, zones, OSM claims. ≤ 130k quads.
- Touch ONLY your module file and its data/research json. Other Codex jobs are editing the other modules in this folder at the same time. No git commit. No engine edits.
- Must pass `node tests/smoke.mjs shinsegae <neighbours>` (OK) and `node tests/walk.mjs` (0 blocked; if a failure is in another module that is mid-edit, say so). tests/shot.mjs cannot run in your sandbox.
- Final answer: what changed, which reference justified each element, remaining guesses.
