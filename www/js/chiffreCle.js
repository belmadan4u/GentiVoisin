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
let graphiqueGeneral;

function mettreAJourBordure(numero){
    document.querySelectorAll(".chiffreCle_gauche_bas_chiffre").forEach( (elt,idx) => {
        if(idx==numero){
            elt.className="border-3 pt-2 p-3 bg-white chiffreCle_gauche_bas_chiffre";
        }else{
            elt.className=" pt-2 p-3 bg-white chiffreCle_gauche_bas_chiffre";
        }
    })

}

function genererGraphique(dates,values,type){
    // Créer un graphique
    const ctx2 = document.getElementById('graphiqueGeneral').getContext('2d');
     graphiqueGeneral = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: type,
                data: values,
                backgroundColor: 'rgb(244, 198, 2)',
                borderColor: 'rgb(244, 198, 2)',
                borderWidth: 1,
                tension:0.3
            }]
        },
    });
}

async function initialiserStat(){
    /* --------------   GESTION DE LA CONNEXION  -----------------------*/
    const connecte=getCookie("id_user");

    if(!connecte){
        window.location="index.html";
    }

    const voisin = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byId?id="+connecte)).json() ;

    if(!voisin.admin){
        window.location="index.html";
    }

    /* --------------CHARGEMENT DES DONNÉES  -----------------------*/

    const lesAppartenances = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/appartient/get")).json() ;
    const lesPrestations =  await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prestation/byStatut?statut=1")).json() ;
    const lesTransactionsAccepte =  await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/byStatut?statut=1")).json() ;
    const lesTransactionsRefuse =  await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/byStatut?statut=2")).json() ;
    
    const lesGentiVoisins =  await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byStatut?statut=1")).json() ;
    
    
    /* --------------DECLARATION POUR LES PRIX MOYEN -----------------------*/

    let nombre=0;
    let prixJournalier=0;
    let prixTrans = 0; 

    /* --------------DECLARATION POUR LE GRAPHIQUE GÉNÉRAL -----------------------*/
    let gentiVoisinMap = new Map();
    let gentiVoisinDate = [];
    let gentiVoisinNombre = [];

    let annonceMap = new Map();
    let annonceDate = [];
    let annonceNombre = [];

    let transactionMap = new Map();
    let transactionDate = [];
    let transactionNombre = [];

    let jetonMap = new Map();
    let jetonDate = [];
    let jetonNombre = [];
    let nombreJetons = 0;

    
    /* --------------DECLARATION POUR LES TRANSACTIONS MOYENS -----------------------*/

    let nombreAccepte=lesTransactionsAccepte.length;
    let dureeTransaction=0;
    let prixTransaction = 0; 

    /* --------------RECUPÉRATION POUR LES TRANSACTIONS  -----------------------*/

    for(let transaction of lesTransactionsAccepte){
        const prix =  parseInt((await (await fetch(" https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/prix?idTransaction="+transaction.idTransaction)).json())) ; 


        prixTransaction += prix

        let laDateD = new Date(transaction.dateDebut);
        let laDateF =new Date( await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/dateFin?statut=1&idTransaction="+transaction.idTransaction)).json())
        
        dureeTransaction += Math.floor((laDateF - laDateD + 1) / (1000 * 60 * 60 * 24)); //NOMBRE DE JOUR DE PRÉSTATION

        const date = transaction.dateDemandeTransaction;
        if(transactionMap.has(date)){
            transactionMap.set(date,transactionMap.get(date)+1);
        }else{
            transactionMap.set(date,1);
        }

        if(jetonMap.has(date)){
            jetonMap.set(date,jetonMap.get(date)+prix);
        }else{
            jetonMap.set(date,prix);
        }
    }

    /* --------------AFFICHAGE DE LA CARTE  -----------------------*/

     
    const map = L.map('carte').setView([0,0], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
   
    //MAP POUR LE NOMBRE DE PRÉSTATION PAR VILLE 
    let lesVilles = new Map();

    for(let prestation of lesPrestations){
        //CARTE
       const ville = prestation.gentiVoisin.adresse;
       if(lesVilles.has(ville)){
           lesVilles.set(ville,lesVilles.get(ville)+1);
       }else{
           lesVilles.set(ville,1);
       }

       //VALORISATION MOYEN
       prix =  await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/valorisation/prixActuel?idPrestation="+prestation.idPrestation)).json() ;
    
       nombre++;
       prixJournalier+=prix.prixJournalier;
       prixTrans+=prix.prixTrans;

        //GRAPHE GENERAL

        const date =prestation.dateAjout;
        if(annonceMap.has(date)){
            annonceMap.set(date,annonceMap.get(date)+1);
        }else{
            annonceMap.set(date,1);
        }
    }


   //AFFICHAGE DES MARKERS 
   for (let [key, value] of lesVilles) {
       const data = await (await fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + key)).json();

       const coord = { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
       
       const marker = L.marker([coord.latitude, coord.longitude]).addTo(map);
       
       const text= value==1 ? value+" préstation à "+key : value+" préstations à "+key
       marker.bindPopup("<b>"+text+" </b>").openPopup();
   }

    /* --------------GÉNÉRATION DES CANVAS  -----------------------*/
    const representationsCateg = document.querySelector(".chiffreCle_droite_bas");
    const canvasReprésentation = document.createElement("canvas");
    canvasReprésentation.className="flex-fill border-2 mt-3 bg-white rounded";
    canvasReprésentation.id="chart"

    representationsCateg.removeChild(representationsCateg.querySelector(".loader"));
    representationsCateg.appendChild(canvasReprésentation);
    
    const general = document.querySelector(".chiffreCle_gauche_bas");
    const canvasGeneral = document.createElement("canvas");
    canvasGeneral.className="border-2 m-3 bg-white rounded ";
    canvasGeneral.id="graphiqueGeneral"

    general.removeChild(general.querySelector(".loader"));
    general.appendChild(canvasGeneral); 

    /* --------------AFFICHAGE PIE CHART  -----------------------*/


 
    let lesCategories = new Map();

    for(let appartient of lesAppartenances){
       if(appartient.prestation.valide=="1"){
            const categorie = appartient.categorie.libelle;
            if(lesCategories.has(categorie)){
                lesCategories.set(categorie,lesCategories.get(categorie)+1);
            }else{
                lesCategories.set(categorie,1);
            }
        }
    }
    let listeCles = [];
    let listeValeurs = [];
    let listeBackGround= [];
   
    for (let [key, value] of lesCategories) {
        listeCles.push(key)
        listeValeurs.push(value);

        const couleur = chroma.random().saturate(4).darken(0.4).hex();
        listeBackGround.push(couleur);
    }

    const data = {
        labels: listeCles,
        datasets: [{
            label: 'Valeurs',
            data: listeValeurs,
            backgroundColor: listeBackGround,
            borderWidth: 1
        }]
    };

    // Configuration du graphique
    const options = {
        responsive: false,
        maintainAspectRatio: false,
        scale: {
            ticks: {
                beginAtZero: true
            }
        }
    };

    // Créer le graphique
    const ctx = document.getElementById('chart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: options
    });

    /* --------------AFFICHAGE STATISTIQUE DU MILIEU   -----------------------*/

    const lesChiffres = document.querySelectorAll(".chiffreCle_milieu_chiffre");

    lesChiffres[0].querySelectorAll("div")[1].textContent=( lesTransactionsRefuse.length / lesTransactionsAccepte.length ).toFixed(2)*100+" %";
    lesChiffres[1].querySelectorAll("div")[1].textContent=( dureeTransaction/nombreAccepte ).toFixed(2)+" Jours";
    lesChiffres[2].querySelectorAll("div")[1].textContent=( prixTransaction/nombreAccepte ).toFixed(2);
    lesChiffres[3].querySelectorAll("div")[1].textContent=( prixJournalier/nombre ).toFixed(2);
    lesChiffres[4].querySelectorAll("div")[1].textContent=( prixTrans/nombre ).toFixed(2);

    /* -------------- GRAPHIQUE GÉNÉRAL   -----------------------*/

    //GENTIVOISIN
    for(let genti of lesGentiVoisins){  
        const date =genti.dateCreation;
        if(gentiVoisinMap.has(date)){
            gentiVoisinMap.set(date,gentiVoisinMap.get(date)+1);
        }else{
            gentiVoisinMap.set(date,1);
        }

        nombreJetons+= genti.valide=='1' ? genti.credit : 0 ;
    }


    let entries = Array.from(gentiVoisinMap);
    entries = entries.sort((a,b) => new Date(a[0]).getTime() - new Date(b[0]).getTime() )

    for (let entree of entries) {
        gentiVoisinDate.push(entree[0])
        gentiVoisinNombre.push(entree[1]);
    }

    //ANNONCES
    entries = Array.from(annonceMap);
    entries = entries.sort((a,b) => new Date(a[0]).getTime() - new Date(b[0]).getTime() )

    for (let entree of entries) {
        annonceDate.push(entree[0])
        annonceNombre.push(entree[1]);
    }

    //TRANSACTIONS
    entries = Array.from(transactionMap);
    entries = entries.sort((a,b) => new Date(a[0]).getTime() - new Date(b[0]).getTime() )

    for (let entree of entries) {
        transactionDate.push(entree[0])
        transactionNombre.push(entree[1]);
    }


    //JETONS 
    entries = Array.from(jetonMap);
    entries = entries.sort((a,b) => new Date(a[0]).getTime() - new Date(b[0]).getTime() )

    for (let entree of entries) {
        jetonDate.push(entree[0])
        jetonNombre.push(entree[1]);
    }

    const element = document.querySelectorAll(".chiffreCle_gauche_bas_chiffre");
    

    // Créer un graphique
    genererGraphique(gentiVoisinDate,gentiVoisinNombre,"Comptes crée");

    element[0].addEventListener("click", () =>{ 
        graphiqueGeneral.destroy();
        mettreAJourBordure(0);
        genererGraphique(gentiVoisinDate,gentiVoisinNombre,"Comptes cré");
    })
    element[0].querySelectorAll("div")[1].textContent=gentiVoisinDate.length+1;

    element[1].addEventListener("click", () =>{ 
        graphiqueGeneral.destroy();
        mettreAJourBordure(1);
        genererGraphique(annonceDate,annonceNombre,"Préstations publiées");
    })
    element[1].querySelectorAll("div")[1].textContent=annonceDate.length+1;

    element[2].addEventListener("click", () =>{
        graphiqueGeneral.destroy();
        mettreAJourBordure(2);
        genererGraphique(transactionDate,transactionNombre,"Transactions demandées");
    })
    element[2].querySelectorAll("div")[1].textContent=transactionDate.length+1;

    element[3].addEventListener("click", () =>{ 
        graphiqueGeneral.destroy();
        mettreAJourBordure(3);
        genererGraphique(jetonDate,jetonNombre,"Jetons en circulation");
    })
    element[3].querySelectorAll("div")[1].textContent= nombreJetons;


}

initialiserStat();
