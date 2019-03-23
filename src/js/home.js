// const usuario = new Promise(function(todoBien, todoMal){
//   setTimeout(function(){
//     todoMal("Todo va mal");
//   },3000)
  
// })


// usuario
//   .then(function(){
//     console.log("Todo va bien")
//   })
//   .catch(function(mensaje){
//     console.log(mensaje)
//   })


(async function load(){

  async function getData(url){
    const response = await fetch(url);
    const data = await response.json();
    if (data.data.movie_count >= 1) {
      // aquí se acaba
      return data;
    }
    // si no hay pelis aquí continua
    throw new Error('No se encontró ningun resultado');
  }

  async function getAmigo(url){
    const response = await fetch(url);
    const data = await response.json();
      return data;
  }

  function setAttribute($element, attributes){
    for(const attribute in attributes){
      $element.setAttribute(attribute, attributes[attribute]);
    }
  }

  function templateMovie(movie){
    return(
      `<div class="featuring">
        <div class="featuring-image">
          <img src="${movie.medium_cover_image}" width="70" height="100" alt="">
        </div>
        <div class="featuring-content">
          <p class="featuring-title">Pelicula encontrada</p>
          <p class="featuring-album">${movie.title}</p>
        </div>
      </div>`
    )
  }

  const $form = document.querySelector("#form");
  const $home = document.querySelector("#home");
  const $featuringContainer = document.querySelector("#featuring");
  const $autocomplete = document.querySelector("#movie_list");
  const BASE_API = "https://yts.am/api/v2/list_movies.json";
  const AMIGOS_API = "https://randomuser.me/api/";
  var cont = -1;
  $form.addEventListener("submit", async (event)=>{
    event.preventDefault();
    $home.classList.add("search-active");
    const $loader = document.createElement("img");
    setAttribute($loader, {
      src: "src/images/loader.gif",
      width: 50,
      height: 50,
    })

    $featuringContainer.append($loader);
    try{
      const data = new FormData($form);
      const{
        data: {
          movies: pelis
        }
      } = await getData(`${BASE_API}?limit=1&query_term=${data.get('name')}`)
      $featuringContainer.innerHTML = templateMovie(pelis[0]);
    }catch(error){
      alert(error.message);
      $loader.remove();
      $home.classList.remove('search-active');
    }
    
  })

  $form.addEventListener("keydown", async (event) =>{
    let code = event.keyCode
    if(code != 8 && code !=13 && code != 9 && code != 17 ){
      let caracter = event.key
      cont++
      const {
        data: {
          movies: peliculas
        }
      } = await getData(`${BASE_API}?limit=50`); 
      for(var i=0;i<peliculas.length;i++){
        if(peliculas[i].title.charAt(cont).toUpperCase() == caracter.toUpperCase()){
          console.log(peliculas[i].title)
        }
      }
    } 
  })
    


  const recomendadas = await getData(BASE_API);
  const $recomendadasContainer = document.querySelector(".myPlaylist");

  for (let index = 0; index < 8; index++) {
    renderRecomendadas(recomendadas, $recomendadasContainer, index); 
  }

  async function cacheExist(category){
    const list = `${category}List`;
    const cache = window.localStorage.getItem(list)
    if(cache){
      return JSON.parse(cache);
    }
    const { data:{ movies: data }} = await getData(`${BASE_API}?genre=${category}`);
    window.localStorage.setItem(list,JSON.stringify(data))
    return data
  }

  const actionList = await cacheExist("action")
  const $actionContainer = document.querySelector("#action");
  renderMovies(actionList,$actionContainer, "Accion");

  const dramaList = await cacheExist("drama")
  const $dramaContainer = document.querySelector("#drama");
  renderMovies(dramaList,$dramaContainer,"Drama");

  const animationList = await cacheExist("animation")
  const $animationContainer = document.querySelector("#animation");
  renderMovies(animationList,$animationContainer,"Animacion");

  for (let index = 0; index < 8; index++) {
    const amigos = await getAmigo(AMIGOS_API);
    const $amigosContainer = document.querySelector(".playlistFriends");
    renderAmigos(amigos,$amigosContainer);
  }
  
  function videoItemTemplate(movie, category){
    return (
      `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}">
        <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}">
        </div>
        <h4 class="primaryPlaylistItem-title">
        ${movie.title}
        </h4>
      </div>`
    )
  }
  
  function renderRecomendadas(recomendada, $container, index){
    const render = recomendadasTemplate(recomendada, index);
    const template2 = createTemplate(render);
    $container.append(template2);
  }


  function recomendadasTemplate(recomendada, index){
    return(
      `<li class="myPlaylist-item">
        <a href="#">
          <span>
            ${recomendada.data.movies[index].title}
          </span>
        </a>
      </li>`
    )
  }
  

  function renderAmigos(amigo,$container){
    const render = amigosTemplate(amigo);
    const template1 = createTemplate(render);
    $container.append(template1);
  }

  function amigosTemplate(amigo){
    return(
      `<li class="playlistFriends-item">
        <a href="#">
          <img src="${amigo.results[0].picture.thumbnail}" />
          <span>
            ${amigo.results[0].name.first} ${amigo.results[0].name.last}
          </span>
        </a>
      </li>`
    )
  }


  function createTemplate(template){
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = template;
    return html.body.children[0]
  }

  function eventClick($element){
    $element.addEventListener("click", () => {
      showModal($element);
    })
  }

  function renderMovies (list, $container, category){
    $container.children[0].remove();
    list.forEach((movie) => {
      const htmlString = videoItemTemplate(movie, category);
      const template = createTemplate(htmlString)
      $container.append(template)
      const render = template.querySelector("img");
      render.addEventListener("load",(event)=>{
        event.srcElement.classList.add("fadeIn");
      })
      eventClick(template);
    });
  }
  
  const $modal = document.querySelector("#modal");
  const $overlay = document.querySelector("#overlay");
  const $hideModal = document.querySelector("#hide-modal");

  const $modalTitle = $modal.querySelector("h1");
  const $modalImage = $modal.querySelector("img");
  const $modalDescription = $modal.querySelector("p");

  function findById(list, id){
    return list.find(movie => movie.id === parseInt(id,10))
  }

  function findMovie(id, category){
    switch(category){
      case "Accion": {
        return findById(actionList,id);
      }

      case "Drama": {
        return findById(dramaList,id);
      }

      default: {
        return findById(animationList,id);
      }
    }
    
  }

  function showModal($element){
    $overlay.classList.add("active")
    $modal.style.animation = "modalIn .8s forwards";
    const id = $element.dataset.id;
    const category = $element.dataset.category;
    const data = findMovie(id, category);

    $modalTitle.textContent = data.title;
    $modalImage.setAttribute("src",data.medium_cover_image); 
    $modalDescription.textContent = data.description_full;

  }

  $hideModal.addEventListener("click",()=>{
    $overlay.classList.remove("active")
    $modal.style.animation = "modalOut forwards";
  })

})()
  