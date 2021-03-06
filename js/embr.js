/*
     Set links for posts on index pages (if div clicked follow the link)
*/
function linker(){
  $(".index").click(function(){
	//Cache the url, slide up the top bar
	var url=$(this).find('h2 a').attr('href');
	if( typeof url != "undefined"){
	    window.location = url
    }else{
	  url=$(this).find('a').attr('href');
      window.location = url
    }
  });
}

/*
	Standard document ready
	Hides pagination if js enabled
*/
var base_url;
$(document).ready(function(){
	
  //Hide pagination controls
  $(".next").hide(); $(".prev").hide();
  //Set the index page linker
  linker();
  //Reblog code
  if (window.localStorage) 
    if (localStorage.getItem('embr_blog')) 
	  $('body').find('.reblog').css({'visibility' : 'visible'});
  //Focus on the title of any form
  $(".form_title").focus();
  //Sets the base url
  base_url = $("div.header h1 a").attr('href');

  //Displays the admin buttons if logged in
  l = base_url+"tools/logged_in";
  $.getJSON(l,function(json){
	if(json.logged_in){
	  $(".toolbox").show();
      $(".lg").text("Logout");
	  $(".lg").attr("href",base_url+"logout");
	  //Used to set the users reblog URL
	  if (window.localStorage)
	    localStorage.setItem("embr_blog", base_url);
	}else{	  
	  $(".reblog").show();
	}
  });
});

$('.embr').hover(
    function() { $(this).animate({opacity: 1.0}, 500 ); },
    function() { $(this).animate({opacity: 0.2}, 500 ); }
);

$(".reblog").click(function(){
  alert("Coming Soon...");
  //if( window.localStorage && localStorage.getItem('embr_blog') ){
  //  window.location = localStorage.getItem('embr_blog')+"/admin/reblog/"+$(this).find(".hidden_url").text();	
  //}
});

$(".cover").click(function(){
  $('body').find('.cover').css({'visibility' : 'hidden'});
});

$(".legend").click(function(){
  $('body').find('.cover').css({'visibility' : 'visible'});
  return false;
});

$(".delete").click(function(){
  var answer = confirm("Are you sure you want to delete this post?")
  return answer ? true : false;
});

var state2 = 0;
$(".extra").click(function(){
	console.log(state2);
  if( state2 ){
    $('body').find('.extra_options_pane').fadeOut('fast');
    state2 = 0;
    $(this).text("More Options");
  } else {
    $('body').find('.extra_options_pane').fadeIn('fast');
    state2 = 1;
    $(this).text("Less Options");
  }	
  return false;
});

var state = 1;
$(".aip").click(function(){
  if( state ){
    $('body').find('.text_area_wrapper').fadeOut('fast', function() {
      $(".aip").text("Switch to Text Post");
      $('body').find('.post_image_box').fadeIn();
      $('body').find('.post_label').text("Image Post URL");
      state=state?0:1;
    });
  }else{
	$('body').find('.post_image_box').fadeOut('fast', function() {
      $(".aip").text("Switch to Image Post");
      $('body').find('.text_area_wrapper').fadeIn();
      $('body').find('.post_label').text("Text Post");
      state=state?0:1;
    });
  }
  return false;
});


/*
	Keyboard Navigation (j forward, k backwards)
*/
var index = -1;	//Stores an index of the currently selected blog post
var stop = false; //Indicates if the navigation should still add extra window space
var last; //The last div class name, used when appending a drop shadow
$(window).keypress(function(e){
  //Handle the next operation
  if( String.fromCharCode(e.which)=='j' ){
    if( index < $('.posts').find('.post').length-1 ){
      if(last!=null)
        //Remove the last selected style
        $('.posts').find('.post').get(index).className = last;
		//Increment the index
		index++;
		//Cache the element
        var t = $('.posts').find('.post').get(index);
        //Set the currently selected elements style
        last = t.className; t.className+=" selected";
        //If we reach the end of the posts, start adding extra height to the spacer
        if( endreached&&!stop )
          $('.key_spacer').height( $('.key_spacer').height() + t.clientHeight + 20 );
        //Scroll down to the next blog post
        $(window).scrollTop( t.offsetTop-20 );
      }else if(!stop)
        stop = true;			
	}	
	//Handle the previous operation
	else if( String.fromCharCode(e.which)=='k' ){
	  if( index >=1 ){
	    //Remove the last selected style
	    $('.posts').find('.post').get(index).className = last;
		index--;
        //Cache the element
        var t = $('.posts').find('.post').get(index);		
		//Set the currently selected elements style
		last = t.className; t.className+=" selected";
		//Scroll up to the next blog post
		$(window).scrollTop( t.offsetTop-20 );
	  }else{
		//Handles case to display header
		if( typeof last != "undefined")
          $('.posts').find('.post').get(index).className = last;
	 	$(window).scrollTop( 0 );
		index=-1;
	  }
	}
});

/*
	AJAX login and Admin panel
*/
var lg; //Used as hide / show switch
var d =false; //Used as a caching switch
$(".lg").click(function(){
	
  //If cached, toggle the hide and show operations
  if( d ){
    if( !lg ){
      $(this).text("Hide ");
      $('.header').find('.post').show();
      lg= true;
    }else{

      $(this).text("Admin ");
      $('.header').find('.post').hide();
      lg = false;
    }
  }else{
    //If not cached, grab the admin panel
    if( !lg ){
	  if( $(this).text()=="Logout" )
	    window.location = $(this).attr('href');
	  else{
  	    //Incase of slow connections show the loading icon
        $('.header').append("<div class=\"loading\"><img src=\"img/load.gif\"/></div>");	
        //Grab the admin link
	    var l = $(this).attr('href')+"/index/min";
        //Set the admin button text to hide
        $(this).text(" Hide ");
        //Grab the admin panel and append to the header div
        $.get(l,function(data){
          var d=$(data);
          var items=d.find('.post');
          $('.loading').remove();
          $('.header').append( items );
        });
	    //Set the cached & showing variables as true
	    lg = true;
	    d = true;
	  }
	}
  } return false;	
});
    
/*
	Endless scoll
*/
var loading = false; //If the page if loading
var endreached = false; //If we have reached the end
$(window).scroll(function(){
  //Cancel if we have reached the end or are currently loading
  if(loading || endreached) return;
  //Check if user has scrolled to a point + buffer
  if($(document).height()-$(window).height()<=$(window).scrollTop()+500){
    if(!loading){
      loading = true;
      //First extract the next page to load
      var t=$("div.next a").attr('href');
      if( t==null ){
        endreached = true;
      }else{
        $('.posts').append("<div class=\"loading\"><h2><img src=\"img/load.gif\"/><br/>Loading</h2></div>");
        //Remove the old pagination links
        $(".next").remove();
        $(".prev").remove();
        //Get the next set of posts
        $.get(t,function(data){
          var d=$(data);
          var items=d.find('.post');
          $('.loading').remove();
          //Add the next posts
          $('.posts').append(items);
          var v=d.find('.next');
          $('.posts').append(v);
          //See if there are any more pages
          if(v.length==0){
            endreached=true;
            $('.posts').append("<div class=\"loading\"><h2>You've reached the end!</h2></div>"); 
          }
          //Refresh linker
		  linker();
		  //Finish loading
          loading = false;
        });
      }
    }
  }
});