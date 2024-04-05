async function rayonDeplacement(data, localisation, rayonDeplacement){
        let result = [];
        const lesDistances = new Map(); //MAP POUR OPTIMISER LES REQUETES

        for (let prestation of data) {
            
            const elt = prestation.prestation;

            let distance=0;

            if(lesDistances.has(elt.gentiVoisin.adresse)){
                distance=lesDistances.get(elt.gentiVoisin.adresse)
            }else{
                const data2 = await (await fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + elt.gentiVoisin.adresse)).json();

                const data1 = await (await fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + localisation)).json();
                
                const coord1 = { latitude: parseFloat(data1[0].lat), longitude: parseFloat(data1[0].lon) };
                const coord2 = { latitude: parseFloat(data2[0].lat), longitude: parseFloat(data2[0].lon) };

                const resultat =   await (await fetch('https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf62487505453cbe954088a8aac8c7280886a8&start=' + coord1.longitude + ',' + coord1.latitude + '&end=' + coord2.longitude + ',' + coord2.latitude)).json();
                
                distance = await resultat.features[0].properties.summary.distance / 1000;

                lesDistances.set(elt.gentiVoisin.adresse,distance);
            }

            if (distance <= rayonDeplacement) {
                result.push(prestation);
            }
        }
        return result; 
}



function creationElement( classe="", text=""){
    const element= document.createElement("div");

    if(classe!=""){
        element.className=classe;
    }

    if(text!=""){
        element.innerHTML=text;
    }


    return element;
}

// GESTION FAVORI 
async function ajouterFavori(event,element,idPrestation, idGenti){
    event.stopPropagation();

    await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/favori/insert?idPres="+idPrestation+"+&idGenti="+idGenti) ;

    element.className="unePrestation_proprio_favori unePrestation_proprio_favori_rouge";
    //ONCE = L'EVÈNEMENT NE SE DÉCLENCHE QU'UNE SEULE FOIS
    const once = {
        once: true,
    };
    element.addEventListener("click",(event)=> supprimerFavori(event,element,idPrestation, idGenti),once)
}

async function supprimerFavori(event,element,idPrestation, idGenti){
    event.stopPropagation();

    await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/favori/delete?idPres="+idPrestation+"+&idGenti="+idGenti)

    element.className="unePrestation_proprio_favori";
     //ONCE = L'EVÈNEMENT NE SE DÉCLENCHE QU'UNE SEULE FOIS
    const once = {
        once: true,
    };
    element.addEventListener("click",(event)=> ajouterFavori(event,element,idPrestation, idGenti),once)
}


//AFFICHER LA PRESTATION
function affichagePrestation(prestation,connecte){
    const elt = prestation.prestation;

    const unePrestation = creationElement("d-flex flex-column justify-content-center align-items-center unePrestation")
    unePrestation.addEventListener("click",() => { window.location="unePrestation.html?prestation="+elt.idPrestation } )

    //IMAGE
    const img=creationElement("unePrestation_img");
    img.style.backgroundImage = prestation.image==""? "" : "url("+prestation.image+")";
    

    const titre=creationElement("unePrestation_titre",elt.libelle);

    //PRIX
    const prix= creationElement("unePrestation_prix d-flex align-items-center",prestation.prix.prixTrans+" <div></div> + "+prestation.prix.prixJournalier+" <div></div> / Jour");

    //NOTATION
    let notation;
    if(prestation.notation.total){
        notation= creationElement("unePrestation_notation d-flex align-items-center")//<div></div><div></div><div></div><div></div><div></div><p>"+prestation.notation.total+"</p>
        
        for(let i=0;i<Math.floor(prestation.notation.noteMoyenne);i++){
            notation.appendChild(creationElement("unePrestation_notation_complet"))
        }

        if(Math.floor(prestation.notation.noteMoyenne) != Math.ceil(prestation.notation.noteMoyenne)){
            notation.appendChild(creationElement("unePrestation_notation_moitie"))
        }

        for(let i=Math.ceil(prestation.notation.noteMoyenne);i<5;i++){
            notation.appendChild(creationElement("unePrestation_notation_vide"))
        }


        const nbr= document.createElement("p");
        nbr.textContent=prestation.notation.total
        notation.appendChild(nbr);
    
    }else{
        notation= creationElement("unePrestation_notation d-flex align-items-center","")
        const nouveau = creationElement("unePrestation_notation_text","Nouveau");
        notation.appendChild(nouveau);
    }



    unePrestation.appendChild(img);
    unePrestation.appendChild(titre);

    if(connecte!=""){
        //PROPRIO
        const proprio = creationElement();
        
        const nomPrenom = creationElement("", elt.gentiVoisin.prenom + " " + elt.gentiVoisin.nom);
        const adresse = creationElement("", elt.gentiVoisin.adresse );

        proprio.appendChild(nomPrenom);
        proprio.appendChild(adresse);

        //FAVORI 
        const favori = creationElement("unePrestation_proprio_favori" );
        const once = {
            once: true,
        };
        if(prestation.favori){
            favori.className="unePrestation_proprio_favori unePrestation_proprio_favori_rouge";
            
            favori.addEventListener("click",(event)=> supprimerFavori(event,favori,elt.idPrestation,connecte),once)
        }else{

            favori.addEventListener("click",(event) => ajouterFavori(event,favori,elt.idPrestation,connecte),once)
        }   


        proprio.addEventListener("click",(event) => { event.stopPropagation(); window.location="unGentiVoisin.html?voisin="+elt.gentiVoisin.idUser } )

        const superProprio = creationElement("unePrestation_proprio");


        superProprio.appendChild(proprio);
        superProprio.appendChild(favori);
        
        unePrestation.appendChild(superProprio);
    }


    unePrestation.appendChild(prix);
    unePrestation.appendChild(notation);

    return unePrestation;
}