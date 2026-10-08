(function(){
  // Seuil d'entrée : une seule ligne de temps, pour que la porte, l'avancée et le fondu s'enchaînent sans à-coup.
  var se=document.getElementById('seuil');
  if(se){
    var fin=function(){if(se.parentNode) se.parentNode.removeChild(se)};
    se.addEventListener('click',fin);
    var calme=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(calme){se.addEventListener('animationend',function(e){if(e.target===se) fin()}); setTimeout(fin,2600)}
    else{
      var scene=se.querySelector('.seuil-scene'), titre=se.querySelectorAll('.seuil-titre,.seuil-note');
      var P=document.getElementById('bt-p'), C1=document.getElementById('bt-c1'), C2=document.getElementById('bt-c2'), K=document.getElementById('bt-k');
      var X0=730, W=140, Y0=392, Y1=650, CY=521, D=820; // charnière à gauche, vue en perspective
      var pt=function(u,y,sin,cos){var s=D/(D+u*sin);return (X0+u*cos*s).toFixed(2)+','+(CY+(y-CY)*s).toFixed(2)};
      var quad=function(u0,u1,y0,y1,sin,cos){return pt(u0,y0,sin,cos)+' '+pt(u1,y0,sin,cos)+' '+pt(u1,y1,sin,cos)+' '+pt(u0,y1,sin,cos)};
      var porte=function(deg){var r=deg*Math.PI/180, sin=Math.sin(r), cos=Math.cos(r);
        P.setAttribute('points',quad(0,W,Y0,Y1,sin,cos)); C1.setAttribute('points',quad(18,122,412,504,sin,cos)); C2.setAttribute('points',quad(18,122,524,628,sin,cos));
        var k=pt(122,522,sin,cos).split(','); K.setAttribute('cx',k[0]); K.setAttribute('cy',k[1])};
      var io=function(x){return x<0?0:x>1?1:x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}; // départ et arrivée en douceur
      var seg=function(t,a,b){return (t-a)/(b-a)};
      var T0=null, DUR=3000;
      var pas=function(now){
        if(!se.parentNode) return;
        if(T0===null) T0=now; var t=now-T0;
        porte(98*io(seg(t,850,2050)));                       // la porte pivote
        var z=io(seg(t,1350,DUR));                            // on avance : échelle exponentielle = vitesse perçue constante
        scene.style.transform='scale('+Math.exp(2.75*z).toFixed(4)+')';
        var f=seg(t,DUR-520,DUR); f=f<0?0:f>1?1:f;
        scene.style.opacity=(1-f*f).toFixed(3);
        var ft=seg(t,1250,1700); ft=ft<0?0:ft>1?1:ft;
        for(var i=0;i<titre.length;i++) titre[i].style.opacity=(1-ft).toFixed(3);
        if(t<DUR) requestAnimationFrame(pas); else fin();
      };
      requestAnimationFrame(pas);
    }
  }
  // Connexion et abonnement : pas encore ouverts. On le dit clairement, sans rien collecter.
  var d=document.getElementById('soon'), T={
    connexion:['La connexion arrive bientôt','Les comptes ne sont pas encore ouverts. Pour l\u2019instant, le calculateur fonctionne sans compte et garde tes immeubles dans ce navigateur.'],
    abonnement:['Les abonnements ne sont pas encore ouverts','Le forfait Abonné est en préparation et son prix n\u2019est pas fixé. Rien ne t\u2019est demandé ni facturé. En attendant, tout le calculateur est gratuit.']};
  document.addEventListener('click',function(e){
    var k=e.target&&e.target.dataset&&e.target.dataset.soon;
    if(k&&T[k]){document.getElementById('soonT').textContent=T[k][0];document.getElementById('soonP').textContent=T[k][1];if(d.showModal) d.showModal(); else d.setAttribute('open','')}
    else if(e.target&&e.target.id==='soonX'){if(d.close) d.close(); else d.removeAttribute('open')}
  });
})();
