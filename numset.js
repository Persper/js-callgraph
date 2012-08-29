/**
 * Implementation of sets of numbers as sorted lists. Singleton sets
 * are represented as single numbers, the empty set as undefined.
 */

if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
   /**
   * Add number x to set a, and return the possibly modified a.
   */
  function add(a, x) {
    if(typeof a === 'undefined')
      return x;
    
    if(typeof a === 'number') {
      if(a < x)
      	return [a, x];
      if(a > x)
      	return [x, a];
      return a;
    }

    var lo = 0, hi = a.length-1, mid, elt;
    while(lo <= hi) {
      mid = (lo+hi) >> 1;
      elt = a[mid];
      if(elt < x) {
        lo = mid+1;
      } else if(elt > x) {
        hi = mid-1;
      } else {
        return a;
      }
    }
    a.splice(lo, 0, x);
    return a;
  }

  /**
   * Add all elements in set b to set a, returning the resulting set.
   * While set a may be modified, set b never is.
   */
  function addAll(a, b) {
  	if(typeof a === 'undefined')
  		return b;

    if(typeof a === 'number' && typeof b === 'object')
    	return add(b.slice(0), a);

    // 'a' must be an array; check 'b'
    var l1 = a.length;
    if(l1 === 0)
      return b;

    if(typeof b === 'number') {
      return add(a, b);
    } else {
      var l2 = b.length;
      if(l2 === 0)
        return a;

      var res = new Array(l1+l2);
      var i = 0, j = 0, k = 0;
      while(i < l1 || j < l2) {
        while(i < l1 && (j >= l2 || a[i] <= b[j]))
          res[k++] = a[i++];
        while(k > 0 && j < l2 && b[j] === res[k-1])
          ++j;
        while(j < l2 && (i >= l1 || b[j] < a[i]))
          res[k++] = b[j++];
      }
      res.length = k;
      return res;
    }
  }

  function iter(a, cb) {
  	if(a) {
  		if(typeof a === 'number')
  			cb(a);
  		else
  			a.forEach(cb);
  	}
  }

  function map(a, f) {
  	if(a) {
  		if(typeof a === 'number')
  			return [f(a)];
  		else
  			return a.map(f);
  	} else {
  		return [];
  	}
  }

  function some(a, f) {
  	var r = false;
  	if(a) {
  		if(typeof a === 'number')
  			return f(a);
  		else
  			for(var i=0,l=a.length;i<l;++i) {
  				r = f(a);
  				if(r)
  					return r;
  			}
  	}
  	return r;
  }

  function all(a, f) {
  	var r = true;
  	if(a) {
  		if(typeof a === 'number')
  			return f(a);
  		else
  			for(var i=0,l=a.length;i<l;++i) {
  				r = f(a);
  				if(!r)
  					return r;
  			}
  	}
  	return r;
  }

  exports.add = add;
  exports.addAll = addAll;
  exports.iter = iter;
  exports.map = map;
  exports.some = some;
  exports.all = all;
  return exports;
});