(function() {
 function jQuery(n) {
  var res = Object.create(jQuery.fn);
  var elts = document.getElementsByTagName(n);
  for(var i=0;i<elts.length;++i)
   res[i] = elts[i];
  res.length = elts.length;
  return res;
 }

 jQuery.fn = {
  extend: function ext(obj) {
   for(var p in obj)
    jQuery.fn[p] = obj[p];
  }
 };

 jQuery.fn.extend({
  each: function(cb) {
   for(var i=0;i<this.length;++i)
    cb(this[i], i);
  }
 });

 window.jQuery = jQuery;
})();
(function($) {
  $.fn.highlightAlt = function(c) {
    this.each(function(elt) {
      for(var i=1;i<elt.children.length;i+=2)
        elt.children[i].style.backgroundColor = c;
    });
  };

  window.highlightAltRows = function() {
    $('tbody').highlightAlt('#A9D0F5');
  };
})(jQuery);
