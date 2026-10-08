(function(){
  var EX={prix:595000,mise:20,prime:0,frais:3500,taux:5.12,amort:25,portes:3,loyers:4050,autres:0,vac:3,tmun:4200,tsco:380,ass:2400,div:900,ent:5,ges:0,cible:75,app:2,imp:0,typ:0};
  var BLANK={prix:0,mise:20,prime:0,frais:0,taux:EX.taux,amort:25,portes:3,loyers:0,autres:0,vac:3,tmun:0,tsco:0,ass:0,div:0,ent:5,ges:0,cible:75,app:0,imp:0,typ:0};
  var KEY='plex-calc-v3', ids=Object.keys(EX), $=function(i){return document.getElementById(i)};
  var money=new Intl.NumberFormat('fr-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0});
  var pct=function(x){return isFinite(x)?(x*100).toLocaleString('fr-CA',{minimumFractionDigits:1,maximumFractionDigits:1})+' %':'–'};
  var num=function(x,d){return isFinite(x)?x.toLocaleString('fr-CA',{minimumFractionDigits:d,maximumFractionDigits:d}):'–'};
  var esc=function(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};

  // SCHL, octobre 2025 : [nom de la zone, inoccupation %, loyer moyen $, loyer moyen des immeubles de 3 à 5 logements $]
  var Z={
    agg:['Agglomération de Québec',2.2,1232,1193], hv:['Haute-Ville',2.9,1332], bv:['Basse-Ville',2.7,1139],
    sf:['Sainte-Foy–Sillery',null,1262], lr:['Les Rivières',2.6,1398], bp:['Beauport',3.4,1195],
    ch:['Charlesbourg',0.4,1032], hsc:['Haute-Saint-Charles',1.5,1115], vb:['Val-Bélair–L’Ancienne-Lorette',1.0,1137],
    sa:['Saint-Augustin–Cap-Rouge',1.8,1512], rse:['Rive-Sud, secteur Est',2.6,1130], rsc:['Rive-Sud, secteur Centre',3.8,1191],
    rso:['Rive-Sud, secteur Ouest',4.7,1340], sm:['Sainte-Marie',1.6,958,792], sg:['Saint-Georges',1.0,770,684]
  };
  // [groupe, [[nom, zone, donnée directe ?, barème de mutation], ...]]
  function near(z,list){return list.map(function(n){return [n,z,0]})}
  var G=[
    ['Québec',[['Québec, ensemble de la ville','agg',1,'q'],['Québec, Haute-Ville','hv',1,'q'],['Québec, Basse-Ville','bv',1,'q'],['Québec, Sainte-Foy–Sillery','sf',1,'q'],['Québec, Les Rivières','lr',1,'q'],['Québec, Beauport','bp',1,'q'],['Québec, Charlesbourg','ch',1,'q'],['Québec, Haute-Saint-Charles','hsc',1,'q'],['Québec, Val-Bélair','vb',1,'q'],['Québec, Cap-Rouge','sa',1,'q'],['L’Ancienne-Lorette','vb',1],['Saint-Augustin-de-Desmaures','sa',1]]],
    ['Lévis et Rive-Sud',[['Lévis, secteur Est','rse',1,'l'],['Lévis, secteur Centre','rsc',1,'l'],['Lévis, secteur Ouest','rso',1,'l']]],
    ['Lotbinière',near('rso',['Dosquet','Laurier-Station','Leclercville','Lotbinière','Notre-Dame-du-Sacré-Cœur-d’Issoudun','Saint-Agapit','Saint-Antoine-de-Tilly','Saint-Apollinaire','Sainte-Agathe-de-Lotbinière','Sainte-Croix','Saint-Édouard-de-Lotbinière','Saint-Flavien','Saint-Gilles','Saint-Janvier-de-Joly','Saint-Narcisse-de-Beaurivage','Saint-Patrice-de-Beaurivage','Saint-Sylvestre','Val-Alain'])],
    ['Nouvelle-Beauce',[['Sainte-Marie','sm',1]].concat(near('sm',['Frampton','Saint-Bernard','Saint-Elzéar','Saint-Isidore','Saint-Lambert-de-Lauzon','Sainte-Hénédine','Sainte-Marguerite','Saints-Anges','Scott','Vallée-Jonction']))],
    ['Beauce-Centre',near('sg',['Beauceville','Saint-Alfred','Saint-Victor']).concat(near('sm',['Saint-Frédéric','Saint-Joseph-de-Beauce','Saint-Joseph-des-Érables','Saint-Jules','Saint-Odilon-de-Cranbourne','Saint-Séverin','Tring-Jonction']))],
    ['Beauce-Sartigan',[['Saint-Georges','sg',1]].concat(near('sg',['La Guadeloupe','Lac-Poulin','Notre-Dame-des-Pins','Saint-Benoît-Labre','Saint-Côme–Linière','Saint-Éphrem-de-Beauce','Saint-Évariste-de-Forsyth','Saint-Gédéon-de-Beauce','Saint-Hilaire-de-Dorset','Saint-Honoré-de-Shenley','Saint-Martin','Saint-Philibert','Saint-René','Saint-Simon-les-Mines','Saint-Théophile']))]
  ];
  var P={}, sel=$('ville'), opts='<option value="">Choisir une ville</option>';
  G.forEach(function(g){opts+='<optgroup label="'+g[0]+'">'+g[1].map(function(p){P[p[0]]=p;return '<option>'+p[0]+'</option>'}).join('')+'</optgroup>'});
  sel.innerHTML=opts;

  // Ministère des Affaires municipales, profil financier, données 2024 : [population, taux global de taxation uniformisé $/100 $, charge fiscale moyenne par logement $]
  var T={'Québec':[574482,1.0236,2536],'L’Ancienne-Lorette':[17406,0.9365,2759],'Saint-Augustin-de-Desmaures':[20590,0.9339,3798],'Lévis':[156225,0.9548,2652],
    'Frampton':[1382,0.9267,1551],'Saints-Anges':[1315,0.9986,2083],'Vallée-Jonction':[1982,1.1843,2154],'Saint-Elzéar':[2792,1.0247,2361],'Sainte-Marie':[13374,1.1871,2742],'Sainte-Marguerite':[1262,1.1167,2087],'Sainte-Hénédine':[1469,0.9538,2081],'Scott':[2807,1.022,2607],'Saint-Bernard':[2637,0.8455,1942],'Saint-Isidore':[3462,0.8956,2137],'Saint-Lambert-de-Lauzon':[6955,0.8798,2594],
    'Saint-Victor':[2358,1.2723,2433],'Saint-Alfred':[535,1.1296,2460],'Beauceville':[6285,1.4222,2195],'Saint-Odilon-de-Cranbourne':[1436,1.1095,1660],'Saint-Joseph-de-Beauce':[5208,1.2992,2339],'Saint-Joseph-des-Érables':[390,1.009,1500],'Saint-Jules':[543,1.0685,1385],'Tring-Jonction':[1550,1.5614,2533],'Saint-Frédéric':[1156,1.1656,1845],'Saint-Séverin':[311,0.9087,1267],
    'Saint-Théophile':[698,0.8628,998],'Saint-Gédéon-de-Beauce':[2144,1.2222,1910],'Saint-Hilaire-de-Dorset':[99,0.8881,977],'La Guadeloupe':[1846,1.6318,2166],'Saint-Honoré-de-Shenley':[1615,1.2183,1934],'Saint-Martin':[2645,1.3067,1649],'Saint-René':[987,0.8487,2033],'Saint-Côme–Linière':[3406,1.1951,2073],'Saint-Philibert':[361,0.7286,1370],'Saint-Georges':[33546,1.0524,1997],'Lac-Poulin':[174,0.4634,2296],'Saint-Benoît-Labre':[1676,0.9766,1978],'Saint-Éphrem-de-Beauce':[2411,1.2217,1974],'Notre-Dame-des-Pins':[1894,0.9902,2172],'Saint-Simon-les-Mines':[593,0.9141,2188],
    'Saint-Sylvestre':[1051,1.0752,1681],'Sainte-Agathe-de-Lotbinière':[1048,0.8606,1418],'Saint-Patrice-de-Beaurivage':[1092,1.4314,2056],'Saint-Narcisse-de-Beaurivage':[1207,1.0332,2224],'Saint-Gilles':[3185,0.9523,2153],'Dosquet':[954,0.8697,1368],'Saint-Agapit':[4703,1.0343,2187],'Saint-Flavien':[1666,1.0324,1965],'Laurier-Station':[2684,1.0484,2197],'Saint-Janvier-de-Joly':[1141,1.2696,2509],'Val-Alain':[1039,0.9825,1884],'Saint-Édouard-de-Lotbinière':[1311,1.0413,1743],'Notre-Dame-du-Sacré-Cœur-d’Issoudun':[902,0.8023,1697],'Saint-Apollinaire':[8689,0.8061,2089],'Saint-Antoine-de-Tilly':[1752,0.8003,2534],'Sainte-Croix':[2628,0.997,1942],'Leclercville':[507,1.1683,2087]};
  function muni(ville){return T[ville]||(/^Québec,/.test(ville)?T['Québec']:/^Lévis,/.test(ville)?T['Lévis']:null)}

  function mutation(p,bar){ // barème de base 2026, plus les tranches de Québec (q) et de Lévis (l)
    var t=[[0,.005],[62900,.01],[315000,.015]];
    if(bar==='q') t.push([500000,.02],[1000000,.025],[2000000,.03]);
    if(bar==='l') t.push([500000,.03]);
    var d=0;for(var j=0;j<t.length;j++){var hi=j+1<t.length?t[j+1][0]:Infinity;d+=Math.max(0,Math.min(p,hi)-t[j][0])*t[j][1]}
    return d;
  }
  // Primes SCHL en % du prêt. Retourne [prime, message].
  function schl(typ,mise,amort){
    var l=100-mise, pick=function(g){for(var i=0;i<g.length;i++) if(l<=g[i][0]+1e-9) return g[i][1]; return null}, b;
    if(typ===0){
      if(l<=80) return [0,'Avec 20 % et plus de mise, pas d’assurance prêt obligatoire.'];
      b=pick([[85,2.8],[90,3.1],[95,4]]);
      return b===null?[null,'Mise trop basse : il faut au moins 5 % (10 % pour un 3 ou 4 logements).']:[b,'Propriétaire occupant : prime de '+num(b,2)+' %. Mise minimale de 10 % pour un 3 ou 4 logements, amortissement de 25 ans au plus.'];
    }
    if(typ===1){
      b=pick([[65,1.45],[75,2],[80,2.9]]);
      return b===null?[null,'Immeuble non habité par le propriétaire : la mise minimale est de 20 %.']:[b,'Petit immeuble locatif : prime de '+num(b,2)+' % si le prêt est assuré. Amortissement de 25 ans au plus. Avec 20 % de mise, un prêt sans assurance (prime 0) est aussi possible.'];
    }
    var sel=typ>=3, g=[[65,2.6],[70,2.85],[75,3.35],[80,4.35],[85,5.35]];
    if(sel) g.push([90,5.9],[95,6.15]);
    b=pick(g);
    if(b===null) return [null,sel?'Mise trop basse : au moins 5 % avec APH Select.':'Prêt ordinaire : mise minimale de 15 %. Au-delà, il faut APH Select.'];
    var sur=amort>25?0.25*Math.ceil((amort-25)/5):0, rab=[0,0,0,10,20,30][typ], tot=(b+sur)*(1-rab/100);
    return [Math.round(tot*1000)/1000,'Immeuble collectif : '+num(b,2)+' % de base'+(sur?' + '+num(sur,2)+' % pour l’amortissement de '+num(amort,0)+' ans':'')+(rab?', moins '+rab+' % de rabais APH Select':'')+' = '+num(tot,2)+' %. Prévoir aussi 150 $ par logement de droits de demande. Les points APH Select et l’amortissement permis dépendent du dossier : à valider avec un courtier.'];
  }
  function factor(taux,ans){ // versement mensuel par dollar emprunté
    var n=Math.max(1,Math.round(ans*12)), i=Math.pow(1+taux/200,1/6)-1;
    return i===0?1/n:i/(1-Math.pow(1+i,-n));
  }
  function compute(v,ville){
    var o={}, base=v.prix*(1-v.mise/100);
    o.primeD=base*v.prime/100; o.pret=base+o.primeD; o.k=factor(v.taux,v.amort); o.pm=o.pret*o.k;
    var i=Math.pow(1+v.taux/200,1/6)-1, solde=o.pret; o.cap=0; o.inter=0;
    for(var m=0;m<12;m++){var it=solde*i,c=Math.min(solde,o.pm-it);o.inter+=it;o.cap+=c;solde-=c}
    o.brut=(v.loyers+v.autres)*12; o.vac=o.brut*v.vac/100; o.eff=o.brut-o.vac;
    o.ent=o.brut*v.ent/100; o.ges=o.brut*v.ges/100;
    o.dep=v.tmun+v.tsco+v.ass+v.div+o.ent+o.ges;
    o.rne=o.eff-o.dep; o.dette=o.pm*12; o.cf=o.rne-o.dette;
    o.mut=mutation(v.prix,(P[ville]||[])[3]); o.miseD=v.prix*v.mise/100; o.tvq=o.primeD*0.09; o.investi=o.miseD+o.mut+v.frais+o.tvq;
    o.portes=Math.max(1,v.portes); o.rcd=o.dette>0?o.rne/o.dette:Infinity;
    o.tga=v.prix>0?o.rne/v.prix:NaN; o.mrb=o.brut>0?v.prix/o.brut:NaN;
    o.coc=o.investi>0?o.cf/o.investi:NaN; o.val=v.prix*v.app/100;
    o.tot=o.investi>0?(o.cf+o.cap+o.val)/o.investi:NaN;
    o.impot=Math.max(0,o.rne-o.inter)*(v.imp||0)/100; o.cfNet=o.cf-o.impot;
    return o;
  }

  // ---- état : liste d'immeubles, gardée dans le navigateur
  var S={list:[{nom:'Triplex d’exemple',ville:'',ex:1,note:'',v:Object.assign({},EX)}],cur:0};
  function adopt(raw){
    if(!(raw&&Array.isArray(raw.list)&&raw.list.length)) return false;
    S.list=raw.list.map(function(p){var v={};ids.forEach(function(k){v[k]=p.v&&typeof p.v[k]==='number'?p.v[k]:BLANK[k]});return {nom:String(p.nom||'Immeuble'),ville:P[p.ville]?p.ville:'',ex:p.ex?1:0,note:String(p.note||''),files:Array.isArray(p.files)?p.files.filter(function(f){return f&&typeof f.id==='string'}).map(function(f){return {id:f.id,name:String(f.name||'fichier'),type:String(f.type||'')}}):[],v:v}});
    S.cur=Math.min(Math.max(0,raw.cur|0),S.list.length-1); return true;
  }
  try{adopt(JSON.parse(localStorage.getItem(KEY)))}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
  function cur(){return S.list[S.cur]}
  function fill(){var p=cur();ids.forEach(function(k){$(k).value=p.v[k]});$('nom').value=p.nom;sel.value=p.ville;$('note').value=p.note||''}

  var row=function(l,val,cls,small){return '<div class="r'+(cls?' '+cls:'')+'"><span>'+l+(small?'<small>'+small+'</small>':'')+'</span><b>'+val+'</b></div>'};
  var tile=function(k,v,s,cls){return '<div class="tile"><span class="k">'+k+'</span><span class="v'+(cls?' '+cls:'')+'">'+v+'</span><span class="s">'+s+'</span></div>'};

  function render(){
    var p=cur(), v=p.v, o=compute(v,p.ville), z=P[p.ville]?Z[P[p.ville][1]]:null;
    $('hName').textContent=p.nom||'Immeuble sans nom';
    var chips=[];
    if(p.ex) chips.push('<span class="chip ex">Chiffres d’exemple, immeuble fictif</span>');
    if(p.ville) chips.push('<span class="chip">'+esc(p.ville)+'</span>');
    chips.push('<span class="chip">Mise '+num(v.mise,0)+' %</span>');
    chips.push('<span class="chip">'+num(v.taux,2)+' % sur '+num(v.amort,0)+' ans</span>');
    $('hChips').innerHTML=chips.join('');
    $('hPrix').textContent=money.format(v.prix);
    $('hMeta').textContent=o.portes+' logements · '+money.format(v.prix/o.portes)+' par porte';
    var mq=((p.ex?'':p.nom+' ')+(p.ville||'')).trim(), hm=$('hMap'); hm.hidden=!mq; hm.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(mq+' Québec');

    var verdict=o.cf<0?['Déficitaire','bad','Il faut en remettre de sa poche']:o.rcd<1.1?['Serré','warn','Rentable, mais peu de marge']:['Solide','good','L’immeuble se paie lui-même'];
    // résumé en clair et avertissements
    var vide=!(v.prix>0)||!(v.loyers>0), rs=$('resume'), mois=money.format(Math.abs(o.cf/12));
    rs.className='resume '+(vide?'':verdict[1]);
    rs.innerHTML='<p>'+(vide?'Entre le <b>prix</b> et les <b>loyers</b> de l’immeuble pour voir s’il se paie lui-même. Tu peux aussi coller une annonce Centris.'
      :o.cf<0?'À ce prix, cet immeuble te coûterait environ <b>'+mois+' par mois</b> de ta poche : les loyers ne couvrent pas les dépenses et l’hypothèque.'
      :o.rcd<1.1?'Cet immeuble se paie lui-même et te laisse environ <b>'+mois+' par mois</b>, mais la marge est mince : une hausse de taux ou un logement vide suffit à tomber en négatif.'
      :'Cet immeuble se paie lui-même et te laisse environ <b>'+mois+' par mois</b>, avec une marge confortable sur l’hypothèque.')
      +'</p><button type="button" data-go="donnees">'+(vide?'Entrer les chiffres':'Modifier les chiffres')+'</button>';
    var al=[];
    if(!vide){
      var tx=v.tmun+v.tsco;
      if(tx>v.prix*0.03) al.push('Les taxes ('+money.format(tx)+' par an) dépassent 3 % du prix. Vérifie que ce n’est pas l’évaluation municipale qui a été entrée à la place.');
      if(tx===0) al.push('Aucune taxe municipale ni scolaire n’est entrée. Le cashflow est donc trop beau.');
      if(v.ass===0) al.push('Aucune assurance n’est entrée. Compte quelques milliers de dollars par an pour un plex.');
      if(o.mrb>22) al.push('Le prix vaut plus de 22 fois les loyers d’une année. Vérifie que les loyers sont bien le total de tous les logements, par mois.');
      if(o.mrb<5) al.push('Le prix vaut moins de 5 fois les loyers d’une année, ce qui est très rare. Vérifie le prix et les loyers.');
      if(v.mise<20&&!(v.prime>0)) al.push('Avec moins de 20 % de mise, une prime d’assurance prêt s’ajoute. Clique « Calculer selon la grille SCHL » dans l’onglet Données.');
      if(v.vac===0) al.push('L’inoccupation est à 0 %. Même un bon immeuble a des mois vides ou des loyers impayés.');
      if(v.taux<2||v.taux>12) al.push('Le taux hypothécaire de '+num(v.taux,2)+' % semble inhabituel.');
    }
    $('alertes').hidden=!al.length;
    $('alertes').innerHTML=al.length?'<strong>À vérifier avant de te fier au résultat</strong><ul>'+al.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>':'';

    $('tiles').innerHTML=
      tile('Cashflow / an',money.format(o.cf),money.format(o.cf/12)+'/m · '+money.format(o.cf/12/o.portes)+'/porte',o.cf<0?'bad':'good')
      +tile('Revenu net (RNE)',money.format(o.rne),'MRB '+(isFinite(o.mrb)?num(o.mrb,1)+' ×':'–'))
      +tile('Couverture (RCD)',num(o.rcd,2),'min. visé 1,10',o.rcd<1?'bad':o.rcd<1.1?'warn':'good')
      +tile('TGA',pct(o.tga),'Revenu net ÷ prix')
      +tile('Mise de fonds ('+num(v.mise,0)+' %)',money.format(o.miseD),'Liquidités '+money.format(o.investi))
      +tile('Verdict',verdict[0],verdict[2],verdict[1]);

    $('rev').innerHTML=
      row('Revenus bruts annuels',money.format(o.brut))
      +row('Inoccupation et pertes','−'+money.format(o.vac),'bad')
      +row('Taxes municipales et scolaires','−'+money.format(v.tmun+v.tsco))
      +row('Assurances','−'+money.format(v.ass))
      +row('Entretien et gestion','−'+money.format(o.ent+o.ges))
      +row('Déneigement, énergie, divers','−'+money.format(v.div))
      +row('Revenu net (RNE)',money.format(o.rne),'hl')
      +row('Versements hypothécaires','−'+money.format(o.dette))
      +row('Cashflow / an',money.format(o.cf),'hl '+(o.cf<0?'bad':'good'))
      +row('Cashflow / mois',money.format(o.cf/12),o.cf<0?'bad':'good');
    $('fin').innerHTML=
      row('Mise de fonds',money.format(o.miseD))
      +row('Droits de mutation',money.format(o.mut),'','Barème 2026'+(p.ville?' de la municipalité choisie':' de base'))
      +row('Notaire, inspection, autres',money.format(v.frais))
      +(o.tvq>0?row('Taxe de 9 % sur la prime',money.format(o.tvq)):'')
      +row('Argent à sortir à l’achat',money.format(o.investi),'hl')
      +row('Prêt'+(o.primeD>0?' avec prime de '+money.format(o.primeD):''),money.format(o.pret),'sep')
      +row('Taux d’intérêt',num(v.taux,2)+' %')
      +row('Amortissement',num(v.amort,0)+' ans')
      +row('Paiement mensuel',money.format(o.pm))
      +row('Paiement annuel',money.format(o.dette))
      +row('Couverture de la dette (RCD)',num(o.rcd,3),'sep '+(o.rcd<1?'bad':o.rcd<1.1?'warn':'good'));

    var segs=[['Inoccupation',o.vac,'--seg-vac'],['Dépenses',o.dep,'--seg-dep'],['Intérêts',o.inter,'--seg-int'],['Capital remboursé',o.cap,'--seg-cap']];
    if(o.cf>0) segs.push(['Cashflow',o.cf,'--seg-cf']);
    var tot=segs.reduce(function(s,x){return s+Math.max(0,x[1])},0)||1;
    $('bar').innerHTML=segs.map(function(s){return '<i style="width:'+(Math.max(0,s[1])/tot*100)+'%;background:var('+s[2]+')" title="'+s[0]+'"></i>'}).join('');
    $('legend').innerHTML=segs.map(function(s){return '<div><i style="background:var('+s[2]+')"></i><span>'+s[0]+'</span><em>'+money.format(s[1])+'</em></div>'}).join('')
      +(o.cf<0?'<div><i style="background:var(--bad)"></i><span>Manque à combler</span><em>'+money.format(-o.cf)+'</em></div>':'');

    var cible=v.cible*o.portes*12, denom=(1-v.mise/100)*(1+v.prime/100)*o.k*12, pmax=denom>0?(o.rne-cible)/denom:Infinity;
    if(!isFinite(pmax)){$('pmax').textContent='–';$('pmaxNote').textContent='Aucun emprunt : le prix ne change pas le cashflow.'}
    else if(pmax<=0){$('pmax').textContent='Impossible';$('pmaxNote').textContent='Avec ces loyers et ces dépenses, aucun prix ne donne ce cashflow.'}
    else{var px=Math.floor(pmax/1000)*1000, d=px-v.prix;
      $('pmax').textContent=money.format(px);
      $('pmaxNote').textContent=d>=0?'Le prix demandé est '+money.format(d)+' sous cette limite.':'Le prix demandé dépasse cette limite de '+money.format(-d)+'.'}

    $('rend').innerHTML=
      row('Cashflow',money.format(o.cf),'','Ce qui reste dans tes poches')
      +row('Capital remboursé la 1re année',money.format(o.cap),'','Payé par les locataires, récupéré à la revente')
      +row('Prise de valeur prévue',money.format(o.val),'',num(v.app,1)+' % par an, hypothèse')
      +row('Rendement sur l’argent investi',pct(o.coc),'sep','Cashflow ÷ argent sorti')
      +row('Rendement total',pct(o.tot),'hl','Cashflow + capital + prise de valeur')
      +(v.imp>0?row('Impôt estimé','−'+money.format(o.impot),'sep','Revenu net moins intérêts, à '+num(v.imp,0)+' %')+row('Cashflow après impôt',money.format(o.cfNet),o.cfNet<0?'bad':'good',money.format(o.cfNet/12)+' par mois'):'');

    // secteur
    var box=$('sector');
    if(!z){box.innerHTML='<h2>Marché locatif du secteur</h2><span class="sub">Choisis la ville dans l’onglet Données pour comparer les loyers de l’annonce au marché. Couvre Québec, Lévis, Lotbinière et la Beauce.</span>'}
    else{
      var pl=P[p.ville], parPorte=v.loyers/o.portes, ref=z[3]||z[2], ecart=(parPorte-ref)/ref, h='<h2>Marché locatif : '+esc(p.ville)+'</h2>';
      if(!pl[2]) h+='<span class="warn">La SCHL ne publie rien pour '+esc(p.ville)+' (municipalité trop petite). Chiffres du secteur mesuré le plus proche, '+z[0]+', à prendre comme ordre de grandeur.</span>';
      h+='<div class="kv"><div><b>'+(z[1]===null?'n.d.':num(z[1],1)+' %')+'</b><span>Inoccupation</span></div>'
        +'<div><b>'+money.format(z[2])+'</b><span>Loyer moyen, tous immeubles</span></div>'
        +(z[3]?'<div><b>'+money.format(z[3])+'</b><span>Loyer moyen, immeubles de 3 à 5 logements</span></div>':'')
        +'<div><b>'+money.format(parPorte)+'</b><span>Loyer par porte de l’annonce</span></div></div>';
      if(v.loyers>0&&pl[2]) h+='<span>Par rapport '+(z[3]?'aux immeubles de 3 à 5 logements':'à l’ensemble des immeubles')+', les loyers de l’annonce sont '+(Math.abs(ecart)<0.03?'dans la moyenne du secteur.':pct(Math.abs(ecart))+(ecart>0?' au-dessus de la moyenne : vérifie les baux avant de te fier aux revenus annoncés.':' sous la moyenne : il y a peut-être de la place pour les augmenter avec le temps.'))+'</span>';
      if(z[1]!==null) h+='<div><button type="button" id="useVac" data-v="'+z[1]+'">Utiliser '+num(z[1],1)+' % d’inoccupation dans le calcul</button></div>';
      h+='<span class="sub">'+z[0]+' · SCHL, octobre 2025 · toutes tailles de logement confondues</span>';
      var mu=muni(p.ville);
      h+='<h2 style="margin-top:10px">La municipalité</h2>';
      if(mu) h+='<div class="kv"><div><b>'+num(mu[0],0)+'</b><span>Population</span></div>'
        +'<div><b>'+num(mu[1],2)+' $</b><span>Taxes par 100 $ d’évaluation, tous immeubles et services inclus</span></div>'
        +'<div><b>'+money.format(mu[2])+'</b><span>Taxes moyennes par logement, par an</span></div></div>'
        +'<span class="sub">Ministère des Affaires municipales, profil financier, données 2024</span>';
      else h+='<span class="sub">Pas de donnée du ministère pour cette municipalité.</span>';
      box.innerHTML=h;
    }

    // scénarios
    var sc=[['Tes chiffres de base',{}],['Taux à '+num(v.taux+1,2)+' % (+1 point)',{taux:v.taux+1}],['Taux à '+num(v.taux+2,2)+' % (+2 points)',{taux:v.taux+2}],['Loyers 10 % plus bas',{loyers:v.loyers*0.9}],['Loyers 5 % plus hauts',{loyers:v.loyers*1.05}],['Inoccupation à 8 %',{vac:8}],['Taxes et assurances 15 % plus chères',{tmun:v.tmun*1.15,tsco:v.tsco*1.15,ass:v.ass*1.15}],['Entretien à 10 % des loyers',{ent:10}],['Prix négocié 5 % plus bas',{prix:v.prix*0.95}]];
    $('scen').innerHTML=sc.map(function(x,i){var c=compute(Object.assign({},v,x[1]),p.ville), d=c.cf/12-o.cf/12;
      return '<tr'+(i?'':' class="cur"')+'><td>'+x[0]+'</td><td class="'+(c.cf<0?'bad':'good')+'">'+money.format(c.cf/12)+'</td><td>'+(i?(d>=0?'+':'−')+money.format(Math.abs(d)):'–')+'</td><td>'+num(c.rcd,2)+'</td><td class="'+(c.cf<0?'bad':c.rcd<1.1?'warn':'good')+'">'+(c.cf<0?'Déficitaire':c.rcd<1.1?'Serré':'Solide')+'</td></tr>'}).join('');
    // amortissement
    var mi=Math.pow(1+v.taux/200,1/6)-1, sol=o.pret, ci=0, cc=0, ar='', ny=Math.max(1,Math.round(v.amort));
    for(var y=1;y<=ny;y++){var yi=0,yc=0;for(var mm=0;mm<12&&sol>0.005;mm++){var it2=sol*mi,c2=Math.min(sol,o.pm-it2);yi+=it2;yc+=c2;sol-=c2}
      ci+=yi;cc+=yc;
      if(y<=5||y%5===0||y===ny) ar+='<tr><td>'+y+'</td><td>'+money.format(yi)+'</td><td>'+money.format(yc)+'</td><td>'+money.format(Math.max(0,sol))+'</td><td>'+pct(v.prix>0?(v.prix-Math.max(0,sol))/v.prix:NaN)+'</td></tr>'}
    $('amo').innerHTML=ar+'<tr class="cur"><td>Total</td><td>'+money.format(ci)+'</td><td>'+money.format(cc)+'</td><td></td><td></td></tr>';

    // comparer
    var all=S.list.map(function(q,i){return {i:i,q:q,o:compute(q.v,q.ville)}}).sort(function(a,b){return b.o.cf-a.o.cf});
    $('cmp').innerHTML=all.map(function(a){var c=a.o;return '<tr'+(a.i===S.cur?' class="cur"':'')+'><td>'+esc(a.q.nom||'Immeuble sans nom')+(a.q.ville?'<br><span class="sub">'+esc(a.q.ville)+'</span>':'')+'</td><td>'+money.format(a.q.v.prix)+'</td><td class="'+(c.cf<0?'bad':'good')+'">'+money.format(c.cf/12)+'</td><td>'+money.format(c.cf/12/c.portes)+'</td><td>'+pct(c.tga)+'</td><td>'+num(c.rcd,2)+'</td><td>'+pct(c.coc)+'</td><td>'+(a.i===S.cur?'<span class="sub">ouvert</span>':'<button type="button" data-open="'+a.i+'">Ouvrir</button>')+'</td></tr>'}).join('');
    save();
  }

  // ---- lecture d'une annonce collée
  function toNum(s){s=s.replace(/[\s\u00a0\u202f]/g,'').replace(/[.,]\d{2}$/,'').replace(/\D/g,'');return s?parseInt(s,10):NaN}
  // montants qui suivent immédiatement une étiquette
  function amts(t,re,gap){var out=[],m,g=new RegExp(re.source,'gi');while((m=g.exec(t))){var seg=t.slice(m.index+m[0].length,m.index+m[0].length+(gap||40));var n=/^[\s:\u00a0]*(\d[\d\s\u00a0\u202f.,]*)\s*\$/.exec(seg);if(n){var v=toNum(n[1]);if(v>0)out.push(v)}}return out}
  // format réel d'une fiche Centris copiée avec « tout sélectionner »
  function parseListing(t){
    var r={}, m, L=t.split(/\n/).map(function(l){return l.trim()}).filter(Boolean);
    var ti=L.findIndex(function(l){return /^(duplex|triplex|quadruplex|quintuplex|plex|immeuble|maison|autre)[^$]{0,40}à vendre$/i.test(l)});
    if(ti>=0&&L[ti+1]){r.nom=L[ti+1];var parts=L[ti+1].split(',');r.lieu=parts[parts.length-1].trim()}
    var solo=L.map(function(l,i){var x=/^(\d[\d\s\u00a0\u202f]*)\s*\$(?:\s*\+\s*T[PV][SQ].*)?$/.exec(l);return x?[i,toNum(x[1])]:null}).filter(function(x){return x&&x[1]>=50000});
    var after=solo.filter(function(x){return ti<0||x[0]>ti});
    var pl=amts(t,/(?:^|\n)\s*Prix(?: demandé)?\s*\n/,30);
    if(after.length) r.prix=after[0][1]; else if(pl.length) r.prix=pl[0];
    if((m=/r[ée]sidentiel\s*\(\s*(\d+)\s*\)/i.exec(t))) r.portes=parseInt(m[1],10);
    else if((m=/\b(duplex|triplex|quadruplex|quintuplex)\b/i.exec(t))) r.portes={duplex:2,triplex:3,quadruplex:4,quintuplex:5}[m[1].toLowerCase()];
    var rb=amts(t,/revenus?\s+bruts?(?:\s+potentiels?)?/,30); if(rb.length) r.loyers=Math.round(Math.max.apply(null,rb)/12);
    var a=amts(t,/Municipales\s*\(\d{4}\)/,25); if(a.length) r.tmun=Math.max.apply(null,a);
    a=amts(t,/Scolaires\s*\(\d{4}\)/,25); if(a.length) r.tsco=Math.max.apply(null,a);
    if((m=/[ÉE]VALUATION MUNICIPALE[\s\S]{0,120}?Total\s*(\d[\d\s\u00a0\u202f]*)\s*\$/i.exec(t))) r.evalm=toNum(m[1]);
    a=amts(t,/(?:^|\n)\s*Assurances?/,20); if(a.length) r.ass=a[0];
    // bloc DÉPENSES de la fiche : assurances d'un côté, tout le reste additionné
    var dm=/D[ÉE]PENSES\s*\n([\s\S]{0,500}?)\n\s*Total/i.exec(t);
    if(dm){var oth=0;dm[1].split(/\n/).forEach(function(l){var x=/^(.+?)\s+(\d[\d\s\u00a0\u202f]*)\s*\$/.exec(l.trim());if(x){var n=toNum(x[2]);if(/^assurances?/i.test(x[1])) r.ass=n; else oth+=n}});if(oth) r.div=oth}
    return r;
  }
  var NAMES={prix:'prix',portes:'logements',loyers:'loyers',tmun:'taxes municipales',tsco:'taxes scolaires',ass:'assurances',div:'autres dépenses'};

  // ---- événements
  function tab(name){document.querySelectorAll('[role=tab]').forEach(function(b){var on=b.dataset.tab===name;b.setAttribute('aria-selected',on);$('p-'+b.dataset.tab).hidden=!on})}
  document.querySelectorAll('[role=tab]').forEach(function(b){b.addEventListener('click',function(){tab(b.dataset.tab)})});
  document.addEventListener('input',function(e){
    var id=e.target.id, p=cur();
    if(id==='paste') return;
    if(id==='note'){p.note=e.target.value;save();return}
    if(id==='nom') p.nom=e.target.value;
    else if(ids.indexOf(id)>=0){var n=parseFloat(e.target.value);p.v[id]=isFinite(n)?n:0}
    else return;
    p.ex=0; render();
  });
  sel.addEventListener('change',function(){cur().ville=sel.value;render()});
  $('form').addEventListener('submit',function(e){e.preventDefault()});
  $('paste').addEventListener('paste',function(){setTimeout(function(){$('bParse').click()},50)});
  var delArmed=0, delT;
  function disarm(){delArmed=0;$('bDel').textContent='Supprimer'}
  document.addEventListener('click',function(e){
    var t=e.target;
    if(t.id==='bHome'){$('intro').hidden=false;window.scrollTo(0,0)}
    else if(t.dataset&&t.dataset.go){tab(t.dataset.go);window.scrollTo(0,0)}
    else if(t.id==='bStart'||t.id==='bIntroX'){$('intro').hidden=true;try{localStorage.setItem('plex-intro','1')}catch(e2){}
      if(t.id==='bStart'){S.list.push({nom:'Nouvel immeuble',ville:'',ex:0,note:'',files:[],v:Object.assign({},BLANK)});S.cur=S.list.length-1;fill();render();tab('donnees')}}
    else if(t.id==='useVac'){cur().v.vac=parseFloat(t.dataset.v);cur().ex=0;fill();render()}
    else if(t.dataset&&t.dataset.open){S.cur=parseInt(t.dataset.open,10);fill();render();tab('analyse')}
    else if(t.id==='bNew'){S.list.push({nom:'Nouvel immeuble',ville:'',ex:0,note:'',v:Object.assign({},BLANK)});S.cur=S.list.length-1;$('paste').value='';fill();render();tab('donnees')}
    else if(t.id==='bCopy'){var c=cur();S.list.push({nom:c.nom+' (copie)',ville:c.ville,ex:0,note:c.note||'',files:[],v:Object.assign({},c.v)});S.cur=S.list.length-1;fill();render()}
    else if(t.id==='bDel'){
      if(!delArmed){delArmed=1;t.textContent='Confirmer la suppression';clearTimeout(delT);delT=setTimeout(disarm,4000);return}
      clearTimeout(delT);disarm();S.list.splice(S.cur,1);
      if(!S.list.length) S.list.push({nom:'Nouvel immeuble',ville:'',ex:0,note:'',v:Object.assign({},BLANK)});
      S.cur=Math.min(S.cur,S.list.length-1);fill();render();
    }
    else if(t.id==='bPrime'){var q=cur(), r0=schl(q.v.typ|0,q.v.mise,q.v.amort);
      $('primeMsg').textContent=r0[1];
      if(r0[0]!==null){q.v.prime=r0[0]; q.ex=0; fill(); render()}}
    else if(t.id==='bTax'){var q2=cur(), mu=muni(q2.ville);
      if(!mu){$('taxMsg').textContent=q2.ville?'Pas de taux pour cette municipalité.':'Choisis d’abord la ville.';return}
      q2.v.tmun=Math.round(q2.v.prix*mu[1]/100/10)*10; q2.ex=0; fill(); render();
      $('taxMsg').textContent='Estimation : '+num(mu[1],2)+' $ par 100 $ du prix. Le vrai compte est sur l’annonce.'}
    else if(t.id==='bRep'){report()}
    else if(t.id==='bParse'){
      var txt=$('paste').value, p=cur();
      if(!txt.trim()){$('parseMsg').textContent='Colle d’abord le texte de l’annonce.';return}
      var r=parseListing(txt), neuf=r.evalm&&r.prix&&r.evalm<0.5*r.prix;
      if(neuf) r.tsco=Math.round(r.prix*0.0007899/10)*10; // évaluation du terrain seul : la taxe scolaire affichée ne vaut pas pour l'immeuble fini
      var got=Object.keys(NAMES).filter(function(k){return r[k]>0}), extra=[];
      if(!got.length){$('parseMsg').textContent='Rien de reconnu. Copie toute la page de l’annonce (Cmd+A puis Cmd+C), pas seulement un bout.';return}
      ['tmun','tsco','ass','div'].forEach(function(k){p.v[k]=0}); // ne jamais garder les dépenses d'une annonce précédente
      got.forEach(function(k){p.v[k]=r[k]});
      if(r.nom) p.nom=r.nom;
      if(r.lieu){var v2=P[r.lieu]?r.lieu:/^Québec/.test(r.lieu)?'Québec, ensemble de la ville':''; if(v2){p.ville=v2;extra.push('ville')} else {p.ville='';extra.push('ville hors des secteurs couverts')}}
      var mu=muni(p.ville), est='';
      var basis=(r.evalm&&r.prix&&r.evalm>=0.5*r.prix)?r.evalm:(r.prix||0); // une évaluation du terrain seul (immeuble neuf) ne compte pas
      if(!r.tmun&&basis&&mu){p.v.tmun=Math.round(basis*mu[1]/100/10)*10;est=' Taxes municipales absentes de l’annonce : estimées sur '+money.format(basis)+', à vérifier.'}
      else if(!r.tmun) est=' Taxes absentes du texte, mises à 0 : sur Centris, clique « Voir plus » sous Détails financiers puis recopie la page, ou entre-les à la main.';
      if(neuf) est+=' Immeuble neuf : l’évaluation ne couvre que le terrain, taxes scolaires estimées sur le prix.';
      p.ex=0;
      var miss=['loyers','tsco','ass','div'].filter(function(k){return got.indexOf(k)<0}).map(function(k){return NAMES[k]});
      $('parseMsg').textContent='Rempli : '+got.map(function(k){return NAMES[k]}).concat(extra).join(', ')+'.'+est+(miss.length?' À entrer à la main : '+miss.join(', ')+'.':'')+' Vérifie les chiffres.';
      fill();render();
    }
  });
  // rapport PDF
  function clean(t){return String(t).replace(/[   ]/g,' ').replace(/[’‘]/g,"'").replace(/[−–—]/g,'-').replace(/×/g,'x').replace(/[«»]/g,'"').replace(/œ/g,'oe').replace(/Œ/g,'OE').replace(/\s+/g,' ').trim()}
  function report(){
    if(!(window.jspdf&&window.jspdf.jsPDF)){$('bRep').textContent='PDF indisponible hors ligne';return}
    var p=cur(), doc=new window.jspdf.jsPDF({unit:'pt',format:'letter'}), W=612, H=792, mx=48, y=56;
    var need=function(h){if(y+h>H-56){doc.addPage();y=56}};
    var h2=function(t){need(40);y+=14;doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(90,107,118);doc.text(clean(t).toUpperCase(),mx,y);y+=6;doc.setDrawColor(21,35,45);doc.setLineWidth(1);doc.line(mx,y,W-mx,y);y+=16};
    var line=function(l,v,b){need(18);doc.setFont('helvetica',b?'bold':'normal');doc.setFontSize(10.5);doc.setTextColor(21,35,45);doc.text(clean(l),mx,y);doc.text(clean(v),W-mx,y,{align:'right'});y+=5;doc.setDrawColor(211,220,225);doc.setLineWidth(.5);doc.line(mx,y,W-mx,y);y+=13};
    var rowsOf=function(id){var q=document.getElementById(id).querySelectorAll('.r');for(var i=0;i<q.length;i++){var sp=q[i].querySelector('span'), sm=sp.querySelector('small');line(sp.firstChild?sp.firstChild.textContent:'',q[i].querySelector('b').textContent,/\bhl\b/.test(q[i].className))}};
    doc.setFont('helvetica','bold');doc.setFontSize(18);doc.setTextColor(21,35,45);
    var tl=doc.splitTextToSize(clean(p.nom||'Immeuble'),W-2*mx);doc.text(tl,mx,y);y+=tl.length*21;
    doc.setFont('helvetica','normal');doc.setFontSize(10.5);doc.setTextColor(90,107,118);
    doc.text(clean((p.ville?p.ville+' - ':'')+$('hPrix').textContent+' - '+$('hMeta').textContent),mx,y);y+=8;
    h2('Chiffres clés');
    var ts=document.getElementById('tiles').querySelectorAll('.tile');
    for(var i=0;i<ts.length;i++) line(ts[i].querySelector('.k').textContent+'  ('+clean(ts[i].querySelector('.s').textContent)+')',ts[i].querySelector('.v').textContent,i===0||i===5);
    h2('Revenus et dépenses');rowsOf('rev');
    h2('Financement');rowsOf('fin');
    h2('Rendement');rowsOf('rend');
    h2('Scénarios : cashflow par mois et couverture de la dette');
    var tr=document.getElementById('scen').querySelectorAll('tr');
    for(var j=0;j<tr.length;j++){var td=tr[j].querySelectorAll('td');line(td[0].textContent,td[1].textContent+'   |   '+td[3].textContent+'   |   '+td[4].textContent,j===0)}
    if(p.note){h2('Notes');doc.setFont('helvetica','normal');doc.setFontSize(10.5);doc.setTextColor(21,35,45);
      p.note.split(/\n/).forEach(function(par){var ls=doc.splitTextToSize(clean(par)||' ',W-2*mx);ls.forEach(function(l){need(15);doc.text(l,mx,y);y+=14})})}
    need(40);y+=14;doc.setFontSize(8.5);doc.setTextColor(90,107,118);
    doc.text(doc.splitTextToSize(clean('Produit le '+new Date().toLocaleDateString('fr-CA')+' avec le Calculateur de plex. Les chiffres reposent sur les hypothèses entrées par l\'utilisateur. Aide à la réflexion, pas un conseil financier.'),W-2*mx),mx,y);
    var name=(p.nom||'immeuble').replace(/[^\wÀ-ÿ -]/g,'').trim().slice(0,60)||'immeuble';
    doc.save('Analyse '+name+'.pdf');
  }
  // seuil d'entrée : on le retire une fois franchi, ou dès qu'on clique
  var se=$('seuil');
  if(se){var fin=function(){if(se.parentNode) se.parentNode.removeChild(se)};
    se.addEventListener('animationend',function(e){if(e.animationName==='seuil-zoom') fin()});
    se.addEventListener('click',fin); setTimeout(fin,4500)}
  try{$('intro').hidden=!!localStorage.getItem('plex-intro')}catch(e3){$('intro').hidden=false}
  fill();render();
  // Reçoit une annonce envoyée par l'extension de navigateur (même fenêtre seulement).
  window.addEventListener('message',function(e){
    if(e.source!==window||!e.data||e.data.type!=='plex-annonce'||typeof e.data.texte!=='string') return;
    var c0=cur(); if(!c0.ex&&c0.nom!=='Nouvel immeuble'){S.list.push({nom:'Nouvel immeuble',ville:'',ex:0,note:'',files:[],v:Object.assign({},BLANK)});S.cur=S.list.length-1}
    if(typeof e.data.url==='string'&&/^https:\/\//.test(e.data.url)) cur().note=(cur().note?cur().note+'\n':'')+e.data.url.slice(0,300);
    $('paste').value=e.data.texte.slice(0,60000); tab('donnees'); $('bParse').click();
  });
})();
