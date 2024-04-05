//GESTION DE LA CONNEXION
function getCookie(name){
  const cookies = document.cookie.split(';');

  for (let i of cookies) {
    let cookie = i.trim();

    if (cookie.startsWith(name)) {
      return cookie.substring(name.length + 1, cookie.length);
    }
  }
  return "";
}


async function initialiserFavori(){
    const connecte=getCookie("id_user");

    if(!connecte){
        window.location="index.html";
    }

    const data = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/favori/byGenti?idGenti="+ connecte )).json() ;
    
    let lesDonnes=[];

    for(let favori of data){
      if(favori.prestation.valide=='1' && !favori.prestation.archive ){
        const prestation =  await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prestation/byIdAffichage?idPrestation="+favori.prestation.idPrestation+"&idGenti="+connecte)).json() ;
        lesDonnes.push( prestation )
      }
    }

 

        

    const lesFavoris = document.querySelector(".recherche_all_resultat_lesPrestations");
    lesFavoris.innerHTML="";
    
    lesDonnes.forEach(prestation => {
      lesFavoris.appendChild( affichagePrestation(prestation,connecte));
    });

    if(lesDonnes.length==0){
        const div= document.createElement("div")
        div.className="recherche_all_resultat_lesPrestations_noResultat"

        lesFavoris.appendChild(div)
    }

    

}

initialiserFavori();