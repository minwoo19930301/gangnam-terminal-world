export const prefix='더 라운지 · ';
export const parts={
 stand:['겨울 티 세트의 세 단 황동 트레이',.41,.26,.48],sweets:['딸기 무스·에클레어와 세이보리',.39,.25,.422],
 blueTea:['청회색 금테 차 주전자와 찻잔',.32,.21,.15],scones:['유리 볼 스콘과 세 병의 잼',.34,.16,.070],
 soda:['딸기 소다와 황동 빨대',.08,.08,.17],sodaGlass:['하이볼 유리와 물방울',.08,.08,.15],sconeGlass:['스콘 볼의 밝은 유리 테',.15,.15,.04],flowers:['작은 화병의 솔방울과 붉은 열매',.13,.13,.22],
 baskets:['세 대나무 찜기와 관자 슈마이',.45,.42,.15],course:['흰 접시 전채와 푸른 종지',.43,.33,.07],
 whiteTea:['흰 골진 주전자와 두 찻잔',.36,.22,.14],ribs:['자스민 등갈비와 허브 접시',.22,.22,.07],
 sticks:['황동 받침과 검은 젓가락',.061,.20,.018],
};
export const centers={winter:[-3.60,34.15,.443],dimsum:[.40,25.70,.624],family:[-3.80,20.0,.624]};
export const rows=[];
function at(table,key,x,d,angle=0){
 const [u,v,h]=centers[table];rows.push({table,key,u:u+x,v:v+d,h,angle});
}
at('winter','stand',-.03,.03,.095);at('winter','sweets',-.03,.03,.095);
at('winter','blueTea',.31,.17,-.35);at('winter','soda',-.37,.12,.22);
at('winter','scones',-.16,.33,-.05);at('winter','sconeGlass',-.16,.33,-.05);at('winter','sodaGlass',-.37,.12,.22);at('winter','flowers',.34,-.15,-.17);
at('dimsum','baskets',-.14,-.07,-.20);at('dimsum','course',.13,.035,.17);
at('dimsum','whiteTea',.050,.305,.48);at('dimsum','sticks',.07,-.30,-.12);
at('family','baskets',.058,.08,.96);at('family','ribs',-.19,-.088,-.28);
at('family','whiteTea',-.17,.28,-.61);at('family','sticks',.20,-.20,.58);
