var makers = document.getElementById("formmaker");
    for (var i = 0; i < makers.options.length; i++) {
        if (makers.options[i].value === "<%=pen.maker%>") {
            makers.options[i].setAttribute("selected", "selected");
        }
    }
    var types = document.getElementById("itemtype");
    for (var i = 0; i < types.options.length; i++) {
        if (types.options[i].value === "<%=pen.type%>") {
            types.options[i].setAttribute("selected", "selected");
        }
    }
    
    // image gallery
    // init the state from the input
    
    $(".image-checkbox").each(function (index, value) {
      if ($(this).find('input[type="checkbox"]').first().attr("checked")) {
        $(this).addClass('image-checkbox-checked');
      }
      else {
        $(this).removeClass('image-checkbox-checked');
        }
    });
    
    // sync the state to the input
    $(".image-checkbox").on("click", function (e) {
      $(this).toggleClass('image-checkbox-checked');
      
      var $checkbox = $(this).find('input[type="checkbox"]');
      $checkbox.prop("checked",!$checkbox.prop("checked"));
        
      e.preventDefault();
      var imagechangesform = document.getElementById("imagechanges");
      imagechangesform.value = Array(changedImages());
    });
    
    function changedImages() {
        var imagesarray = $('.image-checkbox');
        var imagechanges = [];
        $.each(imagesarray, function(index, value) {
	        if ($(this).hasClass("image-checkbox-checked")) {
		    imagechanges.push(index); 
	    }});
		return imagechanges;
}