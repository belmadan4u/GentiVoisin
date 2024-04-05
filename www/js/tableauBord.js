//GESTION DES COOKIES
function getCookie(name) {
  const cookies = document.cookie.split(";");

  for (let i of cookies) {
    let cookie = i.trim();

    if (cookie.startsWith(name)) {
      return cookie.substring(name.length + 1, cookie.length);
    }
  }
  return "";
}


if (getCookie("id_user") == "" || getCookie("id_user") == undefined) {
  window.location = "../index.html";
}

function deleteAllCookies() {
  let cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    let name = cookie.split("=")[0].trim();
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  }
}

//Initialisation du tableau de bord

function initTableauBord(json) {
  document.querySelector("#nbJetons").textContent = json.credit;
  if (json.admin == true) {
    document.querySelector("#divAdmin").style.display = "block";
  }
}

fetch(
  "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byId?id=" +
    getCookie("id_user")
)
  .then((data) => data.json())
  .then((json) => initTableauBord(json));
