// var base = "/"
var base = "http://loencontre.co/"
// var base = "http://localhost/"

class MainController {

  constructor() {
    this.initData();
    $("#name").css("display", "none");
    $("#probability").css("display", "none");
    $("#user_id").css("display", "none");
    $("#user_name").css("display", "none");
    $("#user_email").css("display", "none");
  }

  initData(){
    firtTime();
    $.ajax({
      dataType: "json",
      url: base + "loencontre.co/SourceBackend/pagination"
    }).done(function(pages) {
      $('#pagination-here').bootpag({
        total: pages.pageAmount
      }).on("page", function(event, num){
        $.ajax({
          dataType: "json",
          url: base + "loencontre.co/SourceBackend/get-page?pageNumber="+num
        }).done(function(data) {
          setPost(data);
        });
      });
    });
    return true;
  }  
}

function setPost(data) {
  $("#main").html("");
  for (var i in data) {
    var post = data[i];
    var fecha = new Date(post.date);
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    //console.log(post)
    addPost(post, options, fecha);
    //console.log("isas");
  }
  initScript();
  return true;
}

function setPostAfter(data) {
  $("#main").html("");
  for (var i in data) {
    var post = data[i];
    var fecha = new Date(post.date);
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    addPost(post, options, fecha)
  }
  setMain();
  return true;
}

function setPostLoad(data) {
  for (var i in data) {
    var post = data[i];
    var fecha = new Date(post.date);
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    addPost(post, options, fecha)
  }
  setMain();
  return true;
}

function addPost(post, options, fecha){
  if (post.user) {
    $("#main").append('<article class="thumb">' +
      '<a class="image" href="'+post.image+'"><img src="'+post.image+'" alt="" /></a>'+
      '<h2>'+fecha.toLocaleDateString("es-ES", options)+'</h2>' +
      '<p><a target="_blank" href="https://www.facebook.com/app_scoped_user_id/'+post.user_id+'"> ¡Contactame para la devolución! </a></p>' +
      '</article>'); 
  }else{
    $("#main").append('<article class="thumb">' +
      '<a class="image" href="'+post.image+'"><img src="'+post.image+'" alt="" /></a>'+
      '<h2>'+fecha.toLocaleDateString("es-ES", options)+'</h2>' +
      '<p> <a target="_blank" href="https://www.facebook.com/groups/5347104545/photos/"> Fuente</a></p>' +
      '</article>'); 
  }
}

function firtTime() {
  $.ajax({
    dataType: "json",
    url: base + "loencontre.co/SourceBackend/get-page?pageNumber=1"
  }).done(function(data) {
    setPost(data);
  });
  return true;
}

// Funciones de facebook pasan al controlador "controllerFacebook.js"

function newPost(txtFilter, user) {
  //console.log("veamos " + txtFilter);
  //console.log(user);
  $.showLoading("Enviando publicación...")
  if(txtFilter.length == 0){
    txtFilter = 'NN';
  }
  var post = {};
  post.contact = $("#contact").val();
  var d = new Date();
  post.date = d.toString();
  post.img = $('#img').get(0).files[0];
  post.text = txtFilter;
  $("#name").val(txtFilter);
  $("#user_id").val(user.id);
  $("#user_name").val(user.name);
  $("#user_email").val(user.email);
  
  post = new FormData($("#new")[0]);
  $.ajax({
   type: "POST",
   url: base + "loencontre.co/SourceBackend/add-post",
   data: post,
   contentType: false,
   processData: false
 })
  .done(function(response)
  {
    response = JSON.parse(response);
    console.log(response);
    data = response.data;
    if(response.status == 'success'){
      console.log(data)
      console.log("Publicado");
      $.showNotify('Publicación exitosa', 'El carné fue publicado', 'success');
      var $panels = $('.panel');
      $panels.trigger('---hide');
      //firtTime();
      location.reload();
    }else{
      $.showNotify('Error', data, 'error');

    }
    $.hiddenLoading()
  })
  .fail(function(err){
    console.log(err);
    $.showNotify('Error', 'Ocurrió un error al publicar, intente mas tarde.', 'error');
    $.hiddenLoading()    
  });
}

function newSearchName() {
  search = $("#search_input").val();
  console.log(search);
  $.showLoading("Realizando búsqueda por nombre")
  $.ajax({
   type: "POST",
   url: base + "loencontre.co/SourceBackend/search-name?name=" + search,
   data: search,
   dataType: "json"
 })
  .done(function(response)
  {
    if(response.status == 'success'){
      data = response.data;
      if(data.length == 0){
        $.showNotify('Sin resultados', 'No se encontraron coincidencias', 'error');
      } else {
        $.showNotify('Busqueda completada', '', 'success');
        setPostAfter(data);
      }
    } else {
      responseB = response.data;
      if(responseB == 'Incorrect parameter'){
        $.showNotify('Error', 'Ocurrió un error en la busqueda, intente mas tarde.', 'error');
      }
    }
    $.hiddenLoading()
  })
  .fail(function(err){
    console.log("error");
    console.log(err.responseText);
    $.showNotify('Error', 'Ocurrió un error en la busqueda, intente mas tarde.', 'error');
    $.hiddenLoading()
  });
}

function newSearchDate() {
  startRange = $("#startRange").val();
  endRange = $("#endRange").val();
  console.log(startRange);
  console.log(endRange);
  $.ajax({
    dataType: "json",
    url: base + "loencontre.co/SourceBackend/date-range?startRange",
    data : {startRange : startRange, endRange : endRange}
  })
  .done(function(response)
  {
    if(response.status == 'success'){
      data = response.data;

      if (data[0] == 'La fecha final debe ser mayor a la fecha inicial. Y la fecha inicial y final deben ser menores o iguales a la fecha actual.') {
       $.showNotify('Error', data[0], 'error');      
     }else if(data.length == 0){
      $.showNotify('Sin resultados', 'No se encontraron coincidencias', 'error');
    } else {
      $.showNotify('Busqueda completada', '', 'success');
      setPostAfter(data);
    }

    }else{
      console.log(response.data);
      $.showNotify('Error', 'Ocurrió un error en la busqueda, intente mas tarde.', 'error');
    }
  })
  .fail(function(err){
    console.log(err);
    $.showNotify('Error', 'Ocurrió un error en la busqueda, intente mas tarde.', 'error');
  });
}

function archivo(evt) {
  var files = evt.target.files; 
  for (var i = 0, f; f = files[i]; i++) {         
           //Solo admitimos imágenes.
           if (!f.type.match('image.*')) {
            continue;
          }

          var reader = new FileReader();

          reader.onload = (function(theFile) {
           return function(e) {
               // Creamos la imagen.
               document.getElementById("list").innerHTML = ['<img class="thumbNew" src="', e.target.result,'" title="', escape(theFile.name), '"/>'].join('');
             };
           })(f);

           reader.readAsDataURL(f);
         }
       }

       document.getElementById('img').addEventListener('change', archivo, false);

       function getOCRMicrosft(user){
        img = $('#img').get(0).files[0];
        params = {
          'language': 'es',
          'detectOrientation': 'true',
        };
        $.ajax({
         type: 'POST',
         url: 'https://westus.api.cognitive.microsoft.com/vision/v1.0/ocr?' + $.param(params),
         data: img,
         beforeSend: function(xhrObj){
            // Request headers
            xhrObj.setRequestHeader("Content-Type","application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","bfa235c067444a6a964cfa7045109e96");
          },
          processData: false
        })
        .done(function(data)
        {
          regions = data.regions;
          if(regions.length>0){ //verificando que existen regiones con texto y monnstrandolas
            lines = data.regions[0].lines;
            txtMicrosoft = '';
            index = 0;
            lines.forEach(function(line){
              line.words.forEach(function(text){            
                if (index == 0){
                  str=text.text.toLowerCase().replace(' ','').replace(/\./g,'');
                  txtMicrosoft =  str;
                } else {
                  str=text.text.toLowerCase().replace(' ','').replace(/\./g,'');
                  txtMicrosoft = txtMicrosoft + '-' + str;
                }
                index++;
              });
            });
            txtFilter = pln(txtMicrosoft);
            // variable que tiene los nombres para realizar posibles combinaciones
            var nameDetect = txtFilter.filterText;
            var name = "";
            for (var index = 0; index < txtFilter.filterText.length; index++) {
             name = name + " " + txtFilter.filterText[index];
           }
           // Metodo que inicia la obtencion de candidatos dueños de facebook
           getMembersFacebook(nameDetect);
           newPost(name, user);
           document.getElementById("new").reset();
           document.getElementById("list").innerHTML = "";
         } else {
           console.log('No encuentra regiones de texto enviando NN');
           newPost("NN", user);
           document.getElementById("new").reset();
           document.getElementById("list").innerHTML = "";
         }
       })
        .fail(function(err){
          console.log(err);
        });
      }

      function pln(txt){
    //filtrando el texto  que ingresa
    var filterWords = txt.split('-');
    for (var i = filterWords.length - 1; i >= 0; i--) {
      if (filterWords[i].length<3||filterWords[i].match(/^upt/)||filterWords[i].match(/^univer/)||filterWords[i].match(/^hote/)||
        filterWords[i].match(/^compu/)||filterWords[i].match(/^edu/)||filterWords[i].match(/^matema/)||filterWords[i].match(/^elec/)||
        filterWords[i].match(/^peda/)||filterWords[i].match(/^natural/)||filterWords[i].match(/^enfermer/)||filterWords[i].match(/^profe/)||
        filterWords[i].match(/^agro/)||filterWords[i].match(/^huma/)||filterWords[i].match(/^estadis/)||filterWords[i].match(/^merca/)||
        filterWords[i].match(/^psico/)||filterWords[i].match(/^trans/)||filterWords[i].match(/^fisi/)||filterWords[i].match(/^bio/)||
        filterWords[i].match(/^extra/)||filterWords[i].match(/^pre/)||filterWords[i].match(/^econo/)||filterWords[i].match(/^cien/)||
        filterWords[i].match(/^zoo/)||filterWords[i].match(/^admin/)||filterWords[i].match(/^indus/)||filterWords[i].match(/^filo/)||
        filterWords[i].match(/^empre/)||filterWords[i].match(/^ambien/)||filterWords[i].match(/[0-9]/)||filterWords[i].match(/^geo/)||
        filterWords[i].match(/^finan/)||filterWords[i].match(/^comer/)||filterWords[i].match(/^tecn/)||filterWords[i].match(/^prod/)||
        filterWords[i].match(/^lic/)||filterWords[i].match(/gica/)||filterWords[i].match(/^aseso/)||filterWords[i].match(/fasis$/)||
        filterWords[i].match(/^mensa/)||filterWords[i].match(/ypțę/)||filterWords[i].match(/^cod/)||filterWords[i].match(/^sist/)||
        filterWords[i].match(/tunja/)||filterWords[i].match(/^ing/)||filterWords[i].match(/^www/)||filterWords[i].match(/cembia/)||
        filterWords[i].match(/^origi/)||filterWords[i].match(/ohmbu/)||filterWords[i].match(/del/)||filterWords[i].match(/acero/)||
        filterWords[i].match(/coo/)||filterWords[i].match(/vias/)||filterWords[i].match(/^derec/)||filterWords[i].match(/^socia/)||
        filterWords[i].match(/civil/)||filterWords[i].match(/^lengu/)||filterWords[i].match(/finanzas/)||filterWords[i].match(/^especia/)||
        filterWords[i].match(/idiomas/)||filterWords[i].match(/modernos/)||filterWords[i].match(/tc/)||filterWords[i].match(/minas/)||
        filterWords[i].match(/sica$/)||filterWords[i].match(/diseño/)|| filterWords[i].match(/sogamoso/)||filterWords[i].match(/^chiquin/)||
        filterWords[i].match(/t&tc/)||filterWords[i].match(/ñol$/)||filterWords[i].match(/ingles/)||filterWords[i].match(/duitama/)||
        filterWords[i].match(/medicina/)||filterWords[i].match(/^veteri/)||filterWords[i].match(/procesos/)||filterWords[i].match(/rccnol,igica/)||
        filterWords[i].match(/gestion/)||filterWords[i].match(/nuevo/)||filterWords[i].match(/chitaraqu/)||filterWords[i].match(/ląc/)||
        filterWords[i].match(/estudiante/)||filterWords[i].match(/semestre/)||filterWords[i].match(/valido/)||filterWords[i].match(/fcrfaaoos/)||
        filterWords[i].match(/sionau/)||filterWords[i].match(/ion/)||filterWords[i].match(/musica/)||filterWords[i].match(/atura$/)||
        filterWords[i].match(/qumca/)||filterWords[i].match(/имс/)||filterWords[i].match(/оамсо/)||filterWords[i].match(/аяманоо/)||
        filterWords[i].match(/соо/)||filterWords[i].match(/pe=iay/)||filterWords[i].match(/pcd@gógŕ•/)||filterWords[i].match(/^quimi/)||
        filterWords[i].match(/tuwa/)||filterWords[i].match(/p_țț_,/)||filterWords[i].match(/^colom/)||filterWords[i].match(/^coc/)||
        filterWords[i].match(/alta/)||filterWords[i].match(/^did/)||filterWords[i].match(/^bases/)||filterWords[i].match(/^servi/)||
        filterWords[i].match(/^turis/)||filterWords[i].match(/^conta/)||filterWords[i].match(/blica$/)||filterWords[i].match(/^inter/)||
        filterWords[i].match(/ticas$/)||filterWords[i].match(/ción$/)||filterWords[i].match(/^depor/)||filterWords[i].match(/^recre/)||
        filterWords[i].match(/nible$/)||filterWords[i].match(/^insta/)||filterWords[i].match(/^rede/)||filterWords[i].match(/^herra/)||
            filterWords[i].match(/^tele/)||filterWords[i].match(/^farma/)||filterWords[i].match(/ungvers'dad/)) { //el texto
  filterWords.splice(i, 1);
}
}
var data = {}
data.filterText = filterWords;
data.probability = probability(txt,filterWords);
return data;
}

function probability(txtMicrosoft, txtFilter){
  var lengthMicrosoft = txtMicrosoft.split('-').length;
  var lengthFilter = txtFilter.length;
  var probability = 0.0;
  if(lengthFilter == 0){
    probability=0;
  } else if (lengthMicrosoft<=4 || lengthFilter<=4){
    probability+=0.85;
  } else if(lengthFilter<lengthMicrosoft){
    probability+=0.70;
  } else if(lengthFilter==lengthMicrosoft) {
    probability+=0.50;
  } else {
    probability+=0.30;
  }

  return probability;
}



var controller = new MainController()

$.showNotify = function($title, $text, $style, $position) {
  if($style == "error"){
    $icon = "fa fa-exclamation";
  }else if($style == "warning"){
    $icon = "fa fa-warning";
  }else if($style == "success"){
    $icon = "fa fa-check";
  }else if($style == "info"){
    $icon = "fa fa-question";
  }else{
    $icon = "fa fa-circle-o";
  }
  $.notify({
    title: $title,
    text: $text,
    image: "<i class='"+$icon+"'></i>"
  }, {
    style: 'metro',
    className: $style,
    globalPosition:$position,
    showAnimation: "show",
    showDuration: 0,
    hideDuration: 0,
    autoHideDelay: 8000,
    autoHide: true,
    clickToHide: true
  });
}

$.showConfirm = function($text, $link, $link__class, $style){
  $style || ( $style = 'warning' );

  if($style == "error"){
    $icon = "fa fa-exclamation";
  }else if($style == "warning"){
    $icon = "fa fa-warning";
  }else if($style == "success"){
    $icon = "fa fa-check";
  }else if($style == "info"){
    $icon = "fa fa-question";
  }else{
    $icon = "fa fa-circle-o";
  }

  $.notify({
    title: 'Esta seguro?',
    text: $text+'<div class="clearfix"></div><br><a href="'+$link+'" class="btn btn-sm btn-primary notify__hidden '+$link__class+'">Si</a> <a class="btn btn-sm btn-danger notify__hidden">No</a>',
    image: "<i class='"+$icon+"'></i>"
  }, {
    style: 'metro',
    className: $style,
    showAnimation: "show",
    showDuration: 0,
    hideDuration: 0,
    autoHideDelay: 15000,
    autoHide: true,
    clickToHide: false
  });
}


$.showLoading = function($text){
    $('body').css('overflow','hidden');
    $('.popup__loading').addClass('active');
    $.showNotify('Estado', $text, 'info');
}
$.hiddenLoading = function(){
  $('body').css('overflow','auto');
  $('.popup__loading').removeClass('active');
}
