(function(){
  // Seuil d'entrée : on le retire une fois franchi, ou dès qu'on clique.
  var se=document.getElementById('seuil');
  if(se){var fin=function(){if(se.parentNode) se.parentNode.removeChild(se)};
    se.addEventListener('animationend',function(e){if(e.target===se) fin()});
    se.addEventListener('click',fin); setTimeout(fin,5000)}
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
