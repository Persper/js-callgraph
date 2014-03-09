





if (typeof PDFJS === 'undefined') {
  (typeof window !== 'undefined' ? window : this).PDFJS = {};
}

PDFJS.version = '0.8.2';
PDFJS.build = 'fatal: Not a git repository (or any parent up to mount point /home/sander)Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).';

(function pdfjsWrapper() {
  
  'use strict';






'use strict';

var globalScope = (typeof window === 'undefined') ? this : window;

var isWorker = (typeof window == 'undefined');

var FONT_IDENTITY_MATRIX = [0.001, 0, 0, 0.001, 0, 0];

var TextRenderingMode = {
  FILL: 0,
  STROKE: 1,
  FILL_STROKE: 2,
  INVISIBLE: 3,
  FILL_ADD_TO_PATH: 4,
  STROKE_ADD_TO_PATH: 5,
  FILL_STROKE_ADD_TO_PATH: 6,
  ADD_TO_PATH: 7,
  FILL_STROKE_MASK: 3,
  ADD_TO_PATH_FLAG: 4
};

var ImageKind = {
  GRAYSCALE_1BPP: 1,
  RGB_24BPP: 2,
  RGBA_32BPP: 3
};




if (!globalScope.PDFJS) {
  globalScope.PDFJS = {};
}

globalScope.PDFJS.pdfBug = false;

PDFJS.VERBOSITY_LEVELS = {
  errors: 0,
  warnings: 1,
  infos: 5
};


var OPS = PDFJS.OPS = {
  
  
  dependency: 1,
  setLineWidth: 2,
  setLineCap: 3,
  setLineJoin: 4,
  setMiterLimit: 5,
  setDash: 6,
  setRenderingIntent: 7,
  setFlatness: 8,
  setGState: 9,
  save: 10,
  restore: 11,
  transform: 12,
  moveTo: 13,
  lineTo: 14,
  curveTo: 15,
  curveTo2: 16,
  curveTo3: 17,
  closePath: 18,
  rectangle: 19,
  stroke: 20,
  closeStroke: 21,
  fill: 22,
  eoFill: 23,
  fillStroke: 24,
  eoFillStroke: 25,
  closeFillStroke: 26,
  closeEOFillStroke: 27,
  endPath: 28,
  clip: 29,
  eoClip: 30,
  beginText: 31,
  endText: 32,
  setCharSpacing: 33,
  setWordSpacing: 34,
  setHScale: 35,
  setLeading: 36,
  setFont: 37,
  setTextRenderingMode: 38,
  setTextRise: 39,
  moveText: 40,
  setLeadingMoveText: 41,
  setTextMatrix: 42,
  nextLine: 43,
  showText: 44,
  showSpacedText: 45,
  nextLineShowText: 46,
  nextLineSetSpacingShowText: 47,
  setCharWidth: 48,
  setCharWidthAndBounds: 49,
  setStrokeColorSpace: 50,
  setFillColorSpace: 51,
  setStrokeColor: 52,
  setStrokeColorN: 53,
  setFillColor: 54,
  setFillColorN: 55,
  setStrokeGray: 56,
  setFillGray: 57,
  setStrokeRGBColor: 58,
  setFillRGBColor: 59,
  setStrokeCMYKColor: 60,
  setFillCMYKColor: 61,
  shadingFill: 62,
  beginInlineImage: 63,
  beginImageData: 64,
  endInlineImage: 65,
  paintXObject: 66,
  markPoint: 67,
  markPointProps: 68,
  beginMarkedContent: 69,
  beginMarkedContentProps: 70,
  endMarkedContent: 71,
  beginCompat: 72,
  endCompat: 73,
  paintFormXObjectBegin: 74,
  paintFormXObjectEnd: 75,
  beginGroup: 76,
  endGroup: 77,
  beginAnnotations: 78,
  endAnnotations: 79,
  beginAnnotation: 80,
  endAnnotation: 81,
  paintJpegXObject: 82,
  paintImageMaskXObject: 83,
  paintImageMaskXObjectGroup: 84,
  paintImageXObject: 85,
  paintInlineImageXObject: 86,
  paintInlineImageXObjectGroup: 87
};




function info(msg) {
  if (PDFJS.verbosity >= PDFJS.VERBOSITY_LEVELS.infos) {
    console.log('Info: ' + msg);
  }
}


function warn(msg) {
  if (PDFJS.verbosity >= PDFJS.VERBOSITY_LEVELS.warnings) {
    console.log('Warning: ' + msg);
  }
}



function error(msg) {
  
  if (arguments.length > 1) {
    var logArguments = ['Error:'];
    logArguments.push.apply(logArguments, arguments);
    console.log.apply(console, logArguments);
    
    msg = [].join.call(arguments, ' ');
  } else {
    console.log('Error: ' + msg);
  }
  console.log(backtrace());
  UnsupportedManager.notify(UNSUPPORTED_FEATURES.unknown);
  throw new Error(msg);
}

function backtrace() {
  try {
    throw new Error();
  } catch (e) {
    return e.stack ? e.stack.split('\n').slice(2).join('\n') : '';
  }
}

function assert(cond, msg) {
  if (!cond) {
    error(msg);
  }
}

var UNSUPPORTED_FEATURES = PDFJS.UNSUPPORTED_FEATURES = {
  unknown: 'unknown',
  forms: 'forms',
  javaScript: 'javaScript',
  smask: 'smask',
  shadingPattern: 'shadingPattern',
  font: 'font'
};

var UnsupportedManager = PDFJS.UnsupportedManager =
  (function UnsupportedManagerClosure() {
  var listeners = [];
  return {
    listen: function (cb) {
      listeners.push(cb);
    },
    notify: function (featureId) {
      warn('Unsupported feature "' + featureId + '"');
      for (var i = 0, ii = listeners.length; i < ii; i++) {
        listeners[i](featureId);
      }
    }
  };
})();



function combineUrl(baseUrl, url) {
  if (!url) {
    return baseUrl;
  }
  if (/^[a-z][a-z0-9+\-.]*:/i.test(url)) {
    return url;
  }
  if (url.charAt(0) == '/') {
    
    var i = baseUrl.indexOf('://');
    if (url.charAt(1) === '/') {
      ++i;
    } else {
      i = baseUrl.indexOf('/', i + 3);
    }
    return baseUrl.substring(0, i) + url;
  } else {
    
    var pathLength = baseUrl.length, i;
    i = baseUrl.lastIndexOf('#');
    pathLength = i >= 0 ? i : pathLength;
    i = baseUrl.lastIndexOf('?', pathLength);
    pathLength = i >= 0 ? i : pathLength;
    var prefixLength = baseUrl.lastIndexOf('/', pathLength);
    return baseUrl.substring(0, prefixLength + 1) + url;
  }
}


function isValidUrl(url, allowRelative) {
  if (!url) {
    return false;
  }
  
  
  var protocol = /^[a-z][a-z0-9+\-.]*(?=:)/i.exec(url);
  if (!protocol) {
    return allowRelative;
  }
  protocol = protocol[0].toLowerCase();
  switch (protocol) {
    case 'http':
    case 'https':
    case 'ftp':
    case 'mailto':
      return true;
    default:
      return false;
  }
}
PDFJS.isValidUrl = isValidUrl;



function assertWellFormed(cond, msg) {
  if (!cond) {
    error(msg);
  }
}

function shadow(obj, prop, value) {
  Object.defineProperty(obj, prop, { value: value,
                                     enumerable: true,
                                     configurable: true,
                                     writable: false });
  return value;
}

var PasswordResponses = PDFJS.PasswordResponses = {
  NEED_PASSWORD: 1,
  INCORRECT_PASSWORD: 2
};

var PasswordException = (function PasswordExceptionClosure() {
  function PasswordException(msg, code) {
    this.name = 'PasswordException';
    this.message = msg;
    this.code = code;
  }

  PasswordException.prototype = new Error();
  PasswordException.constructor = PasswordException;

  return PasswordException;
})();

var UnknownErrorException = (function UnknownErrorExceptionClosure() {
  function UnknownErrorException(msg, details) {
    this.name = 'UnknownErrorException';
    this.message = msg;
    this.details = details;
  }

  UnknownErrorException.prototype = new Error();
  UnknownErrorException.constructor = UnknownErrorException;

  return UnknownErrorException;
})();

var InvalidPDFException = (function InvalidPDFExceptionClosure() {
  function InvalidPDFException(msg) {
    this.name = 'InvalidPDFException';
    this.message = msg;
  }

  InvalidPDFException.prototype = new Error();
  InvalidPDFException.constructor = InvalidPDFException;

  return InvalidPDFException;
})();

var MissingPDFException = (function MissingPDFExceptionClosure() {
  function MissingPDFException(msg) {
    this.name = 'MissingPDFException';
    this.message = msg;
  }

  MissingPDFException.prototype = new Error();
  MissingPDFException.constructor = MissingPDFException;

  return MissingPDFException;
})();

var NotImplementedException = (function NotImplementedExceptionClosure() {
  function NotImplementedException(msg) {
    this.message = msg;
  }

  NotImplementedException.prototype = new Error();
  NotImplementedException.prototype.name = 'NotImplementedException';
  NotImplementedException.constructor = NotImplementedException;

  return NotImplementedException;
})();

var MissingDataException = (function MissingDataExceptionClosure() {
  function MissingDataException(begin, end) {
    this.begin = begin;
    this.end = end;
    this.message = 'Missing data [' + begin + ', ' + end + ')';
  }

  MissingDataException.prototype = new Error();
  MissingDataException.prototype.name = 'MissingDataException';
  MissingDataException.constructor = MissingDataException;

  return MissingDataException;
})();

var XRefParseException = (function XRefParseExceptionClosure() {
  function XRefParseException(msg) {
    this.message = msg;
  }

  XRefParseException.prototype = new Error();
  XRefParseException.prototype.name = 'XRefParseException';
  XRefParseException.constructor = XRefParseException;

  return XRefParseException;
})();


function bytesToString(bytes) {
  var strBuf = [];
  var length = bytes.length;
  for (var n = 0; n < length; ++n) {
    strBuf.push(String.fromCharCode(bytes[n]));
  }
  return strBuf.join('');
}

function stringToBytes(str) {
  var length = str.length;
  var bytes = new Uint8Array(length);
  for (var n = 0; n < length; ++n) {
    bytes[n] = str.charCodeAt(n) & 0xFF;
  }
  return bytes;
}

var IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0];

var Util = PDFJS.Util = (function UtilClosure() {
  function Util() {}

  Util.makeCssRgb = function Util_makeCssRgb(rgb) {
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
  };

  Util.makeCssCmyk = function Util_makeCssCmyk(cmyk) {
    var rgb = ColorSpace.singletons.cmyk.getRgb(cmyk, 0);
    return Util.makeCssRgb(rgb);
  };

  
  Util.transform = function Util_transform(m1, m2) {
    return [
      m1[0] * m2[0] + m1[2] * m2[1],
      m1[1] * m2[0] + m1[3] * m2[1],
      m1[0] * m2[2] + m1[2] * m2[3],
      m1[1] * m2[2] + m1[3] * m2[3],
      m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
      m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
    ];
  };

  
  Util.applyTransform = function Util_applyTransform(p, m) {
    var xt = p[0] * m[0] + p[1] * m[2] + m[4];
    var yt = p[0] * m[1] + p[1] * m[3] + m[5];
    return [xt, yt];
  };

  Util.applyInverseTransform = function Util_applyInverseTransform(p, m) {
    var d = m[0] * m[3] - m[1] * m[2];
    var xt = (p[0] * m[3] - p[1] * m[2] + m[2] * m[5] - m[4] * m[3]) / d;
    var yt = (-p[0] * m[1] + p[1] * m[0] + m[4] * m[1] - m[5] * m[0]) / d;
    return [xt, yt];
  };

  
  
  Util.getAxialAlignedBoundingBox =
    function Util_getAxialAlignedBoundingBox(r, m) {

    var p1 = Util.applyTransform(r, m);
    var p2 = Util.applyTransform(r.slice(2, 4), m);
    var p3 = Util.applyTransform([r[0], r[3]], m);
    var p4 = Util.applyTransform([r[2], r[1]], m);
    return [
      Math.min(p1[0], p2[0], p3[0], p4[0]),
      Math.min(p1[1], p2[1], p3[1], p4[1]),
      Math.max(p1[0], p2[0], p3[0], p4[0]),
      Math.max(p1[1], p2[1], p3[1], p4[1])
    ];
  };

  Util.inverseTransform = function Util_inverseTransform(m) {
    var d = m[0] * m[3] - m[1] * m[2];
    return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d,
      (m[2] * m[5] - m[4] * m[3]) / d, (m[4] * m[1] - m[5] * m[0]) / d];
  };

  
  
  
  
  
  
  Util.apply3dTransform = function Util_apply3dTransform(m, v) {
    return [
      m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
      m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
      m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
    ];
  };

  
  
  
  Util.singularValueDecompose2dScale =
    function Util_singularValueDecompose2dScale(m) {

    var transpose = [m[0], m[2], m[1], m[3]];

    
    var a = m[0] * transpose[0] + m[1] * transpose[2];
    var b = m[0] * transpose[1] + m[1] * transpose[3];
    var c = m[2] * transpose[0] + m[3] * transpose[2];
    var d = m[2] * transpose[1] + m[3] * transpose[3];

    
    var first = (a + d) / 2;
    var second = Math.sqrt((a + d) * (a + d) - 4 * (a * d - c * b)) / 2;
    var sx = first + second || 1;
    var sy = first - second || 1;

    
    return [Math.sqrt(sx), Math.sqrt(sy)];
  };

  
  
  
  
  Util.normalizeRect = function Util_normalizeRect(rect) {
    var r = rect.slice(0); 
    if (rect[0] > rect[2]) {
      r[0] = rect[2];
      r[2] = rect[0];
    }
    if (rect[1] > rect[3]) {
      r[1] = rect[3];
      r[3] = rect[1];
    }
    return r;
  };

  
  
  
  Util.intersect = function Util_intersect(rect1, rect2) {
    function compare(a, b) {
      return a - b;
    }

    
    var orderedX = [rect1[0], rect1[2], rect2[0], rect2[2]].sort(compare),
        orderedY = [rect1[1], rect1[3], rect2[1], rect2[3]].sort(compare),
        result = [];

    rect1 = Util.normalizeRect(rect1);
    rect2 = Util.normalizeRect(rect2);

    
    if ((orderedX[0] === rect1[0] && orderedX[1] === rect2[0]) ||
        (orderedX[0] === rect2[0] && orderedX[1] === rect1[0])) {
      
      result[0] = orderedX[1];
      result[2] = orderedX[2];
    } else {
      return false;
    }

    
    if ((orderedY[0] === rect1[1] && orderedY[1] === rect2[1]) ||
        (orderedY[0] === rect2[1] && orderedY[1] === rect1[1])) {
      
      result[1] = orderedY[1];
      result[3] = orderedY[2];
    } else {
      return false;
    }

    return result;
  };

  Util.sign = function Util_sign(num) {
    return num < 0 ? -1 : 1;
  };

  
  Util.concatenateToArray = function concatenateToArray(arr1, arr2) {
    Array.prototype.push.apply(arr1, arr2);
  };

  Util.prependToArray = function concatenateToArray(arr1, arr2) {
    Array.prototype.unshift.apply(arr1, arr2);
  };

  Util.extendObj = function extendObj(obj1, obj2) {
    for (var key in obj2) {
      obj1[key] = obj2[key];
    }
  };

  Util.getInheritableProperty = function Util_getInheritableProperty(dict,
                                                                     name) {
    while (dict && !dict.has(name)) {
      dict = dict.get('Parent');
    }
    if (!dict) {
      return null;
    }
    return dict.get(name);
  };

  Util.inherit = function Util_inherit(sub, base, prototype) {
    sub.prototype = Object.create(base.prototype);
    sub.prototype.constructor = sub;
    for (var prop in prototype) {
      sub.prototype[prop] = prototype[prop];
    }
  };

  Util.loadScript = function Util_loadScript(src, callback) {
    var script = document.createElement('script');
    var loaded = false;
    script.setAttribute('src', src);
    if (callback) {
      script.onload = function() {
        if (!loaded) {
          callback();
        }
        loaded = true;
      };
    }
    document.getElementsByTagName('head')[0].appendChild(script);
  };

  return Util;
})();

var PageViewport = PDFJS.PageViewport = (function PageViewportClosure() {
  function PageViewport(viewBox, scale, rotation, offsetX, offsetY, dontFlip) {
    this.viewBox = viewBox;
    this.scale = scale;
    this.rotation = rotation;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    
    
    var centerX = (viewBox[2] + viewBox[0]) / 2;
    var centerY = (viewBox[3] + viewBox[1]) / 2;
    var rotateA, rotateB, rotateC, rotateD;
    rotation = rotation % 360;
    rotation = rotation < 0 ? rotation + 360 : rotation;
    switch (rotation) {
      case 180:
        rotateA = -1; rotateB = 0; rotateC = 0; rotateD = 1;
        break;
      case 90:
        rotateA = 0; rotateB = 1; rotateC = 1; rotateD = 0;
        break;
      case 270:
        rotateA = 0; rotateB = -1; rotateC = -1; rotateD = 0;
        break;
      
      default:
        rotateA = 1; rotateB = 0; rotateC = 0; rotateD = -1;
        break;
    }

    if (dontFlip) {
      rotateC = -rotateC; rotateD = -rotateD;
    }

    var offsetCanvasX, offsetCanvasY;
    var width, height;
    if (rotateA === 0) {
      offsetCanvasX = Math.abs(centerY - viewBox[1]) * scale + offsetX;
      offsetCanvasY = Math.abs(centerX - viewBox[0]) * scale + offsetY;
      width = Math.abs(viewBox[3] - viewBox[1]) * scale;
      height = Math.abs(viewBox[2] - viewBox[0]) * scale;
    } else {
      offsetCanvasX = Math.abs(centerX - viewBox[0]) * scale + offsetX;
      offsetCanvasY = Math.abs(centerY - viewBox[1]) * scale + offsetY;
      width = Math.abs(viewBox[2] - viewBox[0]) * scale;
      height = Math.abs(viewBox[3] - viewBox[1]) * scale;
    }
    
    
    
    this.transform = [
      rotateA * scale,
      rotateB * scale,
      rotateC * scale,
      rotateD * scale,
      offsetCanvasX - rotateA * scale * centerX - rotateC * scale * centerY,
      offsetCanvasY - rotateB * scale * centerX - rotateD * scale * centerY
    ];

    this.width = width;
    this.height = height;
    this.fontScale = scale;
  }
  PageViewport.prototype = {
    clone: function PageViewPort_clone(args) {
      args = args || {};
      var scale = 'scale' in args ? args.scale : this.scale;
      var rotation = 'rotation' in args ? args.rotation : this.rotation;
      return new PageViewport(this.viewBox.slice(), scale, rotation,
                              this.offsetX, this.offsetY, args.dontFlip);
    },
    convertToViewportPoint: function PageViewport_convertToViewportPoint(x, y) {
      return Util.applyTransform([x, y], this.transform);
    },
    convertToViewportRectangle:
      function PageViewport_convertToViewportRectangle(rect) {
      var tl = Util.applyTransform([rect[0], rect[1]], this.transform);
      var br = Util.applyTransform([rect[2], rect[3]], this.transform);
      return [tl[0], tl[1], br[0], br[1]];
    },
    convertToPdfPoint: function PageViewport_convertToPdfPoint(x, y) {
      return Util.applyInverseTransform([x, y], this.transform);
    }
  };
  return PageViewport;
})();

var PDFStringTranslateTable = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0x2D8, 0x2C7, 0x2C6, 0x2D9, 0x2DD, 0x2DB, 0x2DA, 0x2DC, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x2022, 0x2020, 0x2021, 0x2026, 0x2014,
  0x2013, 0x192, 0x2044, 0x2039, 0x203A, 0x2212, 0x2030, 0x201E, 0x201C,
  0x201D, 0x2018, 0x2019, 0x201A, 0x2122, 0xFB01, 0xFB02, 0x141, 0x152, 0x160,
  0x178, 0x17D, 0x131, 0x142, 0x153, 0x161, 0x17E, 0, 0x20AC
];

function stringToPDFString(str) {
  var i, n = str.length, strBuf = [];
  if (str[0] === '\xFE' && str[1] === '\xFF') {
    
    for (i = 2; i < n; i += 2) {
      strBuf.push(String.fromCharCode(
        (str.charCodeAt(i) << 8) | str.charCodeAt(i + 1)));
    }
  } else {
    for (i = 0; i < n; ++i) {
      var code = PDFStringTranslateTable[str.charCodeAt(i)];
      strBuf.push(code ? String.fromCharCode(code) : str.charAt(i));
    }
  }
  return strBuf.join('');
}

function stringToUTF8String(str) {
  return decodeURIComponent(escape(str));
}

function isEmptyObj(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
}

function isBool(v) {
  return typeof v == 'boolean';
}

function isInt(v) {
  return typeof v == 'number' && ((v | 0) == v);
}

function isNum(v) {
  return typeof v == 'number';
}

function isString(v) {
  return typeof v == 'string';
}

function isNull(v) {
  return v === null;
}

function isName(v) {
  return v instanceof Name;
}

function isCmd(v, cmd) {
  return v instanceof Cmd && (!cmd || v.cmd == cmd);
}

function isDict(v, type) {
  if (!(v instanceof Dict)) {
    return false;
  }
  if (!type) {
    return true;
  }
  var dictType = v.get('Type');
  return isName(dictType) && dictType.name == type;
}

function isArray(v) {
  return v instanceof Array;
}

function isStream(v) {
  return typeof v == 'object' && v !== null && v !== undefined &&
         ('getBytes' in v);
}

function isArrayBuffer(v) {
  return typeof v == 'object' && v !== null && v !== undefined &&
         ('byteLength' in v);
}

function isRef(v) {
  return v instanceof Ref;
}

function isPDFFunction(v) {
  var fnDict;
  if (typeof v != 'object') {
    return false;
  } else if (isDict(v)) {
    fnDict = v;
  } else if (isStream(v)) {
    fnDict = v.dict;
  } else {
    return false;
  }
  return fnDict.has('FunctionType');
}


var LegacyPromise = PDFJS.LegacyPromise = (function LegacyPromiseClosure() {
  return function LegacyPromise() {
    var resolve, reject;
    var promise = new Promise(function (resolve_, reject_) {
      resolve = resolve_;
      reject = reject_;
    });
    promise.resolve = resolve;
    promise.reject = reject;
    return promise;
  };
})();


(function PromiseClosure() {
  if (globalScope.Promise) {
    
    if (typeof globalScope.Promise.all !== 'function') {
      globalScope.Promise.all = function (iterable) {
        var count = 0, results = [], resolve, reject;
        var promise = new globalScope.Promise(function (resolve_, reject_) {
          resolve = resolve_;
          reject = reject_;
        });
        iterable.forEach(function (p, i) {
          count++;
          p.then(function (result) {
            results[i] = result;
            count--;
            if (count === 0) {
              resolve(results);
            }
          }, reject);
        });
        if (count === 0) {
          resolve(results);
        }
        return promise;
      };
    }
    if (typeof globalScope.Promise.resolve !== 'function') {
      globalScope.Promise.resolve = function (x) {
        return new globalScope.Promise(function (resolve) { resolve(x); });
      };
    }
    return;
  }

  var STATUS_PENDING = 0;
  var STATUS_RESOLVED = 1;
  var STATUS_REJECTED = 2;

  
  
  
  var REJECTION_TIMEOUT = 500;

  var HandlerManager = {
    handlers: [],
    running: false,
    unhandledRejections: [],
    pendingRejectionCheck: false,

    scheduleHandlers: function scheduleHandlers(promise) {
      if (promise._status == STATUS_PENDING) {
        return;
      }

      this.handlers = this.handlers.concat(promise._handlers);
      promise._handlers = [];

      if (this.running) {
        return;
      }
      this.running = true;

      setTimeout(this.runHandlers.bind(this), 0);
    },

    runHandlers: function runHandlers() {
      var RUN_TIMEOUT = 1; 
      var timeoutAt = Date.now() + RUN_TIMEOUT;
      while (this.handlers.length > 0) {
        var handler = this.handlers.shift();

        var nextStatus = handler.thisPromise._status;
        var nextValue = handler.thisPromise._value;

        try {
          if (nextStatus === STATUS_RESOLVED) {
            if (typeof(handler.onResolve) == 'function') {
              nextValue = handler.onResolve(nextValue);
            }
          } else if (typeof(handler.onReject) === 'function') {
              nextValue = handler.onReject(nextValue);
              nextStatus = STATUS_RESOLVED;

              if (handler.thisPromise._unhandledRejection) {
                this.removeUnhandeledRejection(handler.thisPromise);
              }
          }
        } catch (ex) {
          nextStatus = STATUS_REJECTED;
          nextValue = ex;
        }

        handler.nextPromise._updateStatus(nextStatus, nextValue);
        if (Date.now() >= timeoutAt) {
          break;
        }
      }

      if (this.handlers.length > 0) {
        setTimeout(this.runHandlers.bind(this), 0);
        return;
      }

      this.running = false;
    },

    addUnhandledRejection: function addUnhandledRejection(promise) {
      this.unhandledRejections.push({
        promise: promise,
        time: Date.now()
      });
      this.scheduleRejectionCheck();
    },

    removeUnhandeledRejection: function removeUnhandeledRejection(promise) {
      promise._unhandledRejection = false;
      for (var i = 0; i < this.unhandledRejections.length; i++) {
        if (this.unhandledRejections[i].promise === promise) {
          this.unhandledRejections.splice(i);
          i--;
        }
      }
    },

    scheduleRejectionCheck: function scheduleRejectionCheck() {
      if (this.pendingRejectionCheck) {
        return;
      }
      this.pendingRejectionCheck = true;
      setTimeout(function rejectionCheck() {
        this.pendingRejectionCheck = false;
        var now = Date.now();
        for (var i = 0; i < this.unhandledRejections.length; i++) {
          if (now - this.unhandledRejections[i].time > REJECTION_TIMEOUT) {
            var unhandled = this.unhandledRejections[i].promise._value;
            var msg = 'Unhandled rejection: ' + unhandled;
            if (unhandled.stack) {
              msg += '\n' + unhandled.stack;
            }
            warn(msg);
            this.unhandledRejections.splice(i);
            i--;
          }
        }
        if (this.unhandledRejections.length) {
          this.scheduleRejectionCheck();
        }
      }.bind(this), REJECTION_TIMEOUT);
    }
  };

  function Promise(resolver) {
    this._status = STATUS_PENDING;
    this._handlers = [];
    resolver.call(this, this._resolve.bind(this), this._reject.bind(this));
  }
  
  Promise.all = function Promise_all(promises) {
    var resolveAll, rejectAll;
    var deferred = new Promise(function (resolve, reject) {
      resolveAll = resolve;
      rejectAll = reject;
    });
    var unresolved = promises.length;
    var results = [];
    if (unresolved === 0) {
      resolveAll(results);
      return deferred;
    }
    function reject(reason) {
      if (deferred._status === STATUS_REJECTED) {
        return;
      }
      results = [];
      rejectAll(reason);
    }
    for (var i = 0, ii = promises.length; i < ii; ++i) {
      var promise = promises[i];
      var resolve = (function(i) {
        return function(value) {
          if (deferred._status === STATUS_REJECTED) {
            return;
          }
          results[i] = value;
          unresolved--;
          if (unresolved === 0) {
            resolveAll(results);
          }
        };
      })(i);
      if (Promise.isPromise(promise)) {
        promise.then(resolve, reject);
      } else {
        resolve(promise);
      }
    }
    return deferred;
  };

  
  Promise.isPromise = function Promise_isPromise(value) {
    return value && typeof value.then === 'function';
  };
  
  Promise.resolve = function Promise_resolve(x) {
    return new Promise(function (resolve) { resolve(x); });
  };

  Promise.prototype = {
    _status: null,
    _value: null,
    _handlers: null,
    _unhandledRejection: null,

    _updateStatus: function Promise__updateStatus(status, value) {
      if (this._status === STATUS_RESOLVED ||
          this._status === STATUS_REJECTED) {
        return;
      }

      if (status == STATUS_RESOLVED &&
          Promise.isPromise(value)) {
        value.then(this._updateStatus.bind(this, STATUS_RESOLVED),
                   this._updateStatus.bind(this, STATUS_REJECTED));
        return;
      }

      this._status = status;
      this._value = value;

      if (status === STATUS_REJECTED && this._handlers.length === 0) {
        this._unhandledRejection = true;
        HandlerManager.addUnhandledRejection(this);
      }

      HandlerManager.scheduleHandlers(this);
    },

    _resolve: function Promise_resolve(value) {
      this._updateStatus(STATUS_RESOLVED, value);
    },

    _reject: function Promise_reject(reason) {
      this._updateStatus(STATUS_REJECTED, reason);
    },

    then: function Promise_then(onResolve, onReject) {
      var nextPromise = new Promise(function (resolve, reject) {
        this.resolve = reject;
        this.reject = reject;
      });
      this._handlers.push({
        thisPromise: this,
        onResolve: onResolve,
        onReject: onReject,
        nextPromise: nextPromise
      });
      HandlerManager.scheduleHandlers(this);
      return nextPromise;
    }
  };

  globalScope.Promise = Promise;



})();

var StatTimer = (function StatTimerClosure() {
  function rpad(str, pad, length) {
    while (str.length < length) {
      str += pad;
    }
    return str;
  }
  function StatTimer() {
    this.started = {};
    this.times = [];
    this.enabled = true;
  }
  StatTimer.prototype = {
    time: function StatTimer_time(name) {
      if (!this.enabled) {
        return;
      }
      if (name in this.started) {
        warn('Timer is already running for ' + name);
      }
      this.started[name] = Date.now();
    },
    timeEnd: function StatTimer_timeEnd(name) {
      if (!this.enabled) {
        return;
      }
      if (!(name in this.started)) {
        warn('Timer has not been started for ' + name);
      }
      this.times.push({
        'name': name,
        'start': this.started[name],
        'end': Date.now()
      });
      
      delete this.started[name];
    },
    toString: function StatTimer_toString() {
      var times = this.times;
      var out = '';
      
      var longest = 0;
      for (var i = 0, ii = times.length; i < ii; ++i) {
        var name = times[i]['name'];
        if (name.length > longest) {
          longest = name.length;
        }
      }
      for (var i = 0, ii = times.length; i < ii; ++i) {
        var span = times[i];
        var duration = span.end - span.start;
        out += rpad(span['name'], ' ', longest) + ' ' + duration + 'ms\n';
      }
      return out;
    }
  };
  return StatTimer;
})();

PDFJS.createBlob = function createBlob(data, contentType) {
  if (typeof Blob !== 'undefined') {
    return new Blob([data], { type: contentType });
  }
  
  var bb = new MozBlobBuilder();
  bb.append(data);
  return bb.getBlob(contentType);
};

PDFJS.createObjectURL = (function createObjectURLClosure() {
  
  var digits =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  return function createObjectURL(data, contentType) {
    if (!PDFJS.disableCreateObjectURL &&
        typeof URL !== 'undefined' && URL.createObjectURL) {
      var blob = PDFJS.createBlob(data, contentType);
      return URL.createObjectURL(blob);
    }

    var buffer = 'data:' + contentType + ';base64,';
    for (var i = 0, ii = data.length; i < ii; i += 3) {
      var b1 = data[i] & 0xFF;
      var b2 = data[i + 1] & 0xFF;
      var b3 = data[i + 2] & 0xFF;
      var d1 = b1 >> 2, d2 = ((b1 & 3) << 4) | (b2 >> 4);
      var d3 = i + 1 < ii ? ((b2 & 0xF) << 2) | (b3 >> 6) : 64;
      var d4 = i + 2 < ii ? (b3 & 0x3F) : 64;
      buffer += digits[d1] + digits[d2] + digits[d3] + digits[d4];
    }
    return buffer;
  };
})();

function MessageHandler(name, comObj) {
  this.name = name;
  this.comObj = comObj;
  this.callbackIndex = 1;
  this.postMessageTransfers = true;
  var callbacks = this.callbacks = {};
  var ah = this.actionHandler = {};

  ah['console_log'] = [function ahConsoleLog(data) {
    console.log.apply(console, data);
  }];
  ah['console_error'] = [function ahConsoleError(data) {
    console.error.apply(console, data);
  }];
  ah['_unsupported_feature'] = [function ah_unsupportedFeature(data) {
    UnsupportedManager.notify(data);
  }];

  comObj.onmessage = function messageHandlerComObjOnMessage(event) {
    var data = event.data;
    if (data.isReply) {
      var callbackId = data.callbackId;
      if (data.callbackId in callbacks) {
        var callback = callbacks[callbackId];
        delete callbacks[callbackId];
        callback(data.data);
      } else {
        error('Cannot resolve callback ' + callbackId);
      }
    } else if (data.action in ah) {
      var action = ah[data.action];
      if (data.callbackId) {
        var deferred = {};
        var promise = new Promise(function (resolve, reject) {
          deferred.resolve = resolve;
          deferred.reject = reject;
        });
        deferred.promise = promise;
        promise.then(function(resolvedData) {
          comObj.postMessage({
            isReply: true,
            callbackId: data.callbackId,
            data: resolvedData
          });
        });
        action[0].call(action[1], data.data, deferred);
      } else {
        action[0].call(action[1], data.data);
      }
    } else {
      error('Unkown action from worker: ' + data.action);
    }
  };
}

MessageHandler.prototype = {
  on: function messageHandlerOn(actionName, handler, scope) {
    var ah = this.actionHandler;
    if (ah[actionName]) {
      error('There is already an actionName called "' + actionName + '"');
    }
    ah[actionName] = [handler, scope];
  },
  
  send: function messageHandlerSend(actionName, data, callback, transfers) {
    var message = {
      action: actionName,
      data: data
    };
    if (callback) {
      var callbackId = this.callbackIndex++;
      this.callbacks[callbackId] = callback;
      message.callbackId = callbackId;
    }
    if (transfers && this.postMessageTransfers) {
      this.comObj.postMessage(message, transfers);
    } else {
      this.comObj.postMessage(message);
    }
  }
};

function loadJpegStream(id, imageUrl, objs) {
  var img = new Image();
  img.onload = (function loadJpegStream_onloadClosure() {
    objs.resolve(id, img);
  });
  img.src = imageUrl;
}


var ColorSpace = (function ColorSpaceClosure() {
  
  function ColorSpace() {
    error('should not call ColorSpace constructor');
  }

  ColorSpace.prototype = {
    
    getRgb: function ColorSpace_getRgb(src, srcOffset) {
      var rgb = new Uint8Array(3);
      this.getRgbItem(src, srcOffset, rgb, 0);
      return rgb;
    },
    
    getRgbItem: function ColorSpace_getRgbItem(src, srcOffset,
                                               dest, destOffset) {
      error('Should not call ColorSpace.getRgbItem');
    },
    
    getRgbBuffer: function ColorSpace_getRgbBuffer(src, srcOffset, count,
                                                   dest, destOffset, bits,
                                                   alpha01) {
      error('Should not call ColorSpace.getRgbBuffer');
    },
    
    getOutputLength: function ColorSpace_getOutputLength(inputLength,
                                                         alpha01) {
      error('Should not call ColorSpace.getOutputLength');
    },
    
    isPassthrough: function ColorSpace_isPassthrough(bits) {
      return false;
    },
    
    fillRgb: function ColorSpace_fillRgb(dest, originalWidth,
                                         originalHeight, width, height,
                                         actualHeight, bpc, comps, alpha01) {
      var count = originalWidth * originalHeight;
      var rgbBuf = null;
      var numComponentColors = 1 << bpc;
      var needsResizing = originalHeight != height || originalWidth != width;

      if (this.isPassthrough(bpc)) {
        rgbBuf = comps;

      } else if (this.numComps === 1 && count > numComponentColors &&
          this.name !== 'DeviceGray' && this.name !== 'DeviceRGB') {
        
        
        
        
        
        
        
        
        
        var allColors = bpc <= 8 ? new Uint8Array(numComponentColors) :
                                   new Uint16Array(numComponentColors);
        for (var i = 0; i < numComponentColors; i++) {
          allColors[i] = i;
        }
        var colorMap = new Uint8Array(numComponentColors * 3);
        this.getRgbBuffer(allColors, 0, numComponentColors, colorMap, 0, bpc,
                           0);

        if (!needsResizing) {
          
          var destPos = 0;
          for (var i = 0; i < count; ++i) {
            var key = comps[i] * 3;
            dest[destPos++] = colorMap[key];
            dest[destPos++] = colorMap[key + 1];
            dest[destPos++] = colorMap[key + 2];
            destPos += alpha01;
          }
        } else {
          rgbBuf = new Uint8Array(count * 3);
          var rgbPos = 0;
          for (var i = 0; i < count; ++i) {
            var key = comps[i] * 3;
            rgbBuf[rgbPos++] = colorMap[key];
            rgbBuf[rgbPos++] = colorMap[key + 1];
            rgbBuf[rgbPos++] = colorMap[key + 2];
          }
        }
      } else {
        if (!needsResizing) {
          
          this.getRgbBuffer(comps, 0, width * actualHeight, dest, 0, bpc,
                            alpha01);
        } else {
          rgbBuf = new Uint8Array(count * 3);
          this.getRgbBuffer(comps, 0, count, rgbBuf, 0, bpc,
                             0);
        }
      }

      if (rgbBuf) {
        if (needsResizing) {
          rgbBuf = PDFImage.resize(rgbBuf, bpc, 3, originalWidth,
                                   originalHeight, width, height);
        }
        var rgbPos = 0;
        var destPos = 0;
        for (var i = 0, ii = width * actualHeight; i < ii; i++) {
          dest[destPos++] = rgbBuf[rgbPos++];
          dest[destPos++] = rgbBuf[rgbPos++];
          dest[destPos++] = rgbBuf[rgbPos++];
          destPos += alpha01;
        }
      }
    },
    
    usesZeroToOneRange: true
  };

  ColorSpace.parse = function ColorSpace_parse(cs, xref, res) {
    var IR = ColorSpace.parseToIR(cs, xref, res);
    if (IR instanceof AlternateCS) {
      return IR;
    }
    return ColorSpace.fromIR(IR);
  };

  ColorSpace.fromIR = function ColorSpace_fromIR(IR) {
    var name = isArray(IR) ? IR[0] : IR;

    switch (name) {
      case 'DeviceGrayCS':
        return this.singletons.gray;
      case 'DeviceRgbCS':
        return this.singletons.rgb;
      case 'DeviceCmykCS':
        return this.singletons.cmyk;
      case 'CalGrayCS':
        var whitePoint = IR[1].WhitePoint;
        var blackPoint = IR[1].BlackPoint;
        var gamma = IR[1].Gamma;
        return new CalGrayCS(whitePoint, blackPoint, gamma);
      case 'PatternCS':
        var basePatternCS = IR[1];
        if (basePatternCS) {
          basePatternCS = ColorSpace.fromIR(basePatternCS);
        }
        return new PatternCS(basePatternCS);
      case 'IndexedCS':
        var baseIndexedCS = IR[1];
        var hiVal = IR[2];
        var lookup = IR[3];
        return new IndexedCS(ColorSpace.fromIR(baseIndexedCS), hiVal, lookup);
      case 'AlternateCS':
        var numComps = IR[1];
        var alt = IR[2];
        var tintFnIR = IR[3];

        return new AlternateCS(numComps, ColorSpace.fromIR(alt),
                                PDFFunction.fromIR(tintFnIR));
      case 'LabCS':
        var whitePoint = IR[1].WhitePoint;
        var blackPoint = IR[1].BlackPoint;
        var range = IR[1].Range;
        return new LabCS(whitePoint, blackPoint, range);
      default:
        error('Unkown name ' + name);
    }
    return null;
  };

  ColorSpace.parseToIR = function ColorSpace_parseToIR(cs, xref, res) {
    if (isName(cs)) {
      var colorSpaces = res.get('ColorSpace');
      if (isDict(colorSpaces)) {
        var refcs = colorSpaces.get(cs.name);
        if (refcs) {
          cs = refcs;
        }
      }
    }

    cs = xref.fetchIfRef(cs);
    var mode;

    if (isName(cs)) {
      mode = cs.name;
      this.mode = mode;

      switch (mode) {
        case 'DeviceGray':
        case 'G':
          return 'DeviceGrayCS';
        case 'DeviceRGB':
        case 'RGB':
          return 'DeviceRgbCS';
        case 'DeviceCMYK':
        case 'CMYK':
          return 'DeviceCmykCS';
        case 'Pattern':
          return ['PatternCS', null];
        default:
          error('unrecognized colorspace ' + mode);
      }
    } else if (isArray(cs)) {
      mode = cs[0].name;
      this.mode = mode;

      switch (mode) {
        case 'DeviceGray':
        case 'G':
          return 'DeviceGrayCS';
        case 'DeviceRGB':
        case 'RGB':
          return 'DeviceRgbCS';
        case 'DeviceCMYK':
        case 'CMYK':
          return 'DeviceCmykCS';
        case 'CalGray':
          var params = cs[1].getAll();
          return ['CalGrayCS', params];
        case 'CalRGB':
          return 'DeviceRgbCS';
        case 'ICCBased':
          var stream = xref.fetchIfRef(cs[1]);
          var dict = stream.dict;
          var numComps = dict.get('N');
          if (numComps == 1) {
            return 'DeviceGrayCS';
          } else if (numComps == 3) {
            return 'DeviceRgbCS';
          } else if (numComps == 4) {
            return 'DeviceCmykCS';
          }
          break;
        case 'Pattern':
          var basePatternCS = cs[1];
          if (basePatternCS) {
            basePatternCS = ColorSpace.parseToIR(basePatternCS, xref, res);
          }
          return ['PatternCS', basePatternCS];
        case 'Indexed':
        case 'I':
          var baseIndexedCS = ColorSpace.parseToIR(cs[1], xref, res);
          var hiVal = cs[2] + 1;
          var lookup = xref.fetchIfRef(cs[3]);
          if (isStream(lookup)) {
            lookup = lookup.getBytes();
          }
          return ['IndexedCS', baseIndexedCS, hiVal, lookup];
        case 'Separation':
        case 'DeviceN':
          var name = cs[1];
          var numComps = 1;
          if (isName(name)) {
            numComps = 1;
          } else if (isArray(name)) {
            numComps = name.length;
          }
          var alt = ColorSpace.parseToIR(cs[2], xref, res);
          var tintFnIR = PDFFunction.getIR(xref, xref.fetchIfRef(cs[3]));
          return ['AlternateCS', numComps, alt, tintFnIR];
        case 'Lab':
          var params = cs[1].getAll();
          return ['LabCS', params];
        default:
          error('unimplemented color space object "' + mode + '"');
      }
    } else {
      error('unrecognized color space object: "' + cs + '"');
    }
    return null;
  };
  
  ColorSpace.isDefaultDecode = function ColorSpace_isDefaultDecode(decode, n) {
    if (!decode) {
      return true;
    }

    if (n * 2 !== decode.length) {
      warn('The decode map is not the correct length');
      return true;
    }
    for (var i = 0, ii = decode.length; i < ii; i += 2) {
      if (decode[i] !== 0 || decode[i + 1] != 1) {
        return false;
      }
    }
    return true;
  };

  ColorSpace.singletons = {
    get gray() {
      return shadow(this, 'gray', new DeviceGrayCS());
    },
    get rgb() {
      return shadow(this, 'rgb', new DeviceRgbCS());
    },
    get cmyk() {
      return shadow(this, 'cmyk', new DeviceCmykCS());
    }
  };

  return ColorSpace;
})();


var AlternateCS = (function AlternateCSClosure() {
  function AlternateCS(numComps, base, tintFn) {
    this.name = 'Alternate';
    this.numComps = numComps;
    this.defaultColor = new Float32Array(numComps);
    for (var i = 0; i < numComps; ++i) {
      this.defaultColor[i] = 1;
    }
    this.base = base;
    this.tintFn = tintFn;
  }

  AlternateCS.prototype = {
    getRgb: ColorSpace.prototype.getRgb,
    getRgbItem: function AlternateCS_getRgbItem(src, srcOffset,
                                                dest, destOffset) {
      var baseNumComps = this.base.numComps;
      var input = 'subarray' in src ?
        src.subarray(srcOffset, srcOffset + this.numComps) :
        Array.prototype.slice.call(src, srcOffset, srcOffset + this.numComps);
      var tinted = this.tintFn(input);
      this.base.getRgbItem(tinted, 0, dest, destOffset);
    },
    getRgbBuffer: function AlternateCS_getRgbBuffer(src, srcOffset, count,
                                                    dest, destOffset, bits,
                                                    alpha01) {
      var tintFn = this.tintFn;
      var base = this.base;
      var scale = 1 / ((1 << bits) - 1);
      var baseNumComps = base.numComps;
      var usesZeroToOneRange = base.usesZeroToOneRange;
      var isPassthrough = (base.isPassthrough(8) || !usesZeroToOneRange) &&
                          alpha01 === 0;
      var pos = isPassthrough ? destOffset : 0;
      var baseBuf = isPassthrough ? dest : new Uint8Array(baseNumComps * count);
      var numComps = this.numComps;

      var scaled = new Float32Array(numComps);
      for (var i = 0; i < count; i++) {
        for (var j = 0; j < numComps; j++) {
          scaled[j] = src[srcOffset++] * scale;
        }
        var tinted = tintFn(scaled);
        if (usesZeroToOneRange) {
          for (var j = 0; j < baseNumComps; j++) {
            baseBuf[pos++] = tinted[j] * 255;
          }
        } else {
          base.getRgbItem(tinted, 0, baseBuf, pos);
          pos += baseNumComps;
        }
      }
      if (!isPassthrough) {
        base.getRgbBuffer(baseBuf, 0, count, dest, destOffset, 8, alpha01);
      }
    },
    getOutputLength: function AlternateCS_getOutputLength(inputLength,
                                                          alpha01) {
      return this.base.getOutputLength(inputLength *
                                       this.base.numComps / this.numComps,
                                       alpha01);
    },
    isPassthrough: ColorSpace.prototype.isPassthrough,
    fillRgb: ColorSpace.prototype.fillRgb,
    isDefaultDecode: function AlternateCS_isDefaultDecode(decodeMap) {
      return ColorSpace.isDefaultDecode(decodeMap, this.numComps);
    },
    usesZeroToOneRange: true
  };

  return AlternateCS;
})();

var PatternCS = (function PatternCSClosure() {
  function PatternCS(baseCS) {
    this.name = 'Pattern';
    this.base = baseCS;
  }
  PatternCS.prototype = {};

  return PatternCS;
})();

var IndexedCS = (function IndexedCSClosure() {
  function IndexedCS(base, highVal, lookup) {
    this.name = 'Indexed';
    this.numComps = 1;
    this.defaultColor = new Uint8Array([0]);
    this.base = base;
    this.highVal = highVal;

    var baseNumComps = base.numComps;
    var length = baseNumComps * highVal;
    var lookupArray;

    if (isStream(lookup)) {
      lookupArray = new Uint8Array(length);
      var bytes = lookup.getBytes(length);
      lookupArray.set(bytes);
    } else if (isString(lookup)) {
      lookupArray = new Uint8Array(length);
      for (var i = 0; i < length; ++i) {
        lookupArray[i] = lookup.charCodeAt(i);
      }
    } else if (lookup instanceof Uint8Array || lookup instanceof Array) {
      lookupArray = lookup;
    } else {
      error('Unrecognized lookup table: ' + lookup);
    }
    this.lookup = lookupArray;
  }

  IndexedCS.prototype = {
    getRgb: ColorSpace.prototype.getRgb,
    getRgbItem: function IndexedCS_getRgbItem(src, srcOffset,
                                              dest, destOffset) {
      var numComps = this.base.numComps;
      var start = src[srcOffset] * numComps;
      this.base.getRgbItem(this.lookup, start, dest, destOffset);
    },
    getRgbBuffer: function IndexedCS_getRgbBuffer(src, srcOffset, count,
                                                  dest, destOffset, bits,
                                                  alpha01) {
      var base = this.base;
      var numComps = base.numComps;
      var outputDelta = base.getOutputLength(numComps, alpha01);
      var lookup = this.lookup;

      for (var i = 0; i < count; ++i) {
        var lookupPos = src[srcOffset++] * numComps;
        base.getRgbBuffer(lookup, lookupPos, 1, dest, destOffset, 8, alpha01);
        destOffset += outputDelta;
      }
    },
    getOutputLength: function IndexedCS_getOutputLength(inputLength, alpha01) {
      return this.base.getOutputLength(inputLength * this.base.numComps,
                                       alpha01);
    },
    isPassthrough: ColorSpace.prototype.isPassthrough,
    fillRgb: ColorSpace.prototype.fillRgb,
    isDefaultDecode: function IndexedCS_isDefaultDecode(decodeMap) {
      
      return true;
    },
    usesZeroToOneRange: true
  };
  return IndexedCS;
})();

var DeviceGrayCS = (function DeviceGrayCSClosure() {
  function DeviceGrayCS() {
    this.name = 'DeviceGray';
    this.numComps = 1;
    this.defaultColor = new Float32Array([0]);
  }

  DeviceGrayCS.prototype = {
    getRgb: ColorSpace.prototype.getRgb,
    getRgbItem: function DeviceGrayCS_getRgbItem(src, srcOffset,
                                                 dest, destOffset) {
      var c = (src[srcOffset] * 255) | 0;
      c = c < 0 ? 0 : c > 255 ? 255 : c;
      dest[destOffset] = dest[destOffset + 1] = dest[destOffset + 2] = c;
    },
    getRgbBuffer: function DeviceGrayCS_getRgbBuffer(src, srcOffset, count,
                                                     dest, destOffset, bits,
                                                     alpha01) {
      var scale = 255 / ((1 << bits) - 1);
      var j = srcOffset, q = destOffset;
      for (var i = 0; i < count; ++i) {
        var c = (scale * src[j++]) | 0;
        dest[q++] = c;
        dest[q++] = c;
        dest[q++] = c;
        q += alpha01;
      }
    },
    getOutputLength: function DeviceGrayCS_getOutputLength(inputLength,
                                                           alpha01) {
      return inputLength * (3 + alpha01);
    },
    isPassthrough: ColorSpace.prototype.isPassthrough,
    fillRgb: ColorSpace.prototype.fillRgb,
    isDefaultDecode: function DeviceGrayCS_isDefaultDecode(decodeMap) {
      return ColorSpace.isDefaultDecode(decodeMap, this.numComps);
    },
    usesZeroToOneRange: true
  };
  return DeviceGrayCS;
})();

var DeviceRgbCS = (function DeviceRgbCSClosure() {
  function DeviceRgbCS() {
    this.name = 'DeviceRGB';
    this.numComps = 3;
    this.defaultColor = new Float32Array([0, 0, 0]);
  }
  DeviceRgbCS.prototype = {
    getRgb: ColorSpace.prototype.getRgb,
    getRgbItem: function DeviceRgbCS_getRgbItem(src, srcOffset,
                                                dest, destOffset) {
      var r = (src[srcOffset] * 255) | 0;
      var g = (src[srcOffset + 1] * 255) | 0;
      var b = (src[srcOffset + 2] * 255) | 0;
      dest[destOffset] = r < 0 ? 0 : r > 255 ? 255 : r;
      dest[destOffset + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
      dest[destOffset + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    },
    getRgbBuffer: function DeviceRgbCS_getRgbBuffer(src, srcOffset, count,
                                                    dest, destOffset, bits,
                                                    alpha01) {
      if (bits === 8 && alpha01 === 0) {
        dest.set(src.subarray(srcOffset, srcOffset + count * 3), destOffset);
        return;
      }
      var scale = 255 / ((1 << bits) - 1);
      var j = srcOffset, q = destOffset;
      for (var i = 0; i < count; ++i) {
        dest[q++] = (scale * src[j++]) | 0;
        dest[q++] = (scale * src[j++]) | 0;
        dest[q++] = (scale * src[j++]) | 0;
        q += alpha01;
      }
    },
    getOutputLength: function DeviceRgbCS_getOutputLength(inputLength,
                                                          alpha01) {
      return (inputLength * (3 + alpha01) / 3) | 0;
    },
    isPassthrough: function DeviceRgbCS_isPassthrough(bits) {
      return bits == 8;
    },
    fillRgb: ColorSpace.prototype.fillRgb,
    isDefaultDecode: function DeviceRgbCS_isDefaultDecode(decodeMap) {
      return ColorSpace.isDefaultDecode(decodeMap, this.numComps);
    },
    usesZeroToOneRange: true
  };
  return DeviceRgbCS;
})();

var DeviceCmykCS = (function DeviceCmykCSClosure() {
  
  
  
  
  
  
  function convertToRgb(src, srcOffset, srcScale, dest, destOffset) {
    var c = src[srcOffset + 0] * srcScale;
    var m = src[srcOffset + 1] * srcScale;
    var y = src[srcOffset + 2] * srcScale;
    var k = src[srcOffset + 3] * srcScale;

    var r =
      c * (-4.387332384609988 * c + 54.48615194189176 * m +
           18.82290502165302 * y + 212.25662451639585 * k +
           -285.2331026137004) +
      m * (1.7149763477362134 * m - 5.6096736904047315 * y +
           -17.873870861415444 * k - 5.497006427196366) +
      y * (-2.5217340131683033 * y - 21.248923337353073 * k +
           17.5119270841813) +
      k * (-21.86122147463605 * k - 189.48180835922747) + 255;
    var g =
      c * (8.841041422036149 * c + 60.118027045597366 * m +
           6.871425592049007 * y + 31.159100130055922 * k +
           -79.2970844816548) +
      m * (-15.310361306967817 * m + 17.575251261109482 * y +
           131.35250912493976 * k - 190.9453302588951) +
      y * (4.444339102852739 * y + 9.8632861493405 * k - 24.86741582555878) +
      k * (-20.737325471181034 * k - 187.80453709719578) + 255;
    var b =
      c * (0.8842522430003296 * c + 8.078677503112928 * m +
           30.89978309703729 * y - 0.23883238689178934 * k +
           -14.183576799673286) +
      m * (10.49593273432072 * m + 63.02378494754052 * y +
           50.606957656360734 * k - 112.23884253719248) +
      y * (0.03296041114873217 * y + 115.60384449646641 * k +
           -193.58209356861505) +
      k * (-22.33816807309886 * k - 180.12613974708367) + 255;

    dest[destOffset] = r > 255 ? 255 : r < 0 ? 0 : r;
    dest[destOffset + 1] = g > 255 ? 255 : g < 0 ? 0 : g;
    dest[destOffset + 2] = b > 255 ? 255 : b < 0 ? 0 : b;
  }

  function DeviceCmykCS() {
    this.name = 'DeviceCMYK';
    this.numComps = 4;
    this.defaultColor = new Float32Array([0, 0, 0, 1]);
  }
  DeviceCmykCS.prototype = {
    getRgb: ColorSpace.prototype.getRgb,
    getRgbItem: function DeviceCmykCS_getRgbItem(src, srcOffset,
                                                 dest, destOffset) {
      convertToRgb(src, srcOffset, 1, dest, destOffset);
    },
    getRgbBuffer: function DeviceCmykCS_getRgbBuffer(src, srcOffset, count,
                                                     dest, destOffset, bits,
                                                     alpha01) {
      var scale = 1 / ((1 << bits) - 1);
      for (var i = 0; i < count; i++) {
        convertToRgb(src, srcOffset, scale, dest, destOffset);
        srcOffset += 4;
        destOffset += 3 + alpha01;
      }
    },
    getOutputLength: function DeviceCmykCS_getOutputLength(inputLength,
                                                           alpha01) {
      return (inputLength / 4 * (3 + alpha01)) | 0;
    },
    isPassthrough: ColorSpace.prototype.isPassthrough,
    fillRgb: ColorSpace.prototype.fillRgb,
    isDefaultDecode: function DeviceCmykCS_isDefaultDecode(decodeMap) {
      return ColorSpace.isDefaultDecode(decodeMap, this.numComps);
    },
    usesZeroToOneRange: true
  };

  return DeviceCmykCS;
})();




var CalGrayCS = (function CalGrayCSClosure() {
  function CalGrayCS(whitePoint, blackPoint, gamma) {
    this.name = 'CalGray';
    this.numComps = 1;
    this.defaultColor = new Float32Array([0]);

    if (!whitePoint) {
      error('WhitePoint missing - required for color space CalGray');
    }
    blackPoint = blackPoint || [0, 0, 0];
    gamma = gamma || 1;

    
    this.XW = whitePoint[0];
    this.YW = whitePoint[1];
    this.ZW = whitePoint[2];

    this.XB = blackPoint[0];
    this.YB = blackPoint[1];
    this.ZB = blackPoint[2];

    this.G = gamma;

    
    if (this.XW < 0 || this.ZW < 0 || this.YW !== 1) {
      error('Invalid WhitePoint components for ' + this.name +
            ', no fallback available');
    }

    if (this.XB < 0 || this.YB < 0 || this.ZB < 0) {
      info('Invalid BlackPoint for ' + this.name + ', falling back to default');
      this.XB = this.YB = this.ZB = 0;
    }

    if (this.XB !== 0 || this.YB !== 0 || this.ZB !== 0) {
      warn(this.name + ', BlackPoint: XB: ' + this.XB + ', YB: ' + this.YB +
           ', ZB: ' + this.ZB + ', only default values are supported.');
    }

    if (this.G < 1) {
      info('Invalid Gamma: ' + this.G + ' for ' + this.name +
           ', falling back to default');
      this.G = 1;
    }
  }

  function convertToRgb(cs, src, srcOffset, dest, destOffset, scale) {
    
    
    var A = src[srcOffset] * scale;
    var AG = Math.pow(A, cs.G);

    
    
    var M = cs.XW * AG;
    var L = cs.YW * AG;
    var N = cs.ZW * AG;

    
    var X = M;
    var Y = L;
    var Z = N;

    
    
    var Lstar = Math.max(116 * Math.pow(Y, 1 / 3) - 16, 0);

    
    dest[destOffset] = Lstar * 255 / 100;
    dest[destOffset + 1] = Lstar * 255 / 100;
    dest[destOffset + 2] = Lstar * 255 / 100;
  }

  CalGrayCS.prototype = {
    getRgb: ColorSpace.prototype.getRgb,
    getRgbItem: function CalGrayCS_getRgbItem(src, srcOffset,
                                              dest, destOffset) {
      convertToRgb(this, src, srcOffset, dest, destOffset, 1);
    },
    getRgbBuffer: function CalGrayCS_getRgbBuffer(src, srcOffset, count,
                                                  dest, destOffset, bits,
                                                  alpha01) {
      var scale = 1 / ((1 << bits) - 1);

      for (var i = 0; i < count; ++i) {
        convertToRgb(this, src, srcOffset, dest, destOffset, scale);
        srcOffset += 1;
        destOffset += 3 + alpha01;
      }
    },
    getOutputLength: function CalGrayCS_getOutputLength(inputLength, alpha01) {
      return inputLength * (3 + alpha01);
    },
    isPassthrough: ColorSpace.prototype.isPassthrough,
    fillRgb: ColorSpace.prototype.fillRgb,
    isDefaultDecode: function CalGrayCS_isDefaultDecode(decodeMap) {
      return ColorSpace.isDefaultDecode(decodeMap, this.numComps);
    },
    usesZeroToOneRange: true
  };
  return CalGrayCS;
})();




var LabCS = (function LabCSClosure() {
  function LabCS(whitePoint, blackPoint, range) {
    this.name = 'Lab';
    this.numComps = 3;
    this.defaultColor = new Float32Array([0, 0, 0]);

    if (!whitePoint) {
      error('WhitePoint missing - required for color space Lab');
    }
    blackPoint = blackPoint || [0, 0, 0];
    range = range || [-100, 100, -100, 100];

    
    this.XW = whitePoint[0];
    this.YW = whitePoint[1];
    this.ZW = whitePoint[2];
    this.amin = range[0];
    this.amax = range[1];
    this.bmin = range[2];
    this.bmax = range[3];

    
    
    this.XB = blackPoint[0];
    this.YB = blackPoint[1];
    this.ZB = blackPoint[2];

    
    if (this.XW < 0 || this.ZW < 0 || this.YW !== 1) {
      error('Invalid WhitePoint components, no fallback available');
    }

    if (this.XB < 0 || this.YB < 0 || this.ZB < 0) {
      info('Invalid BlackPoint, falling back to default');
      this.XB = this.YB = this.ZB = 0;
    }

    if (this.amin > this.amax || this.bmin > this.bmax) {
      info('Invalid Range, falling back to defaults');
      this.amin = -100;
      this.amax = 100;
      this.bmin = -100;
      this.bmax = 100;
    }
  }

  
  function fn_g(x) {
    if (x >= 6 / 29) {
      return x * x * x;
    } else {
      return (108 / 841) * (x - 4 / 29);
    }
  }

  function decode(value, high1, low2, high2) {
    return low2 + (value) * (high2 - low2) / (high1);
  }

  
  function convertToRgb(cs, src, srcOffset, maxVal, dest, destOffset) {
    
    
    
    
    
    
    var Ls = src[srcOffset];
    var as = src[srcOffset + 1];
    var bs = src[srcOffset + 2];
    if (maxVal !== false) {
      Ls = decode(Ls, maxVal, 0, 100);
      as = decode(as, maxVal, cs.amin, cs.amax);
      bs = decode(bs, maxVal, cs.bmin, cs.bmax);
    }

    
    as = as > cs.amax ? cs.amax : as < cs.amin ? cs.amin : as;
    bs = bs > cs.bmax ? cs.bmax : bs < cs.bmin ? cs.bmin : bs;

    
    var M = (Ls + 16) / 116;
    var L = M + (as / 500);
    var N = M - (bs / 200);

    var X = cs.XW * fn_g(L);
    var Y = cs.YW * fn_g(M);
    var Z = cs.ZW * fn_g(N);

    var r, g, b;
    
    
    if (cs.ZW < 1) {
      
      r = X * 3.1339 + Y * -1.6170 + Z * -0.4906;
      g = X * -0.9785 + Y * 1.9160 + Z * 0.0333;
      b = X * 0.0720 + Y * -0.2290 + Z * 1.4057;
    } else {
      
      r = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
      g = X * -0.9689 + Y * 1.8758 + Z * 0.0415;
      b = X * 0.0557 + Y * -0.2040 + Z * 1.0570;
    }
    
    dest[destOffset] = r <= 0 ? 0 : r >= 1 ? 255 : Math.sqrt(r) * 255 | 0;
    dest[destOffset + 1] = g <= 0 ? 0 : g >= 1 ? 255 : Math.sqrt(g) * 255 | 0;
    dest[destOffset + 2] = b <= 0 ? 0 : b >= 1 ? 255 : Math.sqrt(b) * 255 | 0;
  }

  LabCS.prototype = {
    getRgb: ColorSpace.prototype.getRgb,
    getRgbItem: function LabCS_getRgbItem(src, srcOffset, dest, destOffset) {
      convertToRgb(this, src, srcOffset, false, dest, destOffset);
    },
    getRgbBuffer: function LabCS_getRgbBuffer(src, srcOffset, count,
                                              dest, destOffset, bits,
                                              alpha01) {
      var maxVal = (1 << bits) - 1;
      for (var i = 0; i < count; i++) {
        convertToRgb(this, src, srcOffset, maxVal, dest, destOffset);
        srcOffset += 3;
        destOffset += 3 + alpha01;
      }
    },
    getOutputLength: function LabCS_getOutputLength(inputLength, alpha01) {
      return (inputLength * (3 + alpha01) / 3) | 0;
    },
    isPassthrough: ColorSpace.prototype.isPassthrough,
    isDefaultDecode: function LabCS_isDefaultDecode(decodeMap) {
      
      
      return true;
    },
    usesZeroToOneRange: false
  };
  return LabCS;
})();



var PDFFunction = (function PDFFunctionClosure() {
  var CONSTRUCT_SAMPLED = 0;
  var CONSTRUCT_INTERPOLATED = 2;
  var CONSTRUCT_STICHED = 3;
  var CONSTRUCT_POSTSCRIPT = 4;

  return {
    getSampleArray: function PDFFunction_getSampleArray(size, outputSize, bps,
                                                       str) {
      var length = 1;
      for (var i = 0, ii = size.length; i < ii; i++) {
        length *= size[i];
      }
      length *= outputSize;

      var array = [];
      var codeSize = 0;
      var codeBuf = 0;
      
      var sampleMul = 1.0 / (Math.pow(2.0, bps) - 1);

      var strBytes = str.getBytes((length * bps + 7) / 8);
      var strIdx = 0;
      for (var i = 0; i < length; i++) {
        while (codeSize < bps) {
          codeBuf <<= 8;
          codeBuf |= strBytes[strIdx++];
          codeSize += 8;
        }
        codeSize -= bps;
        array.push((codeBuf >> codeSize) * sampleMul);
        codeBuf &= (1 << codeSize) - 1;
      }
      return array;
    },

    getIR: function PDFFunction_getIR(xref, fn) {
      var dict = fn.dict;
      if (!dict) {
        dict = fn;
      }

      var types = [this.constructSampled,
                   null,
                   this.constructInterpolated,
                   this.constructStiched,
                   this.constructPostScript];

      var typeNum = dict.get('FunctionType');
      var typeFn = types[typeNum];
      if (!typeFn) {
        error('Unknown type of function');
      }

      return typeFn.call(this, fn, dict, xref);
    },

    fromIR: function PDFFunction_fromIR(IR) {
      var type = IR[0];
      switch (type) {
        case CONSTRUCT_SAMPLED:
          return this.constructSampledFromIR(IR);
        case CONSTRUCT_INTERPOLATED:
          return this.constructInterpolatedFromIR(IR);
        case CONSTRUCT_STICHED:
          return this.constructStichedFromIR(IR);
        
        default:
          return this.constructPostScriptFromIR(IR);
      }
    },

    parse: function PDFFunction_parse(xref, fn) {
      var IR = this.getIR(xref, fn);
      return this.fromIR(IR);
    },

    constructSampled: function PDFFunction_constructSampled(str, dict) {
      function toMultiArray(arr) {
        var inputLength = arr.length;
        var outputLength = arr.length / 2;
        var out = [];
        var index = 0;
        for (var i = 0; i < inputLength; i += 2) {
          out[index] = [arr[i], arr[i + 1]];
          ++index;
        }
        return out;
      }
      var domain = dict.get('Domain');
      var range = dict.get('Range');

      if (!domain || !range) {
        error('No domain or range');
      }

      var inputSize = domain.length / 2;
      var outputSize = range.length / 2;

      domain = toMultiArray(domain);
      range = toMultiArray(range);

      var size = dict.get('Size');
      var bps = dict.get('BitsPerSample');
      var order = dict.get('Order') || 1;
      if (order !== 1) {
        
        
        info('No support for cubic spline interpolation: ' + order);
      }

      var encode = dict.get('Encode');
      if (!encode) {
        encode = [];
        for (var i = 0; i < inputSize; ++i) {
          encode.push(0);
          encode.push(size[i] - 1);
        }
      }
      encode = toMultiArray(encode);

      var decode = dict.get('Decode');
      if (!decode) {
        decode = range;
      } else {
        decode = toMultiArray(decode);
      }

      var samples = this.getSampleArray(size, outputSize, bps, str);

      return [
        CONSTRUCT_SAMPLED, inputSize, domain, encode, decode, samples, size,
        outputSize, Math.pow(2, bps) - 1, range
      ];
    },

    constructSampledFromIR: function PDFFunction_constructSampledFromIR(IR) {
      
      function interpolate(x, xmin, xmax, ymin, ymax) {
        return ymin + ((x - xmin) * ((ymax - ymin) / (xmax - xmin)));
      }

      return function constructSampledFromIRResult(args) {
        
        var m = IR[1];
        var domain = IR[2];
        var encode = IR[3];
        var decode = IR[4];
        var samples = IR[5];
        var size = IR[6];
        var n = IR[7];
        var mask = IR[8];
        var range = IR[9];

        if (m != args.length) {
          error('Incorrect number of arguments: ' + m + ' != ' +
                args.length);
        }

        var x = args;

        
        
        var cubeVertices = 1 << m;
        var cubeN = new Float64Array(cubeVertices);
        var cubeVertex = new Uint32Array(cubeVertices);
        for (var j = 0; j < cubeVertices; j++) {
          cubeN[j] = 1;
        }

        var k = n, pos = 1;
        
        for (var i = 0; i < m; ++i) {
          
          var domain_2i = domain[i][0];
          var domain_2i_1 = domain[i][1];
          var xi = Math.min(Math.max(x[i], domain_2i), domain_2i_1);

          
          
          var e = interpolate(xi, domain_2i, domain_2i_1,
                              encode[i][0], encode[i][1]);

          
          var size_i = size[i];
          e = Math.min(Math.max(e, 0), size_i - 1);

          
          var e0 = e < size_i - 1 ? Math.floor(e) : e - 1; 
          var n0 = e0 + 1 - e; 
          var n1 = e - e0; 
          var offset0 = e0 * k;
          var offset1 = offset0 + k; 
          for (var j = 0; j < cubeVertices; j++) {
            if (j & pos) {
              cubeN[j] *= n1;
              cubeVertex[j] += offset1;
            } else {
              cubeN[j] *= n0;
              cubeVertex[j] += offset0;
            }
          }

          k *= size_i;
          pos <<= 1;
        }

        var y = new Float64Array(n);
        for (var j = 0; j < n; ++j) {
          
          var rj = 0;
          for (var i = 0; i < cubeVertices; i++) {
            rj += samples[cubeVertex[i] + j] * cubeN[i];
          }

          
          
          rj = interpolate(rj, 0, 1, decode[j][0], decode[j][1]);

          
          y[j] = Math.min(Math.max(rj, range[j][0]), range[j][1]);
        }

        return y;
      };
    },

    constructInterpolated: function PDFFunction_constructInterpolated(str,
                                                                      dict) {
      var c0 = dict.get('C0') || [0];
      var c1 = dict.get('C1') || [1];
      var n = dict.get('N');

      if (!isArray(c0) || !isArray(c1)) {
        error('Illegal dictionary for interpolated function');
      }

      var length = c0.length;
      var diff = [];
      for (var i = 0; i < length; ++i) {
        diff.push(c1[i] - c0[i]);
      }

      return [CONSTRUCT_INTERPOLATED, c0, diff, n];
    },

    constructInterpolatedFromIR:
      function PDFFunction_constructInterpolatedFromIR(IR) {
      var c0 = IR[1];
      var diff = IR[2];
      var n = IR[3];

      var length = diff.length;

      return function constructInterpolatedFromIRResult(args) {
        var x = n == 1 ? args[0] : Math.pow(args[0], n);

        var out = [];
        for (var j = 0; j < length; ++j) {
          out.push(c0[j] + (x * diff[j]));
        }

        return out;

      };
    },

    constructStiched: function PDFFunction_constructStiched(fn, dict, xref) {
      var domain = dict.get('Domain');

      if (!domain) {
        error('No domain');
      }

      var inputSize = domain.length / 2;
      if (inputSize != 1) {
        error('Bad domain for stiched function');
      }

      var fnRefs = dict.get('Functions');
      var fns = [];
      for (var i = 0, ii = fnRefs.length; i < ii; ++i) {
        fns.push(PDFFunction.getIR(xref, xref.fetchIfRef(fnRefs[i])));
      }

      var bounds = dict.get('Bounds');
      var encode = dict.get('Encode');

      return [CONSTRUCT_STICHED, domain, bounds, encode, fns];
    },

    constructStichedFromIR: function PDFFunction_constructStichedFromIR(IR) {
      var domain = IR[1];
      var bounds = IR[2];
      var encode = IR[3];
      var fnsIR = IR[4];
      var fns = [];

      for (var i = 0, ii = fnsIR.length; i < ii; i++) {
        fns.push(PDFFunction.fromIR(fnsIR[i]));
      }

      return function constructStichedFromIRResult(args) {
        var clip = function constructStichedFromIRClip(v, min, max) {
          if (v > max) {
            v = max;
          } else if (v < min) {
            v = min;
          }
          return v;
        };

        
        var v = clip(args[0], domain[0], domain[1]);
        
        for (var i = 0, ii = bounds.length; i < ii; ++i) {
          if (v < bounds[i]) {
            break;
          }
        }

        
        var dmin = domain[0];
        if (i > 0) {
          dmin = bounds[i - 1];
        }
        var dmax = domain[1];
        if (i < bounds.length) {
          dmax = bounds[i];
        }

        var rmin = encode[2 * i];
        var rmax = encode[2 * i + 1];

        var v2 = rmin + (v - dmin) * (rmax - rmin) / (dmax - dmin);

        
        return fns[i]([v2]);
      };
    },

    constructPostScript: function PDFFunction_constructPostScript(fn, dict,
                                                                  xref) {
      var domain = dict.get('Domain');
      var range = dict.get('Range');

      if (!domain) {
        error('No domain.');
      }

      if (!range) {
        error('No range.');
      }

      var lexer = new PostScriptLexer(fn);
      var parser = new PostScriptParser(lexer);
      var code = parser.parse();

      return [CONSTRUCT_POSTSCRIPT, domain, range, code];
    },

    constructPostScriptFromIR: function PDFFunction_constructPostScriptFromIR(
                                          IR) {
      var domain = IR[1];
      var range = IR[2];
      var code = IR[3];
      var numOutputs = range.length / 2;
      var evaluator = new PostScriptEvaluator(code);
      
      
      var cache = new FunctionCache();
      return function constructPostScriptFromIRResult(args) {
        var initialStack = [];
        for (var i = 0, ii = (domain.length / 2); i < ii; ++i) {
          initialStack.push(args[i]);
        }

        var key = initialStack.join('_');
        if (cache.has(key)) {
          return cache.get(key);
        }

        var stack = evaluator.execute(initialStack);
        var transformed = [];
        for (i = numOutputs - 1; i >= 0; --i) {
          var out = stack.pop();
          var rangeIndex = 2 * i;
          if (out < range[rangeIndex]) {
            out = range[rangeIndex];
          } else if (out > range[rangeIndex + 1]) {
            out = range[rangeIndex + 1];
          }
          transformed[i] = out;
        }
        cache.set(key, transformed);
        return transformed;
      };
    }
  };
})();

var FunctionCache = (function FunctionCacheClosure() {
  
  
  var MAX_CACHE_SIZE = 1024;
  function FunctionCache() {
    this.cache = {};
    this.total = 0;
  }
  FunctionCache.prototype = {
    has: function FunctionCache_has(key) {
      return key in this.cache;
    },
    get: function FunctionCache_get(key) {
      return this.cache[key];
    },
    set: function FunctionCache_set(key, value) {
      if (this.total < MAX_CACHE_SIZE) {
        this.cache[key] = value;
        this.total++;
      }
    }
  };
  return FunctionCache;
})();

var PostScriptStack = (function PostScriptStackClosure() {
  var MAX_STACK_SIZE = 100;
  function PostScriptStack(initialStack) {
    this.stack = initialStack || [];
  }

  PostScriptStack.prototype = {
    push: function PostScriptStack_push(value) {
      if (this.stack.length >= MAX_STACK_SIZE) {
        error('PostScript function stack overflow.');
      }
      this.stack.push(value);
    },
    pop: function PostScriptStack_pop() {
      if (this.stack.length <= 0) {
        error('PostScript function stack underflow.');
      }
      return this.stack.pop();
    },
    copy: function PostScriptStack_copy(n) {
      if (this.stack.length + n >= MAX_STACK_SIZE) {
        error('PostScript function stack overflow.');
      }
      var stack = this.stack;
      for (var i = stack.length - n, j = n - 1; j >= 0; j--, i++) {
        stack.push(stack[i]);
      }
    },
    index: function PostScriptStack_index(n) {
      this.push(this.stack[this.stack.length - n - 1]);
    },
    
    roll: function PostScriptStack_roll(n, p) {
      var stack = this.stack;
      var l = stack.length - n;
      var r = stack.length - 1, c = l + (p - Math.floor(p / n) * n), i, j, t;
      for (i = l, j = r; i < j; i++, j--) {
        t = stack[i]; stack[i] = stack[j]; stack[j] = t;
      }
      for (i = l, j = c - 1; i < j; i++, j--) {
        t = stack[i]; stack[i] = stack[j]; stack[j] = t;
      }
      for (i = c, j = r; i < j; i++, j--) {
        t = stack[i]; stack[i] = stack[j]; stack[j] = t;
      }
    }
  };
  return PostScriptStack;
})();
var PostScriptEvaluator = (function PostScriptEvaluatorClosure() {
  function PostScriptEvaluator(operators) {
    this.operators = operators;
  }
  PostScriptEvaluator.prototype = {
    execute: function PostScriptEvaluator_execute(initialStack) {
      var stack = new PostScriptStack(initialStack);
      var counter = 0;
      var operators = this.operators;
      var length = operators.length;
      var operator, a, b;
      while (counter < length) {
        operator = operators[counter++];
        if (typeof operator == 'number') {
          
          stack.push(operator);
          continue;
        }
        switch (operator) {
          
          case 'jz': 
            b = stack.pop();
            a = stack.pop();
            if (!a) {
              counter = b;
            }
            break;
          case 'j': 
            a = stack.pop();
            counter = a;
            break;

          
          case 'abs':
            a = stack.pop();
            stack.push(Math.abs(a));
            break;
          case 'add':
            b = stack.pop();
            a = stack.pop();
            stack.push(a + b);
            break;
          case 'and':
            b = stack.pop();
            a = stack.pop();
            if (isBool(a) && isBool(b)) {
              stack.push(a && b);
            } else {
              stack.push(a & b);
            }
            break;
          case 'atan':
            a = stack.pop();
            stack.push(Math.atan(a));
            break;
          case 'bitshift':
            b = stack.pop();
            a = stack.pop();
            if (a > 0) {
              stack.push(a << b);
            } else {
              stack.push(a >> b);
            }
            break;
          case 'ceiling':
            a = stack.pop();
            stack.push(Math.ceil(a));
            break;
          case 'copy':
            a = stack.pop();
            stack.copy(a);
            break;
          case 'cos':
            a = stack.pop();
            stack.push(Math.cos(a));
            break;
          case 'cvi':
            a = stack.pop() | 0;
            stack.push(a);
            break;
          case 'cvr':
            
            break;
          case 'div':
            b = stack.pop();
            a = stack.pop();
            stack.push(a / b);
            break;
          case 'dup':
            stack.copy(1);
            break;
          case 'eq':
            b = stack.pop();
            a = stack.pop();
            stack.push(a == b);
            break;
          case 'exch':
            stack.roll(2, 1);
            break;
          case 'exp':
            b = stack.pop();
            a = stack.pop();
            stack.push(Math.pow(a, b));
            break;
          case 'false':
            stack.push(false);
            break;
          case 'floor':
            a = stack.pop();
            stack.push(Math.floor(a));
            break;
          case 'ge':
            b = stack.pop();
            a = stack.pop();
            stack.push(a >= b);
            break;
          case 'gt':
            b = stack.pop();
            a = stack.pop();
            stack.push(a > b);
            break;
          case 'idiv':
            b = stack.pop();
            a = stack.pop();
            stack.push((a / b) | 0);
            break;
          case 'index':
            a = stack.pop();
            stack.index(a);
            break;
          case 'le':
            b = stack.pop();
            a = stack.pop();
            stack.push(a <= b);
            break;
          case 'ln':
            a = stack.pop();
            stack.push(Math.log(a));
            break;
          case 'log':
            a = stack.pop();
            stack.push(Math.log(a) / Math.LN10);
            break;
          case 'lt':
            b = stack.pop();
            a = stack.pop();
            stack.push(a < b);
            break;
          case 'mod':
            b = stack.pop();
            a = stack.pop();
            stack.push(a % b);
            break;
          case 'mul':
            b = stack.pop();
            a = stack.pop();
            stack.push(a * b);
            break;
          case 'ne':
            b = stack.pop();
            a = stack.pop();
            stack.push(a != b);
            break;
          case 'neg':
            a = stack.pop();
            stack.push(-b);
            break;
          case 'not':
            a = stack.pop();
            if (isBool(a) && isBool(b)) {
              stack.push(a && b);
            } else {
              stack.push(a & b);
            }
            break;
          case 'or':
            b = stack.pop();
            a = stack.pop();
            if (isBool(a) && isBool(b)) {
              stack.push(a || b);
            } else {
              stack.push(a | b);
            }
            break;
          case 'pop':
            stack.pop();
            break;
          case 'roll':
            b = stack.pop();
            a = stack.pop();
            stack.roll(a, b);
            break;
          case 'round':
            a = stack.pop();
            stack.push(Math.round(a));
            break;
          case 'sin':
            a = stack.pop();
            stack.push(Math.sin(a));
            break;
          case 'sqrt':
            a = stack.pop();
            stack.push(Math.sqrt(a));
            break;
          case 'sub':
            b = stack.pop();
            a = stack.pop();
            stack.push(a - b);
            break;
          case 'true':
            stack.push(true);
            break;
          case 'truncate':
            a = stack.pop();
            a = a < 0 ? Math.ceil(a) : Math.floor(a);
            stack.push(a);
            break;
          case 'xor':
            b = stack.pop();
            a = stack.pop();
            if (isBool(a) && isBool(b)) {
              stack.push(a != b);
            } else {
              stack.push(a ^ b);
            }
            break;
          default:
            error('Unknown operator ' + operator);
            break;
        }
      }
      return stack.stack;
    }
  };
  return PostScriptEvaluator;
})();


var HIGHLIGHT_OFFSET = 4; 
var SUPPORTED_TYPES = ['Link', 'Text', 'Widget'];

var Annotation = (function AnnotationClosure() {
  
  function getTransformMatrix(rect, bbox, matrix) {
    var bounds = Util.getAxialAlignedBoundingBox(bbox, matrix);
    var minX = bounds[0];
    var minY = bounds[1];
    var maxX = bounds[2];
    var maxY = bounds[3];

    if (minX === maxX || minY === maxY) {
      
      
      return [1, 0, 0, 1, rect[0], rect[1]];
    }

    var xRatio = (rect[2] - rect[0]) / (maxX - minX);
    var yRatio = (rect[3] - rect[1]) / (maxY - minY);
    return [
      xRatio,
      0,
      0,
      yRatio,
      rect[0] - minX * xRatio,
      rect[1] - minY * yRatio
    ];
  }

  function getDefaultAppearance(dict) {
    var appearanceState = dict.get('AP');
    if (!isDict(appearanceState)) {
      return;
    }

    var appearance;
    var appearances = appearanceState.get('N');
    if (isDict(appearances)) {
      var as = dict.get('AS');
      if (as && appearances.has(as.name)) {
        appearance = appearances.get(as.name);
      }
    } else {
      appearance = appearances;
    }
    return appearance;
  }

  function Annotation(params) {
    if (params.data) {
      this.data = params.data;
      return;
    }

    var dict = params.dict;
    var data = this.data = {};

    data.subtype = dict.get('Subtype').name;
    var rect = dict.get('Rect');
    data.rect = Util.normalizeRect(rect);
    data.annotationFlags = dict.get('F');

    var color = dict.get('C');
    if (isArray(color) && color.length === 3) {
      
      
      data.color = color;
    } else {
      data.color = [0, 0, 0];
    }

    
    
    if (dict.has('BS')) {
      var borderStyle = dict.get('BS');
      data.borderWidth = borderStyle.has('W') ? borderStyle.get('W') : 1;
    } else {
      var borderArray = dict.get('Border') || [0, 0, 1];
      data.borderWidth = borderArray[2] || 0;

      
      var dashArray = borderArray[3];
      if (data.borderWidth > 0 && dashArray && isArray(dashArray)) {
        var dashArrayLength = dashArray.length;
        if (dashArrayLength > 0) {
          
          
          var isInvalid = false;
          var numPositive = 0;
          for (var i = 0; i < dashArrayLength; i++) {
            if (!(+dashArray[i] >= 0)) {
              isInvalid = true;
              break;
            } else if (dashArray[i] > 0) {
              numPositive++;
            }
          }
          if (isInvalid || numPositive === 0) {
            data.borderWidth = 0;
          }
        }
      }
    }

    this.appearance = getDefaultAppearance(dict);
    data.hasAppearance = !!this.appearance;
  }

  Annotation.prototype = {

    getData: function Annotation_getData() {
      return this.data;
    },

    hasHtml: function Annotation_hasHtml() {
      return false;
    },

    getHtmlElement: function Annotation_getHtmlElement(commonObjs) {
      throw new NotImplementedException(
        'getHtmlElement() should be implemented in subclass');
    },

    
    getEmptyContainer: function Annotation_getEmptyContainer(tagName, rect,
                                                             borderWidth) {
      assert(!isWorker,
        'getEmptyContainer() should be called from main thread');

      var bWidth = borderWidth || 0;

      rect = rect || this.data.rect;
      var element = document.createElement(tagName);
      element.style.borderWidth = bWidth + 'px';
      var width = rect[2] - rect[0] - 2 * bWidth;
      var height = rect[3] - rect[1] - 2 * bWidth;
      element.style.width = width + 'px';
      element.style.height = height + 'px';
      return element;
    },

    isInvisible: function Annotation_isInvisible() {
      var data = this.data;
      if (data && SUPPORTED_TYPES.indexOf(data.subtype) !== -1) {
        return false;
      } else {
        return !!(data &&
                  data.annotationFlags &&            
                  data.annotationFlags & 0x1);       
      }
    },

    isViewable: function Annotation_isViewable() {
      var data = this.data;
      return !!(!this.isInvisible() &&
                data &&
                (!data.annotationFlags ||
                 !(data.annotationFlags & 0x22)) &&  
                data.rect);                          
    },

    isPrintable: function Annotation_isPrintable() {
      var data = this.data;
      return !!(!this.isInvisible() &&
                data &&
                data.annotationFlags &&              
                data.annotationFlags & 0x4 &&        
                data.rect);                          
    },

    loadResources: function(keys) {
      var promise = new LegacyPromise();
      this.appearance.dict.getAsync('Resources').then(function(resources) {
        if (!resources) {
          promise.resolve();
          return;
        }
        var objectLoader = new ObjectLoader(resources.map,
                                            keys,
                                            resources.xref);
        objectLoader.load().then(function() {
          promise.resolve(resources);
        });
      }.bind(this));

      return promise;
    },

    getOperatorList: function Annotation_getOperatorList(evaluator) {

      var promise = new LegacyPromise();

      if (!this.appearance) {
        promise.resolve(new OperatorList());
        return promise;
      }

      var data = this.data;

      var appearanceDict = this.appearance.dict;
      var resourcesPromise = this.loadResources([
        'ExtGState',
        'ColorSpace',
        'Pattern',
        'Shading',
        'XObject',
        'Font'
        
        
      ]);
      var bbox = appearanceDict.get('BBox') || [0, 0, 1, 1];
      var matrix = appearanceDict.get('Matrix') || [1, 0, 0, 1, 0 ,0];
      var transform = getTransformMatrix(data.rect, bbox, matrix);

      var border = data.border;

      resourcesPromise.then(function(resources) {
        var opList = new OperatorList();
        opList.addOp(OPS.beginAnnotation, [data.rect, transform, matrix]);
        evaluator.getOperatorList(this.appearance, resources, opList);
        opList.addOp(OPS.endAnnotation, []);
        promise.resolve(opList);

        this.appearance.reset();
      }.bind(this));

      return promise;
    }
  };

  Annotation.getConstructor =
      function Annotation_getConstructor(subtype, fieldType) {

    if (!subtype) {
      return;
    }

    
    if (subtype === 'Link') {
      return LinkAnnotation;
    } else if (subtype === 'Text') {
      return TextAnnotation;
    } else if (subtype === 'Widget') {
      if (!fieldType) {
        return;
      }

      if (fieldType === 'Tx') {
        return TextWidgetAnnotation;
      } else {
        return WidgetAnnotation;
      }
    } else {
      return Annotation;
    }
  };

  
  Annotation.fromData = function Annotation_fromData(data) {
    var subtype = data.subtype;
    var fieldType = data.fieldType;
    var Constructor = Annotation.getConstructor(subtype, fieldType);
    if (Constructor) {
      return new Constructor({ data: data });
    }
  };

  Annotation.fromRef = function Annotation_fromRef(xref, ref) {

    var dict = xref.fetchIfRef(ref);
    if (!isDict(dict)) {
      return;
    }

    var subtype = dict.get('Subtype');
    subtype = isName(subtype) ? subtype.name : '';
    if (!subtype) {
      return;
    }

    var fieldType = Util.getInheritableProperty(dict, 'FT');
    fieldType = isName(fieldType) ? fieldType.name : '';

    var Constructor = Annotation.getConstructor(subtype, fieldType);
    if (!Constructor) {
      return;
    }

    var params = {
      dict: dict,
      ref: ref,
    };

    var annotation = new Constructor(params);

    if (annotation.isViewable() || annotation.isPrintable()) {
      return annotation;
    } else {
      warn('unimplemented annotation type: ' + subtype);
    }
  };

  Annotation.appendToOperatorList = function Annotation_appendToOperatorList(
      annotations, opList, pdfManager, partialEvaluator, intent) {

    function reject(e) {
      annotationsReadyPromise.reject(e);
    }

    var annotationsReadyPromise = new LegacyPromise();

    var annotationPromises = [];
    for (var i = 0, n = annotations.length; i < n; ++i) {
      if (intent === 'display' && annotations[i].isViewable() ||
          intent === 'print' && annotations[i].isPrintable()) {
        annotationPromises.push(
          annotations[i].getOperatorList(partialEvaluator));
      }
    }
    Promise.all(annotationPromises).then(function(datas) {
      opList.addOp(OPS.beginAnnotations, []);
      for (var i = 0, n = datas.length; i < n; ++i) {
        var annotOpList = datas[i];
        opList.addOpList(annotOpList);
      }
      opList.addOp(OPS.endAnnotations, []);
      annotationsReadyPromise.resolve();
    }, reject);

    return annotationsReadyPromise;
  };

  return Annotation;
})();
PDFJS.Annotation = Annotation;


var WidgetAnnotation = (function WidgetAnnotationClosure() {

  function WidgetAnnotation(params) {
    Annotation.call(this, params);

    if (params.data) {
      return;
    }

    var dict = params.dict;
    var data = this.data;

    data.fieldValue = stringToPDFString(
      Util.getInheritableProperty(dict, 'V') || '');
    data.alternativeText = stringToPDFString(dict.get('TU') || '');
    data.defaultAppearance = Util.getInheritableProperty(dict, 'DA') || '';
    var fieldType = Util.getInheritableProperty(dict, 'FT');
    data.fieldType = isName(fieldType) ? fieldType.name : '';
    data.fieldFlags = Util.getInheritableProperty(dict, 'Ff') || 0;
    this.fieldResources = Util.getInheritableProperty(dict, 'DR') || new Dict();

    
    
    var fieldName = [];
    var namedItem = dict;
    var ref = params.ref;
    while (namedItem) {
      var parent = namedItem.get('Parent');
      var parentRef = namedItem.getRaw('Parent');
      var name = namedItem.get('T');
      if (name) {
        fieldName.unshift(stringToPDFString(name));
      } else {
        
        
        
        
        
        var kids = parent.get('Kids');
        var j, jj;
        for (j = 0, jj = kids.length; j < jj; j++) {
          var kidRef = kids[j];
          if (kidRef.num == ref.num && kidRef.gen == ref.gen) {
            break;
          }
        }
        fieldName.unshift('`' + j);
      }
      namedItem = parent;
      ref = parentRef;
    }
    data.fullName = fieldName.join('.');
  }

  var parent = Annotation.prototype;
  Util.inherit(WidgetAnnotation, Annotation, {
    isViewable: function WidgetAnnotation_isViewable() {
      if (this.data.fieldType === 'Sig') {
        warn('unimplemented annotation type: Widget signature');
        return false;
      }

      return parent.isViewable.call(this);
    }
  });

  return WidgetAnnotation;
})();

var TextWidgetAnnotation = (function TextWidgetAnnotationClosure() {
  function TextWidgetAnnotation(params) {
    WidgetAnnotation.call(this, params);

    if (params.data) {
      return;
    }

    this.data.textAlignment = Util.getInheritableProperty(params.dict, 'Q');
  }

  
  function setTextStyles(element, item, fontObj) {

    var style = element.style;
    style.fontSize = item.fontSize + 'px';
    style.direction = item.fontDirection < 0 ? 'rtl': 'ltr';

    if (!fontObj) {
      return;
    }

    style.fontWeight = fontObj.black ?
                            (fontObj.bold ? 'bolder' : 'bold') :
                            (fontObj.bold ? 'bold' : 'normal');
    style.fontStyle = fontObj.italic ? 'italic' : 'normal';

    var fontName = fontObj.loadedName;
    var fontFamily = fontName ? '"' + fontName + '", ' : '';
    
    var fallbackName = fontObj.fallbackName || 'Helvetica, sans-serif';
    style.fontFamily = fontFamily + fallbackName;
  }


  var parent = WidgetAnnotation.prototype;
  Util.inherit(TextWidgetAnnotation, WidgetAnnotation, {
    hasHtml: function TextWidgetAnnotation_hasHtml() {
      return !this.data.hasAppearance && !!this.data.fieldValue;
    },

    getHtmlElement: function TextWidgetAnnotation_getHtmlElement(commonObjs) {
      assert(!isWorker, 'getHtmlElement() shall be called from main thread');

      var item = this.data;

      var element = this.getEmptyContainer('div');
      element.style.display = 'table';

      var content = document.createElement('div');
      content.textContent = item.fieldValue;
      var textAlignment = item.textAlignment;
      content.style.textAlign = ['left', 'center', 'right'][textAlignment];
      content.style.verticalAlign = 'middle';
      content.style.display = 'table-cell';

      var fontObj = item.fontRefName ?
                    commonObjs.getData(item.fontRefName) : null;
      var cssRules = setTextStyles(content, item, fontObj);

      element.appendChild(content);

      return element;
    },

    getOperatorList: function TextWidgetAnnotation_getOperatorList(evaluator) {
      if (this.appearance) {
        return Annotation.prototype.getOperatorList.call(this, evaluator);
      }

      var promise = new LegacyPromise();
      var opList = new OperatorList();
      var data = this.data;

      
      

      var defaultAppearance = data.defaultAppearance;
      if (!defaultAppearance) {
        promise.resolve(opList);
        return promise;
      }

      

      var stream = new Stream(stringToBytes(defaultAppearance));
      evaluator.getOperatorList(stream, this.fieldResources, opList);
      var appearanceFnArray = opList.fnArray;
      var appearanceArgsArray = opList.argsArray;
      var fnArray = [];
      var argsArray = [];

      
      data.rgb = [0, 0, 0];
      
      for (var i = 0, n = fnArray.length; i < n; ++i) {
        var fnId = appearanceFnArray[i];
        var args = appearanceArgsArray[i];

        if (fnId === OPS.setFont) {
          data.fontRefName = args[0];
          var size = args[1];
          if (size < 0) {
            data.fontDirection = -1;
            data.fontSize = -size;
          } else {
            data.fontDirection = 1;
            data.fontSize = size;
          }
        } else if (fnId === OPS.setFillRGBColor) {
          data.rgb = args;
        } else if (fnId === OPS.setFillGray) {
          var rgbValue = args[0] * 255;
          data.rgb = [rgbValue, rgbValue, rgbValue];
        }
      }
      promise.resolve(opList);
      return promise;
    }
  });

  return TextWidgetAnnotation;
})();

var InteractiveAnnotation = (function InteractiveAnnotationClosure() {
  function InteractiveAnnotation(params) {
    Annotation.call(this, params);
  }

  Util.inherit(InteractiveAnnotation, Annotation, {
    hasHtml: function InteractiveAnnotation_hasHtml() {
      return true;
    },

    highlight: function InteractiveAnnotation_highlight() {
      if (this.highlightElement &&
         this.highlightElement.hasAttribute('hidden')) {
        this.highlightElement.removeAttribute('hidden');
      }
    },

    unhighlight: function InteractiveAnnotation_unhighlight() {
      if (this.highlightElement &&
         !this.highlightElement.hasAttribute('hidden')) {
        this.highlightElement.setAttribute('hidden', true);
      }
    },

    initContainer: function InteractiveAnnotation_initContainer() {

      var item = this.data;
      var rect = item.rect;

      var container = this.getEmptyContainer('section', rect, item.borderWidth);
      container.style.backgroundColor = item.color;

      var color = item.color;
      var rgb = [];
      for (var i = 0; i < 3; ++i) {
        rgb[i] = Math.round(color[i] * 255);
      }
      item.colorCssRgb = Util.makeCssRgb(rgb);

      var highlight = document.createElement('div');
      highlight.className = 'annotationHighlight';
      highlight.style.left = highlight.style.top = -HIGHLIGHT_OFFSET + 'px';
      highlight.style.right = highlight.style.bottom = -HIGHLIGHT_OFFSET + 'px';
      highlight.setAttribute('hidden', true);

      this.highlightElement = highlight;
      container.appendChild(this.highlightElement);

      return container;
    }
  });

  return InteractiveAnnotation;
})();

var TextAnnotation = (function TextAnnotationClosure() {
  function TextAnnotation(params) {
    InteractiveAnnotation.call(this, params);

    if (params.data) {
      return;
    }

    var dict = params.dict;
    var data = this.data;

    var content = dict.get('Contents');
    var title = dict.get('T');
    data.content = stringToPDFString(content || '');
    data.title = stringToPDFString(title || '');

    if (data.hasAppearance) {
      data.name = 'NoIcon';
    } else {
      data.name = dict.has('Name') ? dict.get('Name').name : 'Note';
    }

    if (dict.has('C')) {
      data.hasBgColor = true;
    }
  }

  var ANNOT_MIN_SIZE = 10;

  Util.inherit(TextAnnotation, InteractiveAnnotation, {

    getHtmlElement: function TextAnnotation_getHtmlElement(commonObjs) {
      assert(!isWorker, 'getHtmlElement() shall be called from main thread');

      var item = this.data;
      var rect = item.rect;

      
      if ((rect[3] - rect[1]) < ANNOT_MIN_SIZE) {
        rect[3] = rect[1] + ANNOT_MIN_SIZE;
      }
      if ((rect[2] - rect[0]) < ANNOT_MIN_SIZE) {
        rect[2] = rect[0] + (rect[3] - rect[1]); 
      }

      var container = this.initContainer();
      container.className = 'annotText';

      var image  = document.createElement('img');
      image.style.height = container.style.height;
      image.style.width = container.style.width;
      var iconName = item.name;
      image.src = PDFJS.imageResourcesPath + 'annotation-' +
        iconName.toLowerCase() + '.svg';
      image.alt = '[{{type}} Annotation]';
      image.dataset.l10nId = 'text_annotation_type';
      image.dataset.l10nArgs = JSON.stringify({type: iconName});

      var contentWrapper = document.createElement('div');
      contentWrapper.className = 'annotTextContentWrapper';
      contentWrapper.style.left = Math.floor(rect[2] - rect[0] + 5) + 'px';
      contentWrapper.style.top = '-10px';

      var content = document.createElement('div');
      content.className = 'annotTextContent';
      content.setAttribute('hidden', true);
      if (item.hasBgColor) {
        var color = item.color;
        var rgb = [];
        for (var i = 0; i < 3; ++i) {
          
          var c = Math.round(color[i] * 255);
          rgb[i] = Math.round((255 - c) * 0.7) + c;
        }
        content.style.backgroundColor = Util.makeCssRgb(rgb);
      }

      var title = document.createElement('h1');
      var text = document.createElement('p');
      title.textContent = item.title;

      if (!item.content && !item.title) {
        content.setAttribute('hidden', true);
      } else {
        var e = document.createElement('span');
        var lines = item.content.split(/(?:\r\n?|\n)/);
        for (var i = 0, ii = lines.length; i < ii; ++i) {
          var line = lines[i];
          e.appendChild(document.createTextNode(line));
          if (i < (ii - 1)) {
            e.appendChild(document.createElement('br'));
          }
        }
        text.appendChild(e);

        var pinned = false;

        var showAnnotation = function showAnnotation(pin) {
          if (pin) {
            pinned = true;
          }
          if (content.hasAttribute('hidden')) {
            container.style.zIndex += 1;
            content.removeAttribute('hidden');
          }
        };

        var hideAnnotation = function hideAnnotation(unpin) {
          if (unpin) {
            pinned = false;
          }
          if (!content.hasAttribute('hidden') && !pinned) {
            container.style.zIndex -= 1;
            content.setAttribute('hidden', true);
          }
        };

        var toggleAnnotation = function toggleAnnotation() {
          if (pinned) {
            hideAnnotation(true);
          } else {
            showAnnotation(true);
          }
        };

        var self = this;
        image.addEventListener('click', function image_clickHandler() {
          toggleAnnotation();
        }, false);
        image.addEventListener('mouseover', function image_mouseOverHandler() {
          showAnnotation();
        }, false);
        image.addEventListener('mouseout', function image_mouseOutHandler() {
          hideAnnotation();
        }, false);

        content.addEventListener('click', function content_clickHandler() {
          hideAnnotation(true);
        }, false);
      }

      content.appendChild(title);
      content.appendChild(text);
      contentWrapper.appendChild(content);
      container.appendChild(image);
      container.appendChild(contentWrapper);

      return container;
    }
  });

  return TextAnnotation;
})();

var LinkAnnotation = (function LinkAnnotationClosure() {
  function LinkAnnotation(params) {
    InteractiveAnnotation.call(this, params);

    if (params.data) {
      return;
    }

    var dict = params.dict;
    var data = this.data;

    var action = dict.get('A');
    if (action) {
      var linkType = action.get('S').name;
      if (linkType === 'URI') {
        var url = action.get('URI');
        if (isName(url)) {
          
          url = '/' + url.name;
        } else if (url) {
          url = addDefaultProtocolToUrl(url);
        }
        
        
        if (!isValidUrl(url, false)) {
          url = '';
        }
        data.url = url;
      } else if (linkType === 'GoTo') {
        data.dest = action.get('D');
      } else if (linkType === 'GoToR') {
        var urlDict = action.get('F');
        if (isDict(urlDict)) {
          
          
          url = urlDict.get('F') || '';
        }

        
        
        if (!isValidUrl(url, false)) {
          url = '';
        }
        data.url = url;
        data.dest = action.get('D');
      } else if (linkType === 'Named') {
        data.action = action.get('N').name;
      } else {
        warn('unrecognized link type: ' + linkType);
      }
    } else if (dict.has('Dest')) {
      
      var dest = dict.get('Dest');
      data.dest = isName(dest) ? dest.name : dest;
    }
  }

  
  function addDefaultProtocolToUrl(url) {
    if (url && url.indexOf('www.') === 0) {
      return ('http://' + url);
    }
    return url;
  }

  Util.inherit(LinkAnnotation, InteractiveAnnotation, {
    hasOperatorList: function LinkAnnotation_hasOperatorList() {
      return false;
    },

    getHtmlElement: function LinkAnnotation_getHtmlElement(commonObjs) {

      var container = this.initContainer();
      container.className = 'annotLink';

      var item = this.data;
      var rect = item.rect;

      container.style.borderColor = item.colorCssRgb;
      container.style.borderStyle = 'solid';

      var link = document.createElement('a');
      link.href = link.title = this.data.url || '';

      container.appendChild(link);

      return container;
    }
  });

  return LinkAnnotation;
})();



PDFJS.maxImageSize = PDFJS.maxImageSize === undefined ? -1 : PDFJS.maxImageSize;


PDFJS.disableFontFace = PDFJS.disableFontFace === undefined ?
                        false : PDFJS.disableFontFace;


PDFJS.imageResourcesPath = PDFJS.imageResourcesPath === undefined ?
                           '' : PDFJS.imageResourcesPath;


PDFJS.disableWorker = PDFJS.disableWorker === undefined ?
                      false : PDFJS.disableWorker;


PDFJS.workerSrc = PDFJS.workerSrc === undefined ? null : PDFJS.workerSrc;


PDFJS.disableRange = PDFJS.disableRange === undefined ?
                     false : PDFJS.disableRange;


PDFJS.disableAutoFetch = PDFJS.disableAutoFetch === undefined ?
                         false : PDFJS.disableAutoFetch;


PDFJS.pdfBug = PDFJS.pdfBug === undefined ? false : PDFJS.pdfBug;


PDFJS.postMessageTransfers = PDFJS.postMessageTransfers === undefined ?
                             true : PDFJS.postMessageTransfers;


PDFJS.disableCreateObjectURL = PDFJS.disableCreateObjectURL === undefined ?
                               false : PDFJS.disableCreateObjectURL;


PDFJS.verbosity = PDFJS.verbosity === undefined ?
                  PDFJS.VERBOSITY_LEVELS.warnings : PDFJS.verbosity;




PDFJS.getDocument = function getDocument(source,
                                         pdfDataRangeTransport,
                                         passwordCallback,
                                         progressCallback) {
  var workerInitializedPromise, workerReadyPromise, transport;

  if (typeof source === 'string') {
    source = { url: source };
  } else if (isArrayBuffer(source)) {
    source = { data: source };
  } else if (typeof source !== 'object') {
    error('Invalid parameter in getDocument, need either Uint8Array, ' +
          'string or a parameter object');
  }

  if (!source.url && !source.data)
    error('Invalid parameter array, need either .data or .url');

  
  var params = {};
  for (var key in source) {
    if (key === 'url' && typeof window !== 'undefined') {
      params[key] = combineUrl(window.location.href, source[key]);
      continue;
    }
    params[key] = source[key];
  }

  workerInitializedPromise = new PDFJS.LegacyPromise();
  workerReadyPromise = new PDFJS.LegacyPromise();
  transport = new WorkerTransport(workerInitializedPromise,
      workerReadyPromise, pdfDataRangeTransport, progressCallback);
  workerInitializedPromise.then(function transportInitialized() {
    transport.passwordCallback = passwordCallback;
    transport.fetchDocument(params);
  });
  return workerReadyPromise;
};


var PDFDocumentProxy = (function PDFDocumentProxyClosure() {
  function PDFDocumentProxy(pdfInfo, transport) {
    this.pdfInfo = pdfInfo;
    this.transport = transport;
  }
  PDFDocumentProxy.prototype =  {
    
    get numPages() {
      return this.pdfInfo.numPages;
    },
    
    get fingerprint() {
      return this.pdfInfo.fingerprint;
    },
    
    getPage: function PDFDocumentProxy_getPage(pageNumber) {
      return this.transport.getPage(pageNumber);
    },
    
    getPageIndex: function PDFDocumentProxy_getPageIndex(ref) {
      return this.transport.getPageIndex(ref);
    },
    
    getDestinations: function PDFDocumentProxy_getDestinations() {
      return this.transport.getDestinations();
    },
    
    getJavaScript: function PDFDocumentProxy_getJavaScript() {
      var promise = new PDFJS.LegacyPromise();
      var js = this.pdfInfo.javaScript;
      promise.resolve(js);
      return promise;
    },
    
    getOutline: function PDFDocumentProxy_getOutline() {
      var promise = new PDFJS.LegacyPromise();
      var outline = this.pdfInfo.outline;
      promise.resolve(outline);
      return promise;
    },
    
    getMetadata: function PDFDocumentProxy_getMetadata() {
      var promise = new PDFJS.LegacyPromise();
      var info = this.pdfInfo.info;
      var metadata = this.pdfInfo.metadata;
      promise.resolve({
        info: info,
        metadata: metadata ? new PDFJS.Metadata(metadata) : null
      });
      return promise;
    },
    
    getData: function PDFDocumentProxy_getData() {
      var promise = new PDFJS.LegacyPromise();
      this.transport.getData(promise);
      return promise;
    },
    
    getDownloadInfo: function PDFDocumentProxy_getDownloadInfo() {
      return this.transport.downloadInfoPromise;
    },
    
    cleanup: function PDFDocumentProxy_cleanup() {
      this.transport.startCleanup();
    },
    
    destroy: function PDFDocumentProxy_destroy() {
      this.transport.destroy();
    }
  };
  return PDFDocumentProxy;
})();




var PDFPageProxy = (function PDFPageProxyClosure() {
  function PDFPageProxy(pageInfo, transport) {
    this.pageInfo = pageInfo;
    this.transport = transport;
    this.stats = new StatTimer();
    this.stats.enabled = !!globalScope.PDFJS.enableStats;
    this.commonObjs = transport.commonObjs;
    this.objs = new PDFObjects();
    this.cleanupAfterRender = false;
    this.pendingDestroy = false;
    this.intentStates = {};
  }
  PDFPageProxy.prototype =  {
    
    get pageNumber() {
      return this.pageInfo.pageIndex + 1;
    },
    
    get rotate() {
      return this.pageInfo.rotate;
    },
    
    get ref() {
      return this.pageInfo.ref;
    },
    
    get view() {
      return this.pageInfo.view;
    },
    
    getViewport: function PDFPageProxy_getViewport(scale, rotate) {
      if (arguments.length < 2)
        rotate = this.rotate;
      return new PDFJS.PageViewport(this.view, scale, rotate, 0, 0);
    },
    
    getAnnotations: function PDFPageProxy_getAnnotations() {
      if (this.annotationsPromise)
        return this.annotationsPromise;

      var promise = new PDFJS.LegacyPromise();
      this.annotationsPromise = promise;
      this.transport.getAnnotations(this.pageInfo.pageIndex);
      return promise;
    },
    
    render: function PDFPageProxy_render(params) {
      var stats = this.stats;
      stats.time('Overall');

      
      
      this.pendingDestroy = false;

      var renderingIntent = 'intent' in params ?
        (params.intent == 'print' ? 'print' : 'display') :
        'display';

      if (!this.intentStates[renderingIntent]) {
        this.intentStates[renderingIntent] = {};
      }
      var intentState = this.intentStates[renderingIntent];

      
      
      if (!intentState.displayReadyPromise) {
        intentState.receivingOperatorList = true;
        intentState.displayReadyPromise = new LegacyPromise();
        intentState.operatorList = {
          fnArray: [],
          argsArray: [],
          lastChunk: false
        };

        this.stats.time('Page Request');
        this.transport.messageHandler.send('RenderPageRequest', {
          pageIndex: this.pageNumber - 1,
          intent: renderingIntent
        });
      }

      var internalRenderTask = new InternalRenderTask(complete, params,
                                       this.objs, this.commonObjs,
                                       intentState.operatorList,
                                       this.pageNumber);
      if (!intentState.renderTasks) {
        intentState.renderTasks = [];
      }
      intentState.renderTasks.push(internalRenderTask);
      var renderTask = new RenderTask(internalRenderTask);

      var self = this;
      intentState.displayReadyPromise.then(
        function pageDisplayReadyPromise(transparency) {
          if (self.pendingDestroy) {
            complete();
            return;
          }
          stats.time('Rendering');
          internalRenderTask.initalizeGraphics(transparency);
          internalRenderTask.operatorListChanged();
        },
        function pageDisplayReadPromiseError(reason) {
          complete(reason);
        }
      );

      function complete(error) {
        var i = intentState.renderTasks.indexOf(internalRenderTask);
        if (i >= 0) {
          intentState.renderTasks.splice(i, 1);
        }

        if (self.cleanupAfterRender) {
          self.pendingDestroy = true;
        }
        self._tryDestroy();

        if (error) {
          renderTask.promise.reject(error);
        } else {
          renderTask.promise.resolve();
        }
        stats.timeEnd('Rendering');
        stats.timeEnd('Overall');
      }

      return renderTask;
    },
    
    getTextContent: function PDFPageProxy_getTextContent() {
      var promise = new PDFJS.LegacyPromise();
      this.transport.messageHandler.send('GetTextContent', {
          pageIndex: this.pageNumber - 1
        },
        function textContentCallback(textContent) {
          promise.resolve(textContent);
        }
      );
      return promise;
    },
    
    destroy: function PDFPageProxy_destroy() {
      this.pendingDestroy = true;
      this._tryDestroy();
    },
    
    _tryDestroy: function PDFPageProxy__destroy() {
      if (!this.pendingDestroy ||
          Object.keys(this.intentStates).some(function(intent) {
            var intentState = this.intentStates[intent];
            return intentState.renderTasks.length !== 0 ||
                   intentState.receivingOperatorList;
          }, this)) {
        return;
      }

      Object.keys(this.intentStates).forEach(function(intent) {
        delete this.intentStates[intent];
      }, this);
      this.objs.clear();
      this.pendingDestroy = false;
    },
    
    _startRenderPage: function PDFPageProxy_startRenderPage(transparency,
                                                            intent) {
      var intentState = this.intentStates[intent];
      intentState.displayReadyPromise.resolve(transparency);
    },
    
    _renderPageChunk: function PDFPageProxy_renderPageChunk(operatorListChunk,
                                                            intent) {
      var intentState = this.intentStates[intent];
      
      for (var i = 0, ii = operatorListChunk.length; i < ii; i++) {
        intentState.operatorList.fnArray.push(operatorListChunk.fnArray[i]);
        intentState.operatorList.argsArray.push(
          operatorListChunk.argsArray[i]);
      }
      intentState.operatorList.lastChunk = operatorListChunk.lastChunk;

      
      for (var i = 0; i < intentState.renderTasks.length; i++) {
        intentState.renderTasks[i].operatorListChanged();
      }

      if (operatorListChunk.lastChunk) {
        intentState.receivingOperatorList = false;
        this._tryDestroy();
      }
    }
  };
  return PDFPageProxy;
})();


var WorkerTransport = (function WorkerTransportClosure() {
  function WorkerTransport(workerInitializedPromise, workerReadyPromise,
      pdfDataRangeTransport, progressCallback) {
    this.pdfDataRangeTransport = pdfDataRangeTransport;

    this.workerReadyPromise = workerReadyPromise;
    this.progressCallback = progressCallback;
    this.commonObjs = new PDFObjects();

    this.pageCache = [];
    this.pagePromises = [];
    this.downloadInfoPromise = new PDFJS.LegacyPromise();
    this.passwordCallback = null;

    
    
    
    
    

    if (!globalScope.PDFJS.disableWorker && typeof Worker !== 'undefined') {
      var workerSrc = PDFJS.workerSrc;
      if (!workerSrc) {
        error('No PDFJS.workerSrc specified');
      }

      try {
        
        
        var worker = new Worker(workerSrc);
        var messageHandler = new MessageHandler('main', worker);
        this.messageHandler = messageHandler;

        messageHandler.on('test', function transportTest(data) {
          var supportTypedArray = data && data.supportTypedArray;
          if (supportTypedArray) {
            this.worker = worker;
            if (!data.supportTransfers) {
              PDFJS.postMessageTransfers = false;
            }
            this.setupMessageHandler(messageHandler);
            workerInitializedPromise.resolve();
          } else {
            globalScope.PDFJS.disableWorker = true;
            this.loadFakeWorkerFiles().then(function() {
              this.setupFakeWorker();
              workerInitializedPromise.resolve();
            }.bind(this));
          }
        }.bind(this));

        var testObj = new Uint8Array([PDFJS.postMessageTransfers ? 255 : 0]);
        
        
        try {
          messageHandler.send('test', testObj, null, [testObj.buffer]);
        } catch (ex) {
          info('Cannot use postMessage transfers');
          testObj[0] = 0;
          messageHandler.send('test', testObj);
        }
        return;
      } catch (e) {
        info('The worker has been disabled.');
      }
    }

    
    
    globalScope.PDFJS.disableWorker = true;
    this.loadFakeWorkerFiles().then(function() {
      this.setupFakeWorker();
      workerInitializedPromise.resolve();
    }.bind(this));
  }
  WorkerTransport.prototype = {
    destroy: function WorkerTransport_destroy() {
      this.pageCache = [];
      this.pagePromises = [];
      var self = this;
      this.messageHandler.send('Terminate', null, function () {
        FontLoader.clear();
        if (self.worker) {
          self.worker.terminate();
        }
      });
    },

    loadFakeWorkerFiles: function WorkerTransport_loadFakeWorkerFiles() {
      if (!PDFJS.fakeWorkerFilesLoadedPromise) {
        PDFJS.fakeWorkerFilesLoadedPromise = new LegacyPromise();
        
        
        

        Util.loadScript(PDFJS.workerSrc);









      }
      return PDFJS.fakeWorkerFilesLoadedPromise;
    },

    setupFakeWorker: function WorkerTransport_setupFakeWorker() {
      warn('Setting up fake worker.');
      
      var fakeWorker = {
        postMessage: function WorkerTransport_postMessage(obj) {
          fakeWorker.onmessage({data: obj});
        },
        terminate: function WorkerTransport_terminate() {}
      };

      var messageHandler = new MessageHandler('main', fakeWorker);
      this.setupMessageHandler(messageHandler);

      
      
      PDFJS.WorkerMessageHandler.setup(messageHandler);
    },

    setupMessageHandler:
      function WorkerTransport_setupMessageHandler(messageHandler) {
      this.messageHandler = messageHandler;

      function updatePassword(password) {
        messageHandler.send('UpdatePassword', password);
      }

      var pdfDataRangeTransport = this.pdfDataRangeTransport;
      if (pdfDataRangeTransport) {
        pdfDataRangeTransport.addRangeListener(function(begin, chunk) {
          messageHandler.send('OnDataRange', {
            begin: begin,
            chunk: chunk
          });
        });

        pdfDataRangeTransport.addProgressListener(function(loaded) {
          messageHandler.send('OnDataProgress', {
            loaded: loaded
          });
        });

        messageHandler.on('RequestDataRange',
          function transportDataRange(data) {
            pdfDataRangeTransport.requestDataRange(data.begin, data.end);
          }, this);
      }

      messageHandler.on('GetDoc', function transportDoc(data) {
        var pdfInfo = data.pdfInfo;
        this.numPages = data.pdfInfo.numPages;
        var pdfDocument = new PDFDocumentProxy(pdfInfo, this);
        this.pdfDocument = pdfDocument;
        this.workerReadyPromise.resolve(pdfDocument);
      }, this);

      messageHandler.on('NeedPassword', function transportPassword(data) {
        if (this.passwordCallback) {
          return this.passwordCallback(updatePassword,
                                       PasswordResponses.NEED_PASSWORD);
        }
        this.workerReadyPromise.reject(data.exception.message, data.exception);
      }, this);

      messageHandler.on('IncorrectPassword', function transportBadPass(data) {
        if (this.passwordCallback) {
          return this.passwordCallback(updatePassword,
                                       PasswordResponses.INCORRECT_PASSWORD);
        }
        this.workerReadyPromise.reject(data.exception.message, data.exception);
      }, this);

      messageHandler.on('InvalidPDF', function transportInvalidPDF(data) {
        this.workerReadyPromise.reject(data.exception.name, data.exception);
      }, this);

      messageHandler.on('MissingPDF', function transportMissingPDF(data) {
        this.workerReadyPromise.reject(data.exception.message, data.exception);
      }, this);

      messageHandler.on('UnknownError', function transportUnknownError(data) {
        this.workerReadyPromise.reject(data.exception.message, data.exception);
      }, this);

      messageHandler.on('DataLoaded', function transportPage(data) {
        this.downloadInfoPromise.resolve(data);
      }, this);

      messageHandler.on('GetPage', function transportPage(data) {
        var pageInfo = data.pageInfo;
        var page = new PDFPageProxy(pageInfo, this);
        this.pageCache[pageInfo.pageIndex] = page;
        var promise = this.pagePromises[pageInfo.pageIndex];
        promise.resolve(page);
      }, this);

      messageHandler.on('GetAnnotations', function transportAnnotations(data) {
        var annotations = data.annotations;
        var promise = this.pageCache[data.pageIndex].annotationsPromise;
        promise.resolve(annotations);
      }, this);

      messageHandler.on('StartRenderPage', function transportRender(data) {
        var page = this.pageCache[data.pageIndex];

        page.stats.timeEnd('Page Request');
        page._startRenderPage(data.transparency, data.intent);
      }, this);

      messageHandler.on('RenderPageChunk', function transportRender(data) {
        var page = this.pageCache[data.pageIndex];

        page._renderPageChunk(data.operatorList, data.intent);
      }, this);

      messageHandler.on('commonobj', function transportObj(data) {
        var id = data[0];
        var type = data[1];
        if (this.commonObjs.hasData(id))
          return;

        switch (type) {
          case 'Font':
            var exportedData = data[2];

            var font;
            if ('error' in exportedData) {
              var error = exportedData.error;
              warn('Error during font loading: ' + error);
              this.commonObjs.resolve(id, error);
              break;
            } else {
              font = new FontFace(exportedData);
            }

            FontLoader.bind(
              [font],
              function fontReady(fontObjs) {
                this.commonObjs.resolve(id, font);
              }.bind(this)
            );
            break;
          case 'FontPath':
            this.commonObjs.resolve(id, data[2]);
            break;
          default:
            error('Got unknown common object type ' + type);
        }
      }, this);

      messageHandler.on('obj', function transportObj(data) {
        var id = data[0];
        var pageIndex = data[1];
        var type = data[2];
        var pageProxy = this.pageCache[pageIndex];
        if (pageProxy.objs.hasData(id)) {
          return;
        }

        switch (type) {
          case 'JpegStream':
            var imageData = data[3];
            loadJpegStream(id, imageData, pageProxy.objs);
            break;
          case 'Image':
            var imageData = data[3];
            pageProxy.objs.resolve(id, imageData);

            
            var MAX_IMAGE_SIZE_TO_STORE = 8000000;
            if ('data' in imageData &&
                imageData.data.length > MAX_IMAGE_SIZE_TO_STORE) {
              pageProxy.cleanupAfterRender = true;
            }
            break;
          default:
            error('Got unknown object type ' + type);
        }
      }, this);

      messageHandler.on('DocProgress', function transportDocProgress(data) {
        if (this.progressCallback) {
          this.progressCallback({
            loaded: data.loaded,
            total: data.total
          });
        }
      }, this);

      messageHandler.on('DocError', function transportDocError(data) {
        this.workerReadyPromise.reject(data);
      }, this);

      messageHandler.on('PageError', function transportError(data, intent) {
        var page = this.pageCache[data.pageNum - 1];
        var intentState = page.intentStates[intent];
        if (intentState.displayReadyPromise)
          intentState.displayReadyPromise.reject(data.error);
        else
          error(data.error);
      }, this);

      messageHandler.on('JpegDecode', function(data, deferred) {
        var imageUrl = data[0];
        var components = data[1];
        if (components != 3 && components != 1)
          error('Only 3 component or 1 component can be returned');

        var img = new Image();
        img.onload = (function messageHandler_onloadClosure() {
          var width = img.width;
          var height = img.height;
          var size = width * height;
          var rgbaLength = size * 4;
          var buf = new Uint8Array(size * components);
          var tmpCanvas = createScratchCanvas(width, height);
          var tmpCtx = tmpCanvas.getContext('2d');
          tmpCtx.drawImage(img, 0, 0);
          var data = tmpCtx.getImageData(0, 0, width, height).data;

          if (components == 3) {
            for (var i = 0, j = 0; i < rgbaLength; i += 4, j += 3) {
              buf[j] = data[i];
              buf[j + 1] = data[i + 1];
              buf[j + 2] = data[i + 2];
            }
          } else if (components == 1) {
            for (var i = 0, j = 0; i < rgbaLength; i += 4, j++) {
              buf[j] = data[i];
            }
          }
          deferred.resolve({ data: buf, width: width, height: height});
        }).bind(this);
        img.src = imageUrl;
      });
    },

    fetchDocument: function WorkerTransport_fetchDocument(source) {
      source.disableAutoFetch = PDFJS.disableAutoFetch;
      source.chunkedViewerLoading = !!this.pdfDataRangeTransport;
      this.messageHandler.send('GetDocRequest', {
        source: source,
        disableRange: PDFJS.disableRange,
        maxImageSize: PDFJS.maxImageSize,
        disableFontFace: PDFJS.disableFontFace,
        disableCreateObjectURL: PDFJS.disableCreateObjectURL,
        verbosity: PDFJS.verbosity
      });
    },

    getData: function WorkerTransport_getData(promise) {
      this.messageHandler.send('GetData', null, function(data) {
        promise.resolve(data);
      });
    },

    getPage: function WorkerTransport_getPage(pageNumber, promise) {
      if (pageNumber <= 0 || pageNumber > this.numPages ||
          (pageNumber|0) !== pageNumber) {
        var pagePromise = new PDFJS.LegacyPromise();
        pagePromise.reject(new Error('Invalid page request'));
        return pagePromise;
      }

      var pageIndex = pageNumber - 1;
      if (pageIndex in this.pagePromises)
        return this.pagePromises[pageIndex];
      var promise = new PDFJS.LegacyPromise();
      this.pagePromises[pageIndex] = promise;
      this.messageHandler.send('GetPageRequest', { pageIndex: pageIndex });
      return promise;
    },

    getPageIndex: function WorkerTransport_getPageIndexByRef(ref) {
      var promise = new PDFJS.LegacyPromise();
      this.messageHandler.send('GetPageIndex', { ref: ref },
        function (pageIndex) {
          promise.resolve(pageIndex);
        }
      );
      return promise;
    },

    getAnnotations: function WorkerTransport_getAnnotations(pageIndex) {
      this.messageHandler.send('GetAnnotationsRequest',
        { pageIndex: pageIndex });
    },

    getDestinations: function WorkerTransport_getDestinations() {
      var promise = new PDFJS.LegacyPromise();
      this.messageHandler.send('GetDestinations', null,
        function transportDestinations(destinations) {
          promise.resolve(destinations);
        }
      );
      return promise;
    },

    startCleanup: function WorkerTransport_startCleanup() {
      this.messageHandler.send('Cleanup', null,
        function endCleanup() {
          for (var i = 0, ii = this.pageCache.length; i < ii; i++) {
            var page = this.pageCache[i];
            if (page) {
              page.destroy();
            }
          }
          this.commonObjs.clear();
          FontLoader.clear();
        }.bind(this)
      );
    }
  };
  return WorkerTransport;

})();


var PDFObjects = (function PDFObjectsClosure() {
  function PDFObjects() {
    this.objs = {};
  }

  PDFObjects.prototype = {
    
    ensureObj: function PDFObjects_ensureObj(objId) {
      if (this.objs[objId])
        return this.objs[objId];

      var obj = {
        promise: new LegacyPromise(),
        data: null,
        resolved: false
      };
      this.objs[objId] = obj;

      return obj;
    },

    
    get: function PDFObjects_get(objId, callback) {
      
      
      if (callback) {
        this.ensureObj(objId).promise.then(callback);
        return null;
      }

      
      
      var obj = this.objs[objId];

      
      
      if (!obj || !obj.resolved)
        error('Requesting object that isn\'t resolved yet ' + objId);

      return obj.data;
    },

    
    resolve: function PDFObjects_resolve(objId, data) {
      var obj = this.ensureObj(objId);

      obj.resolved = true;
      obj.data = data;
      obj.promise.resolve(data);
    },

    isResolved: function PDFObjects_isResolved(objId) {
      var objs = this.objs;

      if (!objs[objId]) {
        return false;
      } else {
        return objs[objId].resolved;
      }
    },

    hasData: function PDFObjects_hasData(objId) {
      return this.isResolved(objId);
    },

    
    getData: function PDFObjects_getData(objId) {
      var objs = this.objs;
      if (!objs[objId] || !objs[objId].resolved) {
        return null;
      } else {
        return objs[objId].data;
      }
    },

    clear: function PDFObjects_clear() {
      this.objs = {};
    }
  };
  return PDFObjects;
})();


var RenderTask = (function RenderTaskClosure() {
  function RenderTask(internalRenderTask) {
    this.internalRenderTask = internalRenderTask;
    
    this.promise = new PDFJS.LegacyPromise();
  }

  RenderTask.prototype =  {
    
    cancel: function RenderTask_cancel() {
      this.internalRenderTask.cancel();
      this.promise.reject(new Error('Rendering is cancelled'));
    }
  };

  return RenderTask;
})();


var InternalRenderTask = (function InternalRenderTaskClosure() {

  function InternalRenderTask(callback, params, objs, commonObjs, operatorList,
                              pageNumber) {
    this.callback = callback;
    this.params = params;
    this.objs = objs;
    this.commonObjs = commonObjs;
    this.operatorListIdx = null;
    this.operatorList = operatorList;
    this.pageNumber = pageNumber;
    this.running = false;
    this.graphicsReadyCallback = null;
    this.graphicsReady = false;
    this.cancelled = false;
  }

  InternalRenderTask.prototype = {

    initalizeGraphics:
        function InternalRenderTask_initalizeGraphics(transparency) {

      if (this.cancelled) {
        return;
      }
      if (PDFJS.pdfBug && 'StepperManager' in globalScope &&
          globalScope.StepperManager.enabled) {
        this.stepper = globalScope.StepperManager.create(this.pageNumber - 1);
        this.stepper.init(this.operatorList);
        this.stepper.nextBreakPoint = this.stepper.getNextBreakPoint();
      }

      var params = this.params;
      this.gfx = new CanvasGraphics(params.canvasContext, this.commonObjs,
                                    this.objs, params.textLayer,
                                    params.imageLayer);

      this.gfx.beginDrawing(params.viewport, transparency);
      this.operatorListIdx = 0;
      this.graphicsReady = true;
      if (this.graphicsReadyCallback) {
        this.graphicsReadyCallback();
      }
    },

    cancel: function InternalRenderTask_cancel() {
      this.running = false;
      this.cancelled = true;
      this.callback('cancelled');
    },

    operatorListChanged: function InternalRenderTask_operatorListChanged() {
      if (!this.graphicsReady) {
        if (!this.graphicsReadyCallback) {
          this.graphicsReadyCallback = this._continue.bind(this);
        }
        return;
      }

      if (this.stepper) {
        this.stepper.updateOperatorList(this.operatorList);
      }

      if (this.running) {
        return;
      }
      this._continue();
    },

    _continue: function InternalRenderTask__continue() {
      this.running = true;
      if (this.cancelled) {
        return;
      }
      if (this.params.continueCallback) {
        this.params.continueCallback(this._next.bind(this));
      } else {
        this._next();
      }
    },

    _next: function InternalRenderTask__next() {
      if (this.cancelled) {
        return;
      }
      this.operatorListIdx = this.gfx.executeOperatorList(this.operatorList,
                                        this.operatorListIdx,
                                        this._continue.bind(this),
                                        this.stepper);
      if (this.operatorListIdx === this.operatorList.argsArray.length) {
        this.running = false;
        if (this.operatorList.lastChunk) {
          this.gfx.endDrawing();
          this.callback();
        }
      }
    }

  };

  return InternalRenderTask;
})();


var Metadata = PDFJS.Metadata = (function MetadataClosure() {
  function fixMetadata(meta) {
    return meta.replace(/>\\376\\377([^<]+)/g, function(all, codes) {
      var bytes = codes.replace(/\\([0-3])([0-7])([0-7])/g,
                                function(code, d1, d2, d3) {
        return String.fromCharCode(d1 * 64 + d2 * 8 + d3 * 1);
      });
      var chars = '';
      for (var i = 0; i < bytes.length; i += 2) {
        var code = bytes.charCodeAt(i) * 256 + bytes.charCodeAt(i + 1);
        chars += code >= 32 && code < 127 && code != 60 && code != 62 &&
          code != 38 && false ? String.fromCharCode(code) :
          '&#x' + (0x10000 + code).toString(16).substring(1) + ';';
      }
      return '>' + chars;
    });
  }

  function Metadata(meta) {
    if (typeof meta === 'string') {
      
      meta = fixMetadata(meta);

      var parser = new DOMParser();
      meta = parser.parseFromString(meta, 'application/xml');
    } else if (!(meta instanceof Document)) {
      error('Metadata: Invalid metadata object');
    }

    this.metaDocument = meta;
    this.metadata = {};
    this.parse();
  }

  Metadata.prototype = {
    parse: function Metadata_parse() {
      var doc = this.metaDocument;
      var rdf = doc.documentElement;

      if (rdf.nodeName.toLowerCase() !== 'rdf:rdf') { 
        rdf = rdf.firstChild;
        while (rdf && rdf.nodeName.toLowerCase() !== 'rdf:rdf') {
          rdf = rdf.nextSibling;
        }
      }

      var nodeName = (rdf) ? rdf.nodeName.toLowerCase() : null;
      if (!rdf || nodeName !== 'rdf:rdf' || !rdf.hasChildNodes()) {
        return;
      }

      var children = rdf.childNodes, desc, entry, name, i, ii, length, iLength;
      for (i = 0, length = children.length; i < length; i++) {
        desc = children[i];
        if (desc.nodeName.toLowerCase() !== 'rdf:description') {
          continue;
        }

        for (ii = 0, iLength = desc.childNodes.length; ii < iLength; ii++) {
          if (desc.childNodes[ii].nodeName.toLowerCase() !== '#text') {
            entry = desc.childNodes[ii];
            name = entry.nodeName.toLowerCase();
            this.metadata[name] = entry.textContent.trim();
          }
        }
      }
    },

    get: function Metadata_get(name) {
      return this.metadata[name] || null;
    },

    has: function Metadata_has(name) {
      return typeof this.metadata[name] !== 'undefined';
    }
  };

  return Metadata;
})();






var MIN_FONT_SIZE = 16;

var COMPILE_TYPE3_GLYPHS = true;

function createScratchCanvas(width, height) {
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function addContextCurrentTransform(ctx) {
  
  if (!ctx.mozCurrentTransform) {
    
    ctx._scaleX = ctx._scaleX || 1.0;
    ctx._scaleY = ctx._scaleY || 1.0;
    ctx._originalSave = ctx.save;
    ctx._originalRestore = ctx.restore;
    ctx._originalRotate = ctx.rotate;
    ctx._originalScale = ctx.scale;
    ctx._originalTranslate = ctx.translate;
    ctx._originalTransform = ctx.transform;
    ctx._originalSetTransform = ctx.setTransform;

    ctx._transformMatrix = [ctx._scaleX, 0, 0, ctx._scaleY, 0, 0];
    ctx._transformStack = [];

    Object.defineProperty(ctx, 'mozCurrentTransform', {
      get: function getCurrentTransform() {
        return this._transformMatrix;
      }
    });

    Object.defineProperty(ctx, 'mozCurrentTransformInverse', {
      get: function getCurrentTransformInverse() {
        
        
        

        var m = this._transformMatrix;
        var a = m[0], b = m[1], c = m[2], d = m[3], e = m[4], f = m[5];

        var ad_bc = a * d - b * c;
        var bc_ad = b * c - a * d;

        return [
          d / ad_bc,
          b / bc_ad,
          c / bc_ad,
          a / ad_bc,
          (d * e - c * f) / bc_ad,
          (b * e - a * f) / ad_bc
        ];
      }
    });

    ctx.save = function ctxSave() {
      var old = this._transformMatrix;
      this._transformStack.push(old);
      this._transformMatrix = old.slice(0, 6);

      this._originalSave();
    };

    ctx.restore = function ctxRestore() {
      var prev = this._transformStack.pop();
      if (prev) {
        this._transformMatrix = prev;
        this._originalRestore();
      }
    };

    ctx.translate = function ctxTranslate(x, y) {
      var m = this._transformMatrix;
      m[4] = m[0] * x + m[2] * y + m[4];
      m[5] = m[1] * x + m[3] * y + m[5];

      this._originalTranslate(x, y);
    };

    ctx.scale = function ctxScale(x, y) {
      var m = this._transformMatrix;
      m[0] = m[0] * x;
      m[1] = m[1] * x;
      m[2] = m[2] * y;
      m[3] = m[3] * y;

      this._originalScale(x, y);
    };

    ctx.transform = function ctxTransform(a, b, c, d, e, f) {
      var m = this._transformMatrix;
      this._transformMatrix = [
        m[0] * a + m[2] * b,
        m[1] * a + m[3] * b,
        m[0] * c + m[2] * d,
        m[1] * c + m[3] * d,
        m[0] * e + m[2] * f + m[4],
        m[1] * e + m[3] * f + m[5]
      ];

      ctx._originalTransform(a, b, c, d, e, f);
    };

    ctx.setTransform = function ctxSetTransform(a, b, c, d, e, f) {
      this._transformMatrix = [a, b, c, d, e, f];

      ctx._originalSetTransform(a, b, c, d, e, f);
    };

    ctx.rotate = function ctxRotate(angle) {
      var cosValue = Math.cos(angle);
      var sinValue = Math.sin(angle);

      var m = this._transformMatrix;
      this._transformMatrix = [
        m[0] * cosValue + m[2] * sinValue,
        m[1] * cosValue + m[3] * sinValue,
        m[0] * (-sinValue) + m[2] * cosValue,
        m[1] * (-sinValue) + m[3] * cosValue,
        m[4],
        m[5]
      ];

      this._originalRotate(angle);
    };
  }
}

var CachedCanvases = (function CachedCanvasesClosure() {
  var cache = {};
  return {
    getCanvas: function CachedCanvases_getCanvas(id, width, height,
                                                 trackTransform) {
      var canvasEntry;
      if (id in cache) {
        canvasEntry = cache[id];
        canvasEntry.canvas.width = width;
        canvasEntry.canvas.height = height;
        
        canvasEntry.context.setTransform(1, 0, 0, 1, 0, 0);
      } else {
        var canvas = createScratchCanvas(width, height);
        var ctx = canvas.getContext('2d');
        if (trackTransform) {
          addContextCurrentTransform(ctx);
        }
        cache[id] = canvasEntry = {canvas: canvas, context: ctx};
      }
      return canvasEntry;
    },
    clear: function () {
      cache = {};
    }
  };
})();

function compileType3Glyph(imgData) {
  var POINT_TO_PROCESS_LIMIT = 1000;

  var width = imgData.width, height = imgData.height;
  var i, j, j0, width1 = width + 1;
  var points = new Uint8Array(width1 * (height + 1));
  var POINT_TYPES =
      new Uint8Array([0, 2, 4, 0, 1, 0, 5, 4, 8, 10, 0, 8, 0, 2, 1, 0]);

  
  var lineSize = (width + 7) & ~7, data0 = imgData.data;
  var data = new Uint8Array(lineSize * height), pos = 0, ii;
  for (i = 0, ii = data0.length; i < ii; i++) {
    var mask = 128, elem = data0[i];
    while (mask > 0) {
      data[pos++] = (elem & mask) ? 0 : 255;
      mask >>= 1;
    }
  }

  
  
  
  
  
  
  
  
  
  
  var count = 0;
  pos = 0;
  if (data[pos] !== 0) {
    points[0] = 1;
    ++count;
  }
  for (j = 1; j < width; j++) {
    if (data[pos] !== data[pos + 1]) {
      points[j] = data[pos] ? 2 : 1;
      ++count;
    }
    pos++;
  }
  if (data[pos] !== 0) {
    points[j] = 2;
    ++count;
  }
  for (i = 1; i < height; i++) {
    pos = i * lineSize;
    j0 = i * width1;
    if (data[pos - lineSize] !== data[pos]) {
      points[j0] = data[pos] ? 1 : 8;
      ++count;
    }
    
    
    var sum = (data[pos] ? 4 : 0) + (data[pos - lineSize] ? 8 : 0);
    for (j = 1; j < width; j++) {
      sum = (sum >> 2) + (data[pos + 1] ? 4 : 0) +
            (data[pos - lineSize + 1] ? 8 : 0);
      if (POINT_TYPES[sum]) {
        points[j0 + j] = POINT_TYPES[sum];
        ++count;
      }
      pos++;
    }
    if (data[pos - lineSize] !== data[pos]) {
      points[j0 + j] = data[pos] ? 2 : 4;
      ++count;
    }

    if (count > POINT_TO_PROCESS_LIMIT) {
      return null;
    }
  }

  pos = lineSize * (height - 1);
  j0 = i * width1;
  if (data[pos] !== 0) {
    points[j0] = 8;
    ++count;
  }
  for (j = 1; j < width; j++) {
    if (data[pos] !== data[pos + 1]) {
      points[j0 + j] = data[pos] ? 4 : 8;
      ++count;
    }
    pos++;
  }
  if (data[pos] !== 0) {
    points[j0 + j] = 4;
    ++count;
  }
  if (count > POINT_TO_PROCESS_LIMIT) {
    return null;
  }

  
  var steps = new Int32Array([0, width1, -1, 0, -width1, 0, 0, 0, 1]);
  var outlines = [];
  for (i = 0; count && i <= height; i++) {
    var p = i * width1;
    var end = p + width;
    while (p < end && !points[p]) {
      p++;
    }
    if (p === end) {
      continue;
    }
    var coords = [p % width1, i];

    var type = points[p], p0 = p, pp;
    do {
      var step = steps[type];
      do { p += step; } while (!points[p]);

      pp = points[p];
      if (pp !== 5 && pp !== 10) {
        
        type = pp;
        
        points[p] = 0;
      } else { 
        
        type = pp & ((0x33 * type) >> 4);
        
        points[p] &= (type >> 2 | type << 2);
      }

      coords.push(p % width1);
      coords.push((p / width1) | 0);
      --count;
    } while (p0 !== p);
    outlines.push(coords);
    --i;
  }

  var drawOutline = function(c) {
    c.save();
    
    c.scale(1 / width, -1 / height);
    c.translate(0, -height);
    c.beginPath();
    for (var i = 0, ii = outlines.length; i < ii; i++) {
      var o = outlines[i];
      c.moveTo(o[0], o[1]);
      for (var j = 2, jj = o.length; j < jj; j += 2) {
        c.lineTo(o[j], o[j+1]);
      }
    }
    c.fill();
    c.beginPath();
    c.restore();
  };

  return drawOutline;
}

var CanvasExtraState = (function CanvasExtraStateClosure() {
  function CanvasExtraState(old) {
    
    this.alphaIsShape = false;
    this.fontSize = 0;
    this.fontSizeScale = 1;
    this.textMatrix = IDENTITY_MATRIX;
    this.fontMatrix = FONT_IDENTITY_MATRIX;
    this.leading = 0;
    
    this.x = 0;
    this.y = 0;
    
    this.lineX = 0;
    this.lineY = 0;
    
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this.textHScale = 1;
    this.textRenderingMode = TextRenderingMode.FILL;
    this.textRise = 0;
    
    this.fillColorSpace = ColorSpace.singletons.gray;
    this.fillColorSpaceObj = null;
    this.strokeColorSpace = ColorSpace.singletons.gray;
    this.strokeColorSpaceObj = null;
    this.fillColorObj = null;
    this.strokeColorObj = null;
    
    this.fillColor = '#000000';
    this.strokeColor = '#000000';
    
    this.fillAlpha = 1;
    this.strokeAlpha = 1;
    this.lineWidth = 1;
    this.activeSMask = null; 

    this.old = old;
  }

  CanvasExtraState.prototype = {
    clone: function CanvasExtraState_clone() {
      return Object.create(this);
    },
    setCurrentPoint: function CanvasExtraState_setCurrentPoint(x, y) {
      this.x = x;
      this.y = y;
    }
  };
  return CanvasExtraState;
})();

var CanvasGraphics = (function CanvasGraphicsClosure() {
  
  
  var EXECUTION_TIME = 15;

  function CanvasGraphics(canvasCtx, commonObjs, objs, textLayer, imageLayer) {
    this.ctx = canvasCtx;
    this.current = new CanvasExtraState();
    this.stateStack = [];
    this.pendingClip = null;
    this.pendingEOFill = false;
    this.res = null;
    this.xobjs = null;
    this.commonObjs = commonObjs;
    this.objs = objs;
    this.textLayer = textLayer;
    this.imageLayer = imageLayer;
    this.groupStack = [];
    this.processingType3 = null;
    
    
    this.baseTransform = null;
    this.baseTransformStack = [];
    this.groupLevel = 0;
    this.smaskStack = [];
    this.smaskCounter = 0;
    this.tempSMask = null;
    if (canvasCtx) {
      addContextCurrentTransform(canvasCtx);
    }
  }

  function putBinaryImageData(ctx, imgData) {
    if (typeof ImageData !== 'undefined' && imgData instanceof ImageData) {
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    
    
    
    
    
    
    
    
    
    

    var height = imgData.height, width = imgData.width;
    var fullChunkHeight = 16;
    var fracChunks = height / fullChunkHeight;
    var fullChunks = Math.floor(fracChunks);
    var totalChunks = Math.ceil(fracChunks);
    var partialChunkHeight = height - fullChunks * fullChunkHeight;

    var chunkImgData = ctx.createImageData(width, fullChunkHeight);
    var srcPos = 0;
    var src = imgData.data;
    var dest = chunkImgData.data;

    
    

    if (imgData.kind === ImageKind.GRAYSCALE_1BPP) {
      
      var destDataLength = dest.length;
      var srcLength = src.byteLength;
      for (var i = 3; i < destDataLength; i += 4) {
        dest[i] = 255;
      }
      for (var i = 0; i < totalChunks; i++) {
        var thisChunkHeight =
          (i < fullChunks) ? fullChunkHeight : partialChunkHeight;
        var destPos = 0;
        for (var j = 0; j < thisChunkHeight; j++) {
          var mask = 0;
          var srcByte = 0;
          for (var k = 0; k < width; k++, destPos += 4) {
            if (mask === 0) {
              if (srcPos >= srcLength) {
                break;
              }
              srcByte = src[srcPos++];
              mask = 128;
            }

            if ((srcByte & mask)) {
              dest[destPos] = 255;
              dest[destPos + 1] = 255;
              dest[destPos + 2] = 255;
            } else {
              dest[destPos] = 0;
              dest[destPos + 1] = 0;
              dest[destPos + 2] = 0;
            }

            mask >>= 1;
          }
        }
        if (destPos < destDataLength) {
          
          destPos += 3;
          do {
            dest[destPos] = 0;
            destPos += 4;
          } while (destPos < destDataLength);
        }

        ctx.putImageData(chunkImgData, 0, i * fullChunkHeight);
      }

    } else if (imgData.kind === ImageKind.RGBA_32BPP) {
      
      var haveSetAndSubarray = 'set' in dest && 'subarray' in src;

      for (var i = 0; i < totalChunks; i++) {
        var thisChunkHeight =
          (i < fullChunks) ? fullChunkHeight : partialChunkHeight;
        var elemsInThisChunk = imgData.width * thisChunkHeight * 4;
        if (haveSetAndSubarray) {
          dest.set(src.subarray(srcPos, srcPos + elemsInThisChunk));
          srcPos += elemsInThisChunk;
        } else {
          for (var j = 0; j < elemsInThisChunk; j++) {
            dest[j] = src[srcPos++];
          }
        }
        ctx.putImageData(chunkImgData, 0, i * fullChunkHeight);
      }

    } else if (imgData.kind === ImageKind.RGB_24BPP) {
      
      for (var i = 0; i < totalChunks; i++) {
        var thisChunkHeight =
          (i < fullChunks) ? fullChunkHeight : partialChunkHeight;
        var elemsInThisChunk = imgData.width * thisChunkHeight * 3;
        var destPos = 0;
        for (var j = 0; j < elemsInThisChunk; j += 3) {
          dest[destPos++] = src[srcPos++];
          dest[destPos++] = src[srcPos++];
          dest[destPos++] = src[srcPos++];
          dest[destPos++] = 255;
        }
        ctx.putImageData(chunkImgData, 0, i * fullChunkHeight);
      }

    } else {
        error('bad image kind: ' + imgData.kind);
    }
  }

  function putBinaryImageMask(ctx, imgData) {
    var height = imgData.height, width = imgData.width;
    var fullChunkHeight = 16;
    var fracChunks = height / fullChunkHeight;
    var fullChunks = Math.floor(fracChunks);
    var totalChunks = Math.ceil(fracChunks);
    var partialChunkHeight = height - fullChunks * fullChunkHeight;

    var chunkImgData = ctx.createImageData(width, fullChunkHeight);
    var srcPos = 0;
    var src = imgData.data;
    var dest = chunkImgData.data;

    for (var i = 0; i < totalChunks; i++) {
      var thisChunkHeight =
        (i < fullChunks) ? fullChunkHeight : partialChunkHeight;

      
      
      var destPos = 3; 
      for (var j = 0; j < thisChunkHeight; j++) {
        var mask = 0;
        for (var k = 0; k < width; k++) {
          if (!mask) {
            var elem = src[srcPos++];
            mask = 128;
          }
          dest[destPos] = (elem & mask) ? 0 : 255;
          destPos += 4;
          mask >>= 1;
        }
      }
      ctx.putImageData(chunkImgData, 0, i * fullChunkHeight);
    }
  }

  function copyCtxState(sourceCtx, destCtx) {
    var properties = ['strokeStyle', 'fillStyle', 'fillRule', 'globalAlpha',
                      'lineWidth', 'lineCap', 'lineJoin', 'miterLimit',
                      'globalCompositeOperation', 'font'];
    for (var i = 0, ii = properties.length; i < ii; i++) {
      var property = properties[i];
      if (property in sourceCtx) {
        destCtx[property] = sourceCtx[property];
      }
    }
    if ('setLineDash' in sourceCtx) {
      destCtx.setLineDash(sourceCtx.getLineDash());
      destCtx.lineDashOffset =  sourceCtx.lineDashOffset;
    } else if ('mozDash' in sourceCtx) {
      destCtx.mozDash = sourceCtx.mozDash;
      destCtx.mozDashOffset = sourceCtx.mozDashOffset;
    }
  }

  function composeSMask(ctx, smask, layerCtx) {
    var mask = smask.canvas;
    var maskCtx = smask.context;
    var width = mask.width, height = mask.height;

    var addBackdropFn;
    if (smask.backdrop) {
      var cs = smask.colorSpace || ColorSpace.singletons.rgb;
      var backdrop = cs.getRgb(smask.backdrop, 0);
      addBackdropFn = function (r0, g0, b0, bytes) {
        var length = bytes.length;
        for (var i = 3; i < length; i += 4) {
          var alpha = bytes[i] / 255;
          if (alpha === 0) {
            bytes[i - 3] = r0;
            bytes[i - 2] = g0;
            bytes[i - 1] = b0;
          } else if (alpha < 1) {
            var alpha_ = 1 - alpha;
            bytes[i - 3] = (bytes[i - 3] * alpha + r0 * alpha_) | 0;
            bytes[i - 2] = (bytes[i - 2] * alpha + g0 * alpha_) | 0;
            bytes[i - 1] = (bytes[i - 1] * alpha + b0 * alpha_) | 0;
          }
        }
      }.bind(null, backdrop[0], backdrop[1], backdrop[2]);
    } else {
      addBackdropFn = function () {};
    }

    var composeFn;
    if (smask.subtype === 'Luminosity') {
      composeFn = function (maskDataBytes, layerDataBytes) {
        var length = maskDataBytes.length;
        for (var i = 3; i < length; i += 4) {
          var y = ((maskDataBytes[i - 3] * 77) +     
                   (maskDataBytes[i - 2] * 152) +    
                   (maskDataBytes[i - 1] * 28)) | 0; 
          layerDataBytes[i] = (layerDataBytes[i] * y) >> 16;
        }
      };
    } else {
      composeFn = function (maskDataBytes, layerDataBytes) {
        var length = maskDataBytes.length;
        for (var i = 3; i < length; i += 4) {
          var alpha = maskDataBytes[i];
          layerDataBytes[i] = (layerDataBytes[i] * alpha / 255) | 0;
        }
      };
    }

    
    var chunkSize = 16;
    for (var row = 0; row < height; row += chunkSize) {
      var chunkHeight = Math.min(chunkSize, height - row);
      var maskData = maskCtx.getImageData(0, row, width, chunkHeight);
      var layerData = layerCtx.getImageData(0, row, width, chunkHeight);

      addBackdropFn(maskData.data);
      composeFn(maskData.data, layerData.data);

      maskCtx.putImageData(layerData, 0, row);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(mask, smask.offsetX, smask.offsetY);
  }

  var LINE_CAP_STYLES = ['butt', 'round', 'square'];
  var LINE_JOIN_STYLES = ['miter', 'round', 'bevel'];
  var NORMAL_CLIP = {};
  var EO_CLIP = {};

  CanvasGraphics.prototype = {

    beginDrawing: function CanvasGraphics_beginDrawing(viewport, transparency) {
      
      
      
      
      
      var width = this.ctx.canvas.width;
      var height = this.ctx.canvas.height;
      if (transparency) {
        this.ctx.clearRect(0, 0, width, height);
      } else {
        this.ctx.mozOpaque = true;
        this.ctx.save();
        this.ctx.fillStyle = 'rgb(255, 255, 255)';
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.restore();
      }

      var transform = viewport.transform;

      this.ctx.save();
      this.ctx.transform.apply(this.ctx, transform);

      this.baseTransform = this.ctx.mozCurrentTransform.slice();

      if (this.textLayer) {
        this.textLayer.beginLayout();
      }
      if (this.imageLayer) {
        this.imageLayer.beginLayout();
      }
    },

    executeOperatorList: function CanvasGraphics_executeOperatorList(
                                    operatorList,
                                    executionStartIdx, continueCallback,
                                    stepper) {
      var argsArray = operatorList.argsArray;
      var fnArray = operatorList.fnArray;
      var i = executionStartIdx || 0;
      var argsArrayLen = argsArray.length;

      
      if (argsArrayLen == i) {
        return i;
      }

      var executionEndIdx;
      var endTime = Date.now() + EXECUTION_TIME;

      var commonObjs = this.commonObjs;
      var objs = this.objs;
      var fnId;
      var deferred = Promise.resolve();

      while (true) {
        if (stepper && i === stepper.nextBreakPoint) {
          stepper.breakIt(i, continueCallback);
          return i;
        }

        fnId = fnArray[i];

        if (fnId !== OPS.dependency) {
          this[fnId].apply(this, argsArray[i]);
        } else {
          var deps = argsArray[i];
          for (var n = 0, nn = deps.length; n < nn; n++) {
            var depObjId = deps[n];
            var common = depObjId.substring(0, 2) == 'g_';

            
            
            if (!common && !objs.isResolved(depObjId)) {
              objs.get(depObjId, continueCallback);
              return i;
            }
            if (common && !commonObjs.isResolved(depObjId)) {
              commonObjs.get(depObjId, continueCallback);
              return i;
            }
          }
        }

        i++;

        
        if (i == argsArrayLen) {
          return i;
        }

        
        
        
        if (continueCallback && Date.now() > endTime) {
          deferred.then(continueCallback);
          return i;
        }

        
        
      }
    },

    endDrawing: function CanvasGraphics_endDrawing() {
      this.ctx.restore();
      CachedCanvases.clear();

      if (this.textLayer) {
        this.textLayer.endLayout();
      }
      if (this.imageLayer) {
        this.imageLayer.endLayout();
      }
    },

    
    setLineWidth: function CanvasGraphics_setLineWidth(width) {
      this.current.lineWidth = width;
      this.ctx.lineWidth = width;
    },
    setLineCap: function CanvasGraphics_setLineCap(style) {
      this.ctx.lineCap = LINE_CAP_STYLES[style];
    },
    setLineJoin: function CanvasGraphics_setLineJoin(style) {
      this.ctx.lineJoin = LINE_JOIN_STYLES[style];
    },
    setMiterLimit: function CanvasGraphics_setMiterLimit(limit) {
      this.ctx.miterLimit = limit;
    },
    setDash: function CanvasGraphics_setDash(dashArray, dashPhase) {
      var ctx = this.ctx;
      if ('setLineDash' in ctx) {
        ctx.setLineDash(dashArray);
        ctx.lineDashOffset = dashPhase;
      } else {
        ctx.mozDash = dashArray;
        ctx.mozDashOffset = dashPhase;
      }
    },
    setRenderingIntent: function CanvasGraphics_setRenderingIntent(intent) {
      
      
      
    },
    setFlatness: function CanvasGraphics_setFlatness(flatness) {
      
      
    },
    setGState: function CanvasGraphics_setGState(states) {
      for (var i = 0, ii = states.length; i < ii; i++) {
        var state = states[i];
        var key = state[0];
        var value = state[1];

        switch (key) {
          case 'LW':
            this.setLineWidth(value);
            break;
          case 'LC':
            this.setLineCap(value);
            break;
          case 'LJ':
            this.setLineJoin(value);
            break;
          case 'ML':
            this.setMiterLimit(value);
            break;
          case 'D':
            this.setDash(value[0], value[1]);
            break;
          case 'RI':
            this.setRenderingIntent(value);
            break;
          case 'FL':
            this.setFlatness(value);
            break;
          case 'Font':
            this.setFont(value[0], value[1]);
            break;
          case 'CA':
            this.current.strokeAlpha = state[1];
            break;
          case 'ca':
            this.current.fillAlpha = state[1];
            this.ctx.globalAlpha = state[1];
            break;
          case 'BM':
            if (value && value.name && (value.name !== 'Normal')) {
              var mode = value.name.replace(/([A-Z])/g,
                function(c) {
                  return '-' + c.toLowerCase();
                }
              ).substring(1);
              this.ctx.globalCompositeOperation = mode;
              if (this.ctx.globalCompositeOperation !== mode) {
                warn('globalCompositeOperation "' + mode +
                     '" is not supported');
              }
            } else {
              this.ctx.globalCompositeOperation = 'source-over';
            }
            break;
          case 'SMask':
            if (this.current.activeSMask) {
              this.endSMaskGroup();
            }
            this.current.activeSMask = value ? this.tempSMask : null;
            if (this.current.activeSMask) {
              this.beginSMaskGroup();
            }
            this.tempSMask = null;
            break;
        }
      }
    },
    beginSMaskGroup: function CanvasGraphics_beginSMaskGroup() {

      var activeSMask = this.current.activeSMask;
      var drawnWidth = activeSMask.canvas.width;
      var drawnHeight = activeSMask.canvas.height;
      var cacheId = 'smaskGroupAt' + this.groupLevel;
      var scratchCanvas = CachedCanvases.getCanvas(
        cacheId, drawnWidth, drawnHeight, true);

      var currentCtx = this.ctx;
      var currentTransform = currentCtx.mozCurrentTransform;
      this.ctx.save();

      var groupCtx = scratchCanvas.context;
      groupCtx.translate(-activeSMask.offsetX, -activeSMask.offsetY);
      groupCtx.transform.apply(groupCtx, currentTransform);

      copyCtxState(currentCtx, groupCtx);
      this.ctx = groupCtx;
      this.setGState([
        ['BM', 'Normal'],
        ['ca', 1],
        ['CA', 1]
      ]);
      this.groupStack.push(currentCtx);
      this.groupLevel++;
    },
    endSMaskGroup: function CanvasGraphics_endSMaskGroup() {
      var groupCtx = this.ctx;
      this.groupLevel--;
      this.ctx = this.groupStack.pop();

      composeSMask(this.ctx, this.current.activeSMask, groupCtx);
      this.ctx.restore();
    },
    save: function CanvasGraphics_save() {
      this.ctx.save();
      var old = this.current;
      this.stateStack.push(old);
      this.current = old.clone();
      if (this.current.activeSMask) {
        this.current.activeSMask = null;
      }
    },
    restore: function CanvasGraphics_restore() {
      var prev = this.stateStack.pop();
      if (prev) {
        if (this.current.activeSMask) {
          this.endSMaskGroup();
        }

        this.current = prev;
        this.ctx.restore();
      }
    },
    transform: function CanvasGraphics_transform(a, b, c, d, e, f) {
      this.ctx.transform(a, b, c, d, e, f);
    },

    
    moveTo: function CanvasGraphics_moveTo(x, y) {
      this.ctx.moveTo(x, y);
      this.current.setCurrentPoint(x, y);
    },
    lineTo: function CanvasGraphics_lineTo(x, y) {
      this.ctx.lineTo(x, y);
      this.current.setCurrentPoint(x, y);
    },
    curveTo: function CanvasGraphics_curveTo(x1, y1, x2, y2, x3, y3) {
      this.ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
      this.current.setCurrentPoint(x3, y3);
    },
    curveTo2: function CanvasGraphics_curveTo2(x2, y2, x3, y3) {
      var current = this.current;
      this.ctx.bezierCurveTo(current.x, current.y, x2, y2, x3, y3);
      current.setCurrentPoint(x3, y3);
    },
    curveTo3: function CanvasGraphics_curveTo3(x1, y1, x3, y3) {
      this.curveTo(x1, y1, x3, y3, x3, y3);
      this.current.setCurrentPoint(x3, y3);
    },
    closePath: function CanvasGraphics_closePath() {
      this.ctx.closePath();
    },
    rectangle: function CanvasGraphics_rectangle(x, y, width, height) {
      this.ctx.rect(x, y, width, height);
    },
    stroke: function CanvasGraphics_stroke(consumePath) {
      consumePath = typeof consumePath !== 'undefined' ? consumePath : true;
      var ctx = this.ctx;
      var strokeColor = this.current.strokeColor;
      if (this.current.lineWidth === 0)
        ctx.lineWidth = this.getSinglePixelWidth();
      
      
      ctx.globalAlpha = this.current.strokeAlpha;
      if (strokeColor && strokeColor.hasOwnProperty('type') &&
          strokeColor.type === 'Pattern') {
        
        
        ctx.save();
        ctx.strokeStyle = strokeColor.getPattern(ctx, this);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.stroke();
      }
      if (consumePath)
        this.consumePath();
      
      ctx.globalAlpha = this.current.fillAlpha;
    },
    closeStroke: function CanvasGraphics_closeStroke() {
      this.closePath();
      this.stroke();
    },
    fill: function CanvasGraphics_fill(consumePath) {
      consumePath = typeof consumePath !== 'undefined' ? consumePath : true;
      var ctx = this.ctx;
      var fillColor = this.current.fillColor;
      var needRestore = false;

      if (fillColor && fillColor.hasOwnProperty('type') &&
          fillColor.type === 'Pattern') {
        ctx.save();
        ctx.fillStyle = fillColor.getPattern(ctx, this);
        needRestore = true;
      }

      if (this.pendingEOFill) {
        if ('mozFillRule' in this.ctx) {
          this.ctx.mozFillRule = 'evenodd';
          this.ctx.fill();
          this.ctx.mozFillRule = 'nonzero';
        } else {
          try {
            this.ctx.fill('evenodd');
          } catch (ex) {
            
            this.ctx.fill();
          }
        }
        this.pendingEOFill = false;
      } else {
        this.ctx.fill();
      }

      if (needRestore) {
        ctx.restore();
      }
      if (consumePath) {
        this.consumePath();
      }
    },
    eoFill: function CanvasGraphics_eoFill() {
      this.pendingEOFill = true;
      this.fill();
    },
    fillStroke: function CanvasGraphics_fillStroke() {
      this.fill(false);
      this.stroke(false);

      this.consumePath();
    },
    eoFillStroke: function CanvasGraphics_eoFillStroke() {
      this.pendingEOFill = true;
      this.fillStroke();
    },
    closeFillStroke: function CanvasGraphics_closeFillStroke() {
      this.closePath();
      this.fillStroke();
    },
    closeEOFillStroke: function CanvasGraphics_closeEOFillStroke() {
      this.pendingEOFill = true;
      this.closePath();
      this.fillStroke();
    },
    endPath: function CanvasGraphics_endPath() {
      this.consumePath();
    },

    
    clip: function CanvasGraphics_clip() {
      this.pendingClip = NORMAL_CLIP;
    },
    eoClip: function CanvasGraphics_eoClip() {
      this.pendingClip = EO_CLIP;
    },

    
    beginText: function CanvasGraphics_beginText() {
      this.current.textMatrix = IDENTITY_MATRIX;
      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;
    },
    endText: function CanvasGraphics_endText() {
      if (!('pendingTextPaths' in this)) {
        this.ctx.beginPath();
        return;
      }
      var paths = this.pendingTextPaths;
      var ctx = this.ctx;

      ctx.save();
      ctx.beginPath();
      for (var i = 0; i < paths.length; i++) {
        var path = paths[i];
        ctx.setTransform.apply(ctx, path.transform);
        ctx.translate(path.x, path.y);
        path.addToPath(ctx, path.fontSize);
      }
      ctx.restore();
      ctx.clip();
      ctx.beginPath();
      delete this.pendingTextPaths;
    },
    setCharSpacing: function CanvasGraphics_setCharSpacing(spacing) {
      this.current.charSpacing = spacing;
    },
    setWordSpacing: function CanvasGraphics_setWordSpacing(spacing) {
      this.current.wordSpacing = spacing;
    },
    setHScale: function CanvasGraphics_setHScale(scale) {
      this.current.textHScale = scale / 100;
    },
    setLeading: function CanvasGraphics_setLeading(leading) {
      this.current.leading = -leading;
    },
    setFont: function CanvasGraphics_setFont(fontRefName, size) {
      var fontObj = this.commonObjs.get(fontRefName);
      var current = this.current;

      if (!fontObj)
        error('Can\'t find font for ' + fontRefName);

      current.fontMatrix = fontObj.fontMatrix ? fontObj.fontMatrix :
                                                FONT_IDENTITY_MATRIX;

      
      
      if (current.fontMatrix[0] === 0 ||
          current.fontMatrix[3] === 0) {
        warn('Invalid font matrix for font ' + fontRefName);
      }

      
      
      if (size < 0) {
        size = -size;
        current.fontDirection = -1;
      } else {
        current.fontDirection = 1;
      }

      this.current.font = fontObj;
      this.current.fontSize = size;

      if (fontObj.coded)
        return; 

      var name = fontObj.loadedName || 'sans-serif';
      var bold = fontObj.black ? (fontObj.bold ? 'bolder' : 'bold') :
                                 (fontObj.bold ? 'bold' : 'normal');

      var italic = fontObj.italic ? 'italic' : 'normal';
      var typeface = '"' + name + '", ' + fontObj.fallbackName;

      
      
      
      
      var browserFontSize = size >= MIN_FONT_SIZE ? size : MIN_FONT_SIZE;
      this.current.fontSizeScale = browserFontSize != MIN_FONT_SIZE ? 1.0 :
                                   size / MIN_FONT_SIZE;

      var rule = italic + ' ' + bold + ' ' + browserFontSize + 'px ' + typeface;
      this.ctx.font = rule;
    },
    setTextRenderingMode: function CanvasGraphics_setTextRenderingMode(mode) {
      this.current.textRenderingMode = mode;
    },
    setTextRise: function CanvasGraphics_setTextRise(rise) {
      this.current.textRise = rise;
    },
    moveText: function CanvasGraphics_moveText(x, y) {
      this.current.x = this.current.lineX += x;
      this.current.y = this.current.lineY += y;
    },
    setLeadingMoveText: function CanvasGraphics_setLeadingMoveText(x, y) {
      this.setLeading(-y);
      this.moveText(x, y);
    },
    setTextMatrix: function CanvasGraphics_setTextMatrix(a, b, c, d, e, f) {
      this.current.textMatrix = [a, b, c, d, e, f];

      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;
    },
    nextLine: function CanvasGraphics_nextLine() {
      this.moveText(0, this.current.leading);
    },
    applyTextTransforms: function CanvasGraphics_applyTextTransforms() {
      var ctx = this.ctx;
      var current = this.current;
      ctx.transform.apply(ctx, current.textMatrix);
      ctx.translate(current.x, current.y + current.textRise);
      if (current.fontDirection > 0) {
        ctx.scale(current.textHScale, -1);
      } else {
        ctx.scale(-current.textHScale, 1);
      }
    },
    createTextGeometry: function CanvasGraphics_createTextGeometry() {
      var geometry = {};
      var ctx = this.ctx;
      var font = this.current.font;
      var ctxMatrix = ctx.mozCurrentTransform;
      var a = ctxMatrix[0], b = ctxMatrix[1], c = ctxMatrix[2];
      var d = ctxMatrix[3], e = ctxMatrix[4], f = ctxMatrix[5];
      var sx = (a >= 0) ?
          Math.sqrt((a * a) + (b * b)) : -Math.sqrt((a * a) + (b * b));
      var sy = (d >= 0) ?
          Math.sqrt((c * c) + (d * d)) : -Math.sqrt((c * c) + (d * d));
      var angle = Math.atan2(b, a);
      var x = e;
      var y = f;
      geometry.x = x;
      geometry.y = y;
      geometry.hScale = sx;
      geometry.vScale = sy;
      geometry.angle = angle;
      geometry.spaceWidth = font.spaceWidth;
      geometry.fontName = font.loadedName;
      geometry.fontFamily = font.fallbackName;
      geometry.fontSize = this.current.fontSize;
      geometry.ascent = font.ascent;
      geometry.descent = font.descent;
      return geometry;
    },

    paintChar: function (character, x, y) {
      var ctx = this.ctx;
      var current = this.current;
      var font = current.font;
      var fontSize = current.fontSize / current.fontSizeScale;
      var textRenderingMode = current.textRenderingMode;
      var fillStrokeMode = textRenderingMode &
        TextRenderingMode.FILL_STROKE_MASK;
      var isAddToPathSet = !!(textRenderingMode &
        TextRenderingMode.ADD_TO_PATH_FLAG);

      var addToPath;
      if (font.disableFontFace || isAddToPathSet) {
        addToPath = font.getPathGenerator(this.commonObjs, character);
      }

      if (font.disableFontFace) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        addToPath(ctx, fontSize);
        if (fillStrokeMode === TextRenderingMode.FILL ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.fill();
        }
        if (fillStrokeMode === TextRenderingMode.STROKE ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.stroke();
        }
        ctx.restore();
      } else {
        if (fillStrokeMode === TextRenderingMode.FILL ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.fillText(character, x, y);
        }
        if (fillStrokeMode === TextRenderingMode.STROKE ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.strokeText(character, x, y);
        }
      }

      if (isAddToPathSet) {
        var paths = this.pendingTextPaths || (this.pendingTextPaths = []);
        paths.push({
          transform: ctx.mozCurrentTransform,
          x: x,
          y: y,
          fontSize: fontSize,
          addToPath: addToPath
        });
      }
    },

    get isFontSubpixelAAEnabled() {
      
      
      var ctx = document.createElement('canvas').getContext('2d');
      ctx.scale(1.5, 1);
      ctx.fillText('I', 0, 10);
      var data = ctx.getImageData(0, 0, 10, 10).data;
      var enabled = false;
      for (var i = 3; i < data.length; i += 4) {
        if (data[i] > 0 && data[i] < 255) {
          enabled = true;
          break;
        }
      }
      return shadow(this, 'isFontSubpixelAAEnabled', enabled);
    },

    showText: function CanvasGraphics_showText(glyphs, skipTextSelection) {
      var ctx = this.ctx;
      var current = this.current;
      var font = current.font;
      var fontSize = current.fontSize;
      var fontSizeScale = current.fontSizeScale;
      var charSpacing = current.charSpacing;
      var wordSpacing = current.wordSpacing;
      var textHScale = current.textHScale * current.fontDirection;
      var fontMatrix = current.fontMatrix || FONT_IDENTITY_MATRIX;
      var glyphsLength = glyphs.length;
      var textLayer = this.textLayer;
      var geom;
      var textSelection = textLayer && !skipTextSelection ? true : false;
      var canvasWidth = 0.0;
      var vertical = font.vertical;
      var defaultVMetrics = font.defaultVMetrics;

      
      if (font.coded) {
        ctx.save();
        ctx.transform.apply(ctx, current.textMatrix);
        ctx.translate(current.x, current.y);

        ctx.scale(textHScale, 1);

        if (textSelection) {
          this.save();
          ctx.scale(1, -1);
          geom = this.createTextGeometry();
          this.restore();
        }
        for (var i = 0; i < glyphsLength; ++i) {

          var glyph = glyphs[i];
          if (glyph === null) {
            
            this.ctx.translate(wordSpacing, 0);
            current.x += wordSpacing * textHScale;
            continue;
          }

          this.processingType3 = glyph;
          this.save();
          ctx.scale(fontSize, fontSize);
          ctx.transform.apply(ctx, fontMatrix);
          this.executeOperatorList(glyph.operatorList);
          this.restore();

          var transformed = Util.applyTransform([glyph.width, 0], fontMatrix);
          var width = (transformed[0] * fontSize + charSpacing) *
                      current.fontDirection;

          ctx.translate(width, 0);
          current.x += width * textHScale;

          canvasWidth += width;
        }
        ctx.restore();
        this.processingType3 = null;
      } else {
        ctx.save();
        this.applyTextTransforms();

        var lineWidth = current.lineWidth;
        var a1 = current.textMatrix[0], b1 = current.textMatrix[1];
        var scale = Math.sqrt(a1 * a1 + b1 * b1);
        if (scale === 0 || lineWidth === 0)
          lineWidth = this.getSinglePixelWidth();
        else
          lineWidth /= scale;

        if (textSelection)
          geom = this.createTextGeometry();

        if (fontSizeScale != 1.0) {
          ctx.scale(fontSizeScale, fontSizeScale);
          lineWidth /= fontSizeScale;
        }

        ctx.lineWidth = lineWidth;

        var x = 0;
        for (var i = 0; i < glyphsLength; ++i) {
          var glyph = glyphs[i];
          if (glyph === null) {
            
            x += current.fontDirection * wordSpacing;
            continue;
          }

          var restoreNeeded = false;
          var character = glyph.fontChar;
          var vmetric = glyph.vmetric || defaultVMetrics;
          if (vertical) {
            var vx = glyph.vmetric ? vmetric[1] : glyph.width * 0.5;
            vx = -vx * fontSize * current.fontMatrix[0];
            var vy = vmetric[2] * fontSize * current.fontMatrix[0];
          }
          var width = vmetric ? -vmetric[0] : glyph.width;
          var charWidth = width * fontSize * current.fontMatrix[0] +
                          charSpacing * current.fontDirection;
          var accent = glyph.accent;

          var scaledX, scaledY, scaledAccentX, scaledAccentY;
          if (!glyph.disabled) {
            if (vertical) {
              scaledX = vx / fontSizeScale;
              scaledY = (x + vy) / fontSizeScale;
            } else {
              scaledX = x / fontSizeScale;
              scaledY = 0;
            }

            if (font.remeasure && width > 0 && this.isFontSubpixelAAEnabled) {
              
              
              var measuredWidth = ctx.measureText(character).width * 1000 /
                current.fontSize * current.fontSizeScale;
              var characterScaleX = width / measuredWidth;
              restoreNeeded = true;
              ctx.save();
              ctx.scale(characterScaleX, 1);
              scaledX /= characterScaleX;
              if (accent) {
                scaledAccentX /= characterScaleX;
              }
            }

            this.paintChar(character, scaledX, scaledY);
            if (accent) {
              scaledAccentX = scaledX + accent.offset.x / fontSizeScale;
              scaledAccentY = scaledY - accent.offset.y / fontSizeScale;
              this.paintChar(accent.fontChar, scaledAccentX, scaledAccentY);
            }
          }

          x += charWidth;

          canvasWidth += charWidth;

          if (restoreNeeded) {
            ctx.restore();
          }
        }
        if (vertical) {
          current.y -= x * textHScale;
        } else {
          current.x += x * textHScale;
        }
        ctx.restore();
      }

      if (textSelection) {
        geom.canvasWidth = canvasWidth;
        if (vertical) {
          var VERTICAL_TEXT_ROTATION = Math.PI / 2;
          geom.angle += VERTICAL_TEXT_ROTATION;
        }
        this.textLayer.appendText(geom);
      }

      return canvasWidth;
    },
    showSpacedText: function CanvasGraphics_showSpacedText(arr) {
      var ctx = this.ctx;
      var current = this.current;
      var font = current.font;
      var fontSize = current.fontSize;
      
      var textHScale = current.textHScale * 0.001 * current.fontDirection;
      var arrLength = arr.length;
      var textLayer = this.textLayer;
      var geom;
      var canvasWidth = 0.0;
      var textSelection = textLayer ? true : false;
      var vertical = font.vertical;
      var spacingAccumulator = 0;

      if (textSelection) {
        ctx.save();
        this.applyTextTransforms();
        geom = this.createTextGeometry();
        ctx.restore();
      }

      for (var i = 0; i < arrLength; ++i) {
        var e = arr[i];
        if (isNum(e)) {
          var spacingLength = -e * fontSize * textHScale;
          if (vertical) {
            current.y += spacingLength;
          } else {
            current.x += spacingLength;
          }

          if (textSelection)
            spacingAccumulator += spacingLength;
        } else {
          var shownCanvasWidth = this.showText(e, true);

          if (textSelection) {
            canvasWidth += spacingAccumulator + shownCanvasWidth;
            spacingAccumulator = 0;
          }
        }
      }

      if (textSelection) {
        geom.canvasWidth = canvasWidth;
        if (vertical) {
          var VERTICAL_TEXT_ROTATION = Math.PI / 2;
          geom.angle += VERTICAL_TEXT_ROTATION;
        }
        this.textLayer.appendText(geom);
      }
    },
    nextLineShowText: function CanvasGraphics_nextLineShowText(text) {
      this.nextLine();
      this.showText(text);
    },
    nextLineSetSpacingShowText:
      function CanvasGraphics_nextLineSetSpacingShowText(wordSpacing,
                                                         charSpacing,
                                                         text) {
      this.setWordSpacing(wordSpacing);
      this.setCharSpacing(charSpacing);
      this.nextLineShowText(text);
    },

    
    setCharWidth: function CanvasGraphics_setCharWidth(xWidth, yWidth) {
      
      
    },
    setCharWidthAndBounds: function CanvasGraphics_setCharWidthAndBounds(xWidth,
                                                                        yWidth,
                                                                        llx,
                                                                        lly,
                                                                        urx,
                                                                        ury) {
      
      
      this.rectangle(llx, lly, urx - llx, ury - lly);
      this.clip();
      this.endPath();
    },

    
    setStrokeColorSpace: function CanvasGraphics_setStrokeColorSpace(raw) {
      this.current.strokeColorSpace = ColorSpace.fromIR(raw);
    },
    setFillColorSpace: function CanvasGraphics_setFillColorSpace(raw) {
      this.current.fillColorSpace = ColorSpace.fromIR(raw);
    },
    setStrokeColor: function CanvasGraphics_setStrokeColor() {
      var cs = this.current.strokeColorSpace;
      var rgbColor = cs.getRgb(arguments, 0);
      var color = Util.makeCssRgb(rgbColor);
      this.ctx.strokeStyle = color;
      this.current.strokeColor = color;
    },
    getColorN_Pattern: function CanvasGraphics_getColorN_Pattern(IR, cs) {
      if (IR[0] == 'TilingPattern') {
        var args = IR[1];
        var base = cs.base;
        var color;
        if (base) {
          var baseComps = base.numComps;

          color = base.getRgb(args, 0);
        }
        var pattern = new TilingPattern(IR, color, this.ctx, this.objs,
                                        this.commonObjs, this.baseTransform);
      } else {
        var pattern = getShadingPatternFromIR(IR);
      }
      return pattern;
    },
    setStrokeColorN: function CanvasGraphics_setStrokeColorN() {
      var cs = this.current.strokeColorSpace;

      if (cs.name == 'Pattern') {
        this.current.strokeColor = this.getColorN_Pattern(arguments, cs);
      } else {
        this.setStrokeColor.apply(this, arguments);
      }
    },
    setFillColor: function CanvasGraphics_setFillColor() {
      var cs = this.current.fillColorSpace;
      var rgbColor = cs.getRgb(arguments, 0);
      var color = Util.makeCssRgb(rgbColor);
      this.ctx.fillStyle = color;
      this.current.fillColor = color;
    },
    setFillColorN: function CanvasGraphics_setFillColorN() {
      var cs = this.current.fillColorSpace;

      if (cs.name == 'Pattern') {
        this.current.fillColor = this.getColorN_Pattern(arguments, cs);
      } else {
        this.setFillColor.apply(this, arguments);
      }
    },
    setStrokeGray: function CanvasGraphics_setStrokeGray(gray) {
      this.current.strokeColorSpace = ColorSpace.singletons.gray;

      var rgbColor = this.current.strokeColorSpace.getRgb(arguments, 0);
      var color = Util.makeCssRgb(rgbColor);
      this.ctx.strokeStyle = color;
      this.current.strokeColor = color;
    },
    setFillGray: function CanvasGraphics_setFillGray(gray) {
      this.current.fillColorSpace = ColorSpace.singletons.gray;

      var rgbColor = this.current.fillColorSpace.getRgb(arguments, 0);
      var color = Util.makeCssRgb(rgbColor);
      this.ctx.fillStyle = color;
      this.current.fillColor = color;
    },
    setStrokeRGBColor: function CanvasGraphics_setStrokeRGBColor(r, g, b) {
      this.current.strokeColorSpace = ColorSpace.singletons.rgb;

      var rgbColor = this.current.strokeColorSpace.getRgb(arguments, 0);
      var color = Util.makeCssRgb(rgbColor);
      this.ctx.strokeStyle = color;
      this.current.strokeColor = color;
    },
    setFillRGBColor: function CanvasGraphics_setFillRGBColor(r, g, b) {
      this.current.fillColorSpace = ColorSpace.singletons.rgb;

      var rgbColor = this.current.fillColorSpace.getRgb(arguments, 0);
      var color = Util.makeCssRgb(rgbColor);
      this.ctx.fillStyle = color;
      this.current.fillColor = color;
    },
    setStrokeCMYKColor: function CanvasGraphics_setStrokeCMYKColor(c, m, y, k) {
      this.current.strokeColorSpace = ColorSpace.singletons.cmyk;

      var color = Util.makeCssCmyk(arguments);
      this.ctx.strokeStyle = color;
      this.current.strokeColor = color;
    },
    setFillCMYKColor: function CanvasGraphics_setFillCMYKColor(c, m, y, k) {
      this.current.fillColorSpace = ColorSpace.singletons.cmyk;

      var color = Util.makeCssCmyk(arguments);
      this.ctx.fillStyle = color;
      this.current.fillColor = color;
    },

    shadingFill: function CanvasGraphics_shadingFill(patternIR) {
      var ctx = this.ctx;

      this.save();
      var pattern = getShadingPatternFromIR(patternIR);
      ctx.fillStyle = pattern.getPattern(ctx, this, true);

      var inv = ctx.mozCurrentTransformInverse;
      if (inv) {
        var canvas = ctx.canvas;
        var width = canvas.width;
        var height = canvas.height;

        var bl = Util.applyTransform([0, 0], inv);
        var br = Util.applyTransform([0, height], inv);
        var ul = Util.applyTransform([width, 0], inv);
        var ur = Util.applyTransform([width, height], inv);

        var x0 = Math.min(bl[0], br[0], ul[0], ur[0]);
        var y0 = Math.min(bl[1], br[1], ul[1], ur[1]);
        var x1 = Math.max(bl[0], br[0], ul[0], ur[0]);
        var y1 = Math.max(bl[1], br[1], ul[1], ur[1]);

        this.ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      } else {
        
        
        
        
        

        this.ctx.fillRect(-1e10, -1e10, 2e10, 2e10);
      }

      this.restore();
    },

    
    beginInlineImage: function CanvasGraphics_beginInlineImage() {
      error('Should not call beginInlineImage');
    },
    beginImageData: function CanvasGraphics_beginImageData() {
      error('Should not call beginImageData');
    },

    paintFormXObjectBegin: function CanvasGraphics_paintFormXObjectBegin(matrix,
                                                                        bbox) {
      this.save();
      this.baseTransformStack.push(this.baseTransform);

      if (matrix && isArray(matrix) && 6 == matrix.length)
        this.transform.apply(this, matrix);

      this.baseTransform = this.ctx.mozCurrentTransform;

      if (bbox && isArray(bbox) && 4 == bbox.length) {
        var width = bbox[2] - bbox[0];
        var height = bbox[3] - bbox[1];
        this.rectangle(bbox[0], bbox[1], width, height);
        this.clip();
        this.endPath();
      }
    },

    paintFormXObjectEnd: function CanvasGraphics_paintFormXObjectEnd() {
      this.restore();
      this.baseTransform = this.baseTransformStack.pop();
    },

    beginGroup: function CanvasGraphics_beginGroup(group) {
      this.save();
      var currentCtx = this.ctx;
      
      
      
      
      
      
      
      
      
      
      
      
      
      if (!group.isolated) {
        info('TODO: Support non-isolated groups.');
      }

      
      
      if (group.knockout) {
        warn('Knockout groups not supported.');
      }

      var currentTransform = currentCtx.mozCurrentTransform;
      if (group.matrix) {
        currentCtx.transform.apply(currentCtx, group.matrix);
      }
      assert(group.bbox, 'Bounding box is required.');

      
      
      var bounds = Util.getAxialAlignedBoundingBox(
                    group.bbox,
                    currentCtx.mozCurrentTransform);
      
      var canvasBounds = [0,
                          0,
                          currentCtx.canvas.width,
                          currentCtx.canvas.height];
      bounds = Util.intersect(bounds, canvasBounds) || [0, 0, 0, 0];
      
      
      var drawnWidth = Math.max(Math.ceil(bounds[2] - bounds[0]), 1);
      var drawnHeight = Math.max(Math.ceil(bounds[3] - bounds[1]), 1);

      var cacheId = 'groupAt' + this.groupLevel;
      if (group.smask) {
        
        cacheId +=  '_smask_' + ((this.smaskCounter++) % 2);
      }
      var scratchCanvas = CachedCanvases.getCanvas(
        cacheId, drawnWidth, drawnHeight, true);
      var groupCtx = scratchCanvas.context;

      
      
      var offsetX = bounds[0];
      var offsetY = bounds[1];
      groupCtx.translate(-offsetX, -offsetY);
      groupCtx.transform.apply(groupCtx, currentTransform);

      if (group.smask) {
        
        this.smaskStack.push({
          canvas: scratchCanvas.canvas,
          context: groupCtx,
          offsetX: offsetX,
          offsetY: offsetY,
          subtype: group.smask.subtype,
          backdrop: group.smask.backdrop,
          colorSpace: group.colorSpace && ColorSpace.fromIR(group.colorSpace)
        });
      } else {
        
        
        currentCtx.setTransform(1, 0, 0, 1, 0, 0);
        currentCtx.translate(offsetX, offsetY);
      }
      
      
      copyCtxState(currentCtx, groupCtx);
      this.ctx = groupCtx;
      this.setGState([
        ['BM', 'Normal'],
        ['ca', 1],
        ['CA', 1]
      ]);
      this.groupStack.push(currentCtx);
      this.groupLevel++;
    },

    endGroup: function CanvasGraphics_endGroup(group) {
      this.groupLevel--;
      var groupCtx = this.ctx;
      this.ctx = this.groupStack.pop();
      
      
      if ('imageSmoothingEnabled' in this.ctx) {
        this.ctx.imageSmoothingEnabled = false;
      } else {
        this.ctx.mozImageSmoothingEnabled = false;
      }
      if (group.smask) {
        this.tempSMask = this.smaskStack.pop();
      } else {
        this.ctx.drawImage(groupCtx.canvas, 0, 0);
      }
      this.restore();
    },

    beginAnnotations: function CanvasGraphics_beginAnnotations() {
      this.save();
      this.current = new CanvasExtraState();
    },

    endAnnotations: function CanvasGraphics_endAnnotations() {
      this.restore();
    },

    beginAnnotation: function CanvasGraphics_beginAnnotation(rect, transform,
                                                             matrix) {
      this.save();

      if (rect && isArray(rect) && 4 == rect.length) {
        var width = rect[2] - rect[0];
        var height = rect[3] - rect[1];
        this.rectangle(rect[0], rect[1], width, height);
        this.clip();
        this.endPath();
      }

      this.transform.apply(this, transform);
      this.transform.apply(this, matrix);
    },

    endAnnotation: function CanvasGraphics_endAnnotation() {
      this.restore();
    },

    paintJpegXObject: function CanvasGraphics_paintJpegXObject(objId, w, h) {
      var domImage = this.objs.get(objId);
      if (!domImage) {
        error('Dependent image isn\'t ready yet');
      }

      this.save();

      var ctx = this.ctx;
      
      ctx.scale(1 / w, -1 / h);

      ctx.drawImage(domImage, 0, 0, domImage.width, domImage.height,
                    0, -h, w, h);
      if (this.imageLayer) {
        var currentTransform = ctx.mozCurrentTransformInverse;
        var position = this.getCanvasPosition(0, 0);
        this.imageLayer.appendImage({
          objId: objId,
          left: position[0],
          top: position[1],
          width: w / currentTransform[0],
          height: h / currentTransform[3]
        });
      }
      this.restore();
    },

    paintImageMaskXObject: function CanvasGraphics_paintImageMaskXObject(img) {
      var ctx = this.ctx;
      var width = img.width, height = img.height;

      var glyph = this.processingType3;

      if (COMPILE_TYPE3_GLYPHS && glyph && !('compiled' in glyph)) {
        var MAX_SIZE_TO_COMPILE = 1000;
        if (width <= MAX_SIZE_TO_COMPILE && height <= MAX_SIZE_TO_COMPILE) {
          glyph.compiled =
            compileType3Glyph({data: img.data, width: width, height: height});
        } else {
          glyph.compiled = null;
        }
      }

      if (glyph && glyph.compiled) {
        glyph.compiled(ctx);
        return;
      }

      var maskCanvas = CachedCanvases.getCanvas('maskCanvas', width, height);
      var maskCtx = maskCanvas.context;
      maskCtx.save();

      putBinaryImageMask(maskCtx, img);

      maskCtx.globalCompositeOperation = 'source-in';

      var fillColor = this.current.fillColor;
      maskCtx.fillStyle = (fillColor && fillColor.hasOwnProperty('type') &&
                          fillColor.type === 'Pattern') ?
                          fillColor.getPattern(maskCtx, this) : fillColor;
      maskCtx.fillRect(0, 0, width, height);

      maskCtx.restore();

      this.paintInlineImageXObject(maskCanvas.canvas);
    },

    paintImageMaskXObjectGroup:
      function CanvasGraphics_paintImageMaskXObjectGroup(images) {
      var ctx = this.ctx;

      for (var i = 0, ii = images.length; i < ii; i++) {
        var image = images[i];
        var width = image.width, height = image.height;

        var maskCanvas = CachedCanvases.getCanvas('maskCanvas', width, height);
        var maskCtx = maskCanvas.context;
        maskCtx.save();

        putBinaryImageMask(maskCtx, image);

        maskCtx.globalCompositeOperation = 'source-in';

        var fillColor = this.current.fillColor;
        maskCtx.fillStyle = (fillColor && fillColor.hasOwnProperty('type') &&
                            fillColor.type === 'Pattern') ?
                            fillColor.getPattern(maskCtx, this) : fillColor;
        maskCtx.fillRect(0, 0, width, height);

        maskCtx.restore();

        ctx.save();
        ctx.transform.apply(ctx, image.transform);
        ctx.scale(1, -1);
        ctx.drawImage(maskCanvas.canvas, 0, 0, width, height,
                      0, -1, 1, 1);
        ctx.restore();
      }
    },

    paintImageXObject: function CanvasGraphics_paintImageXObject(objId) {
      var imgData = this.objs.get(objId);
      if (!imgData)
        error('Dependent image isn\'t ready yet');

      this.paintInlineImageXObject(imgData);
    },

    paintInlineImageXObject:
      function CanvasGraphics_paintInlineImageXObject(imgData) {
      var width = imgData.width;
      var height = imgData.height;
      var ctx = this.ctx;

      this.save();
      
      ctx.scale(1 / width, -1 / height);

      var currentTransform = ctx.mozCurrentTransformInverse;
      var a = currentTransform[0], b = currentTransform[1];
      var widthScale = Math.max(Math.sqrt(a * a + b * b), 1);
      var c = currentTransform[2], d = currentTransform[3];
      var heightScale = Math.max(Math.sqrt(c * c + d * d), 1);

      var imgToPaint;
      
      if (imgData instanceof HTMLElement || !imgData.data) {
        imgToPaint = imgData;
      } else {
        var tmpCanvas = CachedCanvases.getCanvas('inlineImage', width, height);
        var tmpCtx = tmpCanvas.context;
        putBinaryImageData(tmpCtx, imgData);
        imgToPaint = tmpCanvas.canvas;
      }

      var paintWidth = width, paintHeight = height;
      var tmpCanvasId = 'prescale1';
      
      
      
      while ((widthScale > 2 && paintWidth > 1) ||
             (heightScale > 2 && paintHeight > 1)) {
        var newWidth = paintWidth, newHeight = paintHeight;
        if (widthScale > 2 && paintWidth > 1) {
          newWidth = Math.ceil(paintWidth / 2);
          widthScale /= paintWidth / newWidth;
        }
        if (heightScale > 2 && paintHeight > 1) {
          newHeight = Math.ceil(paintHeight / 2);
          heightScale /= paintHeight / newHeight;
        }
        var tmpCanvas = CachedCanvases.getCanvas(tmpCanvasId,
                                                 newWidth, newHeight);
        tmpCtx = tmpCanvas.context;
        tmpCtx.clearRect(0, 0, newWidth, newHeight);
        tmpCtx.drawImage(imgToPaint, 0, 0, paintWidth, paintHeight,
                                     0, 0, newWidth, newHeight);
        imgToPaint = tmpCanvas.canvas;
        paintWidth = newWidth;
        paintHeight = newHeight;
        tmpCanvasId = tmpCanvasId === 'prescale1' ? 'prescale2' : 'prescale1';
      }
      ctx.drawImage(imgToPaint, 0, 0, paintWidth, paintHeight,
                                0, -height, width, height);

      if (this.imageLayer) {
        var position = this.getCanvasPosition(0, -height);
        this.imageLayer.appendImage({
          imgData: imgData,
          left: position[0],
          top: position[1],
          width: width / currentTransform[0],
          height: height / currentTransform[3]
        });
      }
      this.restore();
    },

    paintInlineImageXObjectGroup:
      function CanvasGraphics_paintInlineImageXObjectGroup(imgData, map) {
      var ctx = this.ctx;
      var w = imgData.width;
      var h = imgData.height;

      var tmpCanvas = CachedCanvases.getCanvas('inlineImage', w, h);
      var tmpCtx = tmpCanvas.context;
      putBinaryImageData(tmpCtx, imgData);

      for (var i = 0, ii = map.length; i < ii; i++) {
        var entry = map[i];
        ctx.save();
        ctx.transform.apply(ctx, entry.transform);
        ctx.scale(1, -1);
        ctx.drawImage(tmpCanvas.canvas, entry.x, entry.y, entry.w, entry.h,
                      0, -1, 1, 1);
        if (this.imageLayer) {
          var position = this.getCanvasPosition(entry.x, entry.y);
          this.imageLayer.appendImage({
            imgData: imgData,
            left: position[0],
            top: position[1],
            width: w,
            height: h
          });
        }
        ctx.restore();
      }
    },

    

    markPoint: function CanvasGraphics_markPoint(tag) {
      
    },
    markPointProps: function CanvasGraphics_markPointProps(tag, properties) {
      
    },
    beginMarkedContent: function CanvasGraphics_beginMarkedContent(tag) {
      
    },
    beginMarkedContentProps: function CanvasGraphics_beginMarkedContentProps(
                                        tag, properties) {
      
    },
    endMarkedContent: function CanvasGraphics_endMarkedContent() {
      
    },

    

    beginCompat: function CanvasGraphics_beginCompat() {
      
    },
    endCompat: function CanvasGraphics_endCompat() {
      
    },

    

    consumePath: function CanvasGraphics_consumePath() {
      if (this.pendingClip) {
        if (this.pendingClip == EO_CLIP) {
          if ('mozFillRule' in this.ctx) {
            this.ctx.mozFillRule = 'evenodd';
            this.ctx.clip();
            this.ctx.mozFillRule = 'nonzero';
          } else {
            try {
              this.ctx.clip('evenodd');
            } catch (ex) {
              
              this.ctx.clip();
            }
          }
        } else {
          this.ctx.clip();
        }
        this.pendingClip = null;
      }
      this.ctx.beginPath();
    },
    getSinglePixelWidth: function CanvasGraphics_getSinglePixelWidth(scale) {
      var inverse = this.ctx.mozCurrentTransformInverse;
      
      return Math.sqrt(Math.max(
        (inverse[0] * inverse[0] + inverse[1] * inverse[1]),
        (inverse[2] * inverse[2] + inverse[3] * inverse[3])));
    },
    getCanvasPosition: function CanvasGraphics_getCanvasPosition(x, y) {
        var transform = this.ctx.mozCurrentTransform;
        return [
          transform[0] * x + transform[2] * y + transform[4],
          transform[1] * x + transform[3] * y + transform[5]
        ];
    }
  };

  for (var op in OPS) {
    CanvasGraphics.prototype[OPS[op]] = CanvasGraphics.prototype[op];
  }

  return CanvasGraphics;
})();



var ShadingIRs = {};

ShadingIRs.RadialAxial = {
  fromIR: function RadialAxial_fromIR(raw) {
    var type = raw[1];
    var colorStops = raw[2];
    var p0 = raw[3];
    var p1 = raw[4];
    var r0 = raw[5];
    var r1 = raw[6];
    return {
      type: 'Pattern',
      getPattern: function RadialAxial_getPattern(ctx) {
        var grad;
        if (type === 'axial') {
          grad = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
        } else if (type === 'radial') {
          grad = ctx.createRadialGradient(p0[0], p0[1], r0, p1[0], p1[1], r1);
        }

        for (var i = 0, ii = colorStops.length; i < ii; ++i) {
          var c = colorStops[i];
          grad.addColorStop(c[0], c[1]);
        }
        return grad;
      }
    };
  }
};

var createMeshCanvas = (function createMeshCanvasClosure() {
  function drawTriangle(data, context, p1, p2, p3, c1, c2, c3) {
    
    var coords = context.coords, colors = context.colors;
    var bytes = data.data, rowSize = data.width * 4;
    var tmp;
    if (coords[p1 * 2 + 1] > coords[p2 * 2 + 1]) {
      tmp = p1; p1 = p2; p2 = tmp; tmp = c1; c1 = c2; c2 = tmp;
    }
    if (coords[p2 * 2 + 1] > coords[p3 * 2 + 1]) {
      tmp = p2; p2 = p3; p3 = tmp; tmp = c2; c2 = c3; c3 = tmp;
    }
    if (coords[p1 * 2 + 1] > coords[p2 * 2 + 1]) {
      tmp = p1; p1 = p2; p2 = tmp; tmp = c1; c1 = c2; c2 = tmp;
    }
    var x1 = (coords[p1 * 2] + context.offsetX) * context.scaleX;
    var y1 = (coords[p1 * 2 + 1] + context.offsetY) * context.scaleY;
    var x2 = (coords[p2 * 2] + context.offsetX) * context.scaleX;
    var y2 = (coords[p2 * 2 + 1] + context.offsetY) * context.scaleY;
    var x3 = (coords[p3 * 2] + context.offsetX) * context.scaleX;
    var y3 = (coords[p3 * 2 + 1] + context.offsetY) * context.scaleY;
    if (y1 >= y3) {
      return;
    }
    var c1i = c1 * 3, c2i = c2 * 3, c3i = c3 * 3;
    var c1r = colors[c1i], c1g = colors[c1i + 1], c1b = colors[c1i + 2];
    var c2r = colors[c2i], c2g = colors[c2i + 1], c2b = colors[c2i + 2];
    var c3r = colors[c3i], c3g = colors[c3i + 1], c3b = colors[c3i + 2];

    var minY = Math.round(y1), maxY = Math.round(y3);
    var xa, car, cag, cab;
    var xb, cbr, cbg, cbb;
    var k;
    for (var y = minY; y <= maxY; y++) {
      if (y < y2) {
        k = y < y1 ? 0 : y1 === y2 ? 1 : (y1 - y) / (y1 - y2);
        xa = x1 - (x1 - x2) * k;
        car = c1r - (c1r - c2r) * k;
        cag = c1g - (c1g - c2g) * k;
        cab = c1b - (c1b - c2b) * k;
      } else {
        k = y > y3 ? 1 : y2 === y3 ? 0 : (y2 - y) / (y2 - y3);
        xa = x2 - (x2 - x3) * k;
        car = c2r - (c2r - c3r) * k;
        cag = c2g - (c2g - c3g) * k;
        cab = c2b - (c2b - c3b) * k;
      }
      k = y < y1 ? 0 : y > y3 ? 1 : (y1 - y) / (y1 - y3);
      xb = x1 - (x1 - x3) * k;
      cbr = c1r - (c1r - c3r) * k;
      cbg = c1g - (c1g - c3g) * k;
      cbb = c1b - (c1b - c3b) * k;
      var x1_ = Math.round(Math.min(xa, xb));
      var x2_ = Math.round(Math.max(xa, xb));
      var j = rowSize * y + x1_ * 4;
      for (var x = x1_; x <= x2_; x++) {
        k = (xa - x) / (xa - xb);
        k = k < 0 ? 0 : k > 1 ? 1 : k;
        bytes[j++] = (car - (car - cbr) * k) | 0;
        bytes[j++] = (cag - (cag - cbg) * k) | 0;
        bytes[j++] = (cab - (cab - cbb) * k) | 0;
        bytes[j++] = 255;
      }
    }
  }

  function drawFigure(data, figure, context) {
    var ps = figure.coords;
    var cs = figure.colors;
    switch (figure.type) {
      case 'lattice':
        var verticesPerRow = figure.verticesPerRow;
        var rows = Math.floor(ps.length / verticesPerRow) - 1;
        var cols = verticesPerRow - 1;
        for (var i = 0; i < rows; i++) {
          var q = i * verticesPerRow;
          for (var j = 0; j < cols; j++, q++) {
            drawTriangle(data, context,
              ps[q], ps[q + 1], ps[q + verticesPerRow],
              cs[q], cs[q + 1], cs[q + verticesPerRow]);
            drawTriangle(data, context,
              ps[q + verticesPerRow + 1], ps[q + 1], ps[q + verticesPerRow],
              cs[q + verticesPerRow + 1], cs[q + 1], cs[q + verticesPerRow]);
          }
        }
        break;
      case 'triangles':
        for (var i = 0, ii = ps.length; i < ii; i += 3) {
          drawTriangle(data, context,
            ps[i], ps[i + 1], ps[i + 2],
            cs[i], cs[i + 1], cs[i + 2]);
        }
        break;
      default:
        error('illigal figure');
        break;
    }
  }

  function createMeshCanvas(bounds, combinesScale, coords, colors, figures,
                            backgroundColor) {
    
    
    var EXPECTED_SCALE = 1.1;
    
    var MAX_PATTERN_SIZE = 3000; 

    var boundsWidth = bounds[2] - bounds[0];
    var boundsHeight = bounds[3] - bounds[1];

    var width = Math.min(Math.ceil(Math.abs(boundsWidth * combinesScale[0] *
      EXPECTED_SCALE)), MAX_PATTERN_SIZE);
    var height = Math.min(Math.ceil(Math.abs(boundsHeight * combinesScale[1] *
      EXPECTED_SCALE)), MAX_PATTERN_SIZE);
    var scaleX = width / boundsWidth;
    var scaleY = height / boundsHeight;

    var tmpCanvas = CachedCanvases.getCanvas('mesh', width, height, false);
    var tmpCtx = tmpCanvas.context;
    if (backgroundColor) {
      tmpCtx.fillStyle = makeCssRgb(backgroundColor);
      tmpCtx.fillRect(0, 0, width, height);
    }

    var context = {
      coords: coords,
      colors: colors,
      offsetX: -bounds[0],
      offsetY: -bounds[1],
      scaleX: scaleX,
      scaleY: scaleY
    };

    var data = tmpCtx.getImageData(0, 0, width, height);
    for (var i = 0; i < figures.length; i++) {
      drawFigure(data, figures[i], context);
    }
    tmpCtx.putImageData(data, 0, 0);

    return {canvas: tmpCanvas.canvas, scaleX: 1 / scaleX, scaleY: 1 / scaleY};
  }
  return createMeshCanvas;
})();

ShadingIRs.Mesh = {
  fromIR: function Mesh_fromIR(raw) {
    var type = raw[1];
    var coords = raw[2];
    var colors = raw[3];
    var figures = raw[4];
    var bounds = raw[5];
    var matrix = raw[6];
    var bbox = raw[7];
    var background = raw[8];
    return {
      type: 'Pattern',
      getPattern: function Mesh_getPattern(ctx, owner, shadingFill) {
        var combinedScale;
        
        if (shadingFill) {
          combinedScale = Util.singularValueDecompose2dScale(
            ctx.mozCurrentTransform);
        } else {
          var matrixScale = Util.singularValueDecompose2dScale(matrix);
          var curMatrixScale = Util.singularValueDecompose2dScale(
            owner.baseTransform);
          combinedScale = [matrixScale[0] * curMatrixScale[0],
            matrixScale[1] * curMatrixScale[1]];
        }


        
        
        
        var temporaryPatternCanvas = createMeshCanvas(bounds, combinedScale,
          coords, colors, figures, shadingFill ? null : background);

        if (!shadingFill) {
          ctx.setTransform.apply(ctx, owner.baseTransform);
          if (matrix) {
            ctx.transform.apply(ctx, matrix);
          }
        }

        ctx.translate(bounds[0], bounds[1]);
        ctx.scale(temporaryPatternCanvas.scaleX,
                  temporaryPatternCanvas.scaleY);

        return ctx.createPattern(temporaryPatternCanvas.canvas, 'no-repeat');
      }
    };
  }
};

ShadingIRs.Dummy = {
  fromIR: function Dummy_fromIR() {
    return {
      type: 'Pattern',
      getPattern: function Dummy_fromIR_getPattern() {
        return 'hotpink';
      }
    };
  }
};

function getShadingPatternFromIR(raw) {
  var shadingIR = ShadingIRs[raw[0]];
  if (!shadingIR) {
    error('Unknown IR type: ' + raw[0]);
  }
  return shadingIR.fromIR(raw);
}

var TilingPattern = (function TilingPatternClosure() {
  var PaintType = {
    COLORED: 1,
    UNCOLORED: 2
  };

  var MAX_PATTERN_SIZE = 3000; 

  function TilingPattern(IR, color, ctx, objs, commonObjs, baseTransform) {
    this.name = IR[1][0].name;
    this.operatorList = IR[2];
    this.matrix = IR[3] || [1, 0, 0, 1, 0, 0];
    this.bbox = IR[4];
    this.xstep = IR[5];
    this.ystep = IR[6];
    this.paintType = IR[7];
    this.tilingType = IR[8];
    this.color = color;
    this.objs = objs;
    this.commonObjs = commonObjs;
    this.baseTransform = baseTransform;
    this.type = 'Pattern';
    this.ctx = ctx;
  }

  TilingPattern.prototype = {
    createPatternCanvas: function TilinPattern_createPatternCanvas(owner) {
      var operatorList = this.operatorList;
      var bbox = this.bbox;
      var xstep = this.xstep;
      var ystep = this.ystep;
      var paintType = this.paintType;
      var tilingType = this.tilingType;
      var color = this.color;
      var objs = this.objs;
      var commonObjs = this.commonObjs;
      var ctx = this.ctx;

      info('TilingType: ' + tilingType);

      var x0 = bbox[0], y0 = bbox[1], x1 = bbox[2], y1 = bbox[3];

      var topLeft = [x0, y0];
      
      var botRight = [x0 + xstep, y0 + ystep];

      var width = botRight[0] - topLeft[0];
      var height = botRight[1] - topLeft[1];

      
      var matrixScale = Util.singularValueDecompose2dScale(this.matrix);
      var curMatrixScale = Util.singularValueDecompose2dScale(
        this.baseTransform);
      var combinedScale = [matrixScale[0] * curMatrixScale[0],
        matrixScale[1] * curMatrixScale[1]];

      
      
      
      
      width = Math.min(Math.ceil(Math.abs(width * combinedScale[0])),
        MAX_PATTERN_SIZE);

      height = Math.min(Math.ceil(Math.abs(height * combinedScale[1])),
        MAX_PATTERN_SIZE);

      var tmpCanvas = CachedCanvases.getCanvas('pattern', width, height, true);
      var tmpCtx = tmpCanvas.context;
      var graphics = new CanvasGraphics(tmpCtx, commonObjs, objs);
      graphics.groupLevel = owner.groupLevel;

      this.setFillAndStrokeStyleToContext(tmpCtx, paintType, color);

      this.setScale(width, height, xstep, ystep);
      this.transformToScale(graphics);

      
      var tmpTranslate = [1, 0, 0, 1, -topLeft[0], -topLeft[1]];
      graphics.transform.apply(graphics, tmpTranslate);

      this.clipBbox(graphics, bbox, x0, y0, x1, y1);

      graphics.executeOperatorList(operatorList);
      return tmpCanvas.canvas;
    },

    setScale: function TilingPattern_setScale(width, height, xstep, ystep) {
      this.scale = [width / xstep, height / ystep];
    },

    transformToScale: function TilingPattern_transformToScale(graphics) {
      var scale = this.scale;
      var tmpScale = [scale[0], 0, 0, scale[1], 0, 0];
      graphics.transform.apply(graphics, tmpScale);
    },

    scaleToContext: function TilingPattern_scaleToContext() {
      var scale = this.scale;
      this.ctx.scale(1 / scale[0], 1 / scale[1]);
    },

    clipBbox: function clipBbox(graphics, bbox, x0, y0, x1, y1) {
      if (bbox && isArray(bbox) && 4 == bbox.length) {
        var bboxWidth = x1 - x0;
        var bboxHeight = y1 - y0;
        graphics.rectangle(x0, y0, bboxWidth, bboxHeight);
        graphics.clip();
        graphics.endPath();
      }
    },

    setFillAndStrokeStyleToContext:
      function setFillAndStrokeStyleToContext(context, paintType, color) {
        switch (paintType) {
          case PaintType.COLORED:
            var ctx = this.ctx;
            context.fillStyle = ctx.fillStyle;
            context.strokeStyle = ctx.strokeStyle;
            break;
          case PaintType.UNCOLORED:
            var rgbColor = ColorSpace.singletons.rgb.getRgb(color, 0);
            var cssColor = Util.makeCssRgb(rgbColor);
            context.fillStyle = cssColor;
            context.strokeStyle = cssColor;
            break;
          default:
            error('Unsupported paint type: ' + paintType);
        }
      },

    getPattern: function TilingPattern_getPattern(ctx, owner) {
      var temporaryPatternCanvas = this.createPatternCanvas(owner);

      var ctx = this.ctx;
      ctx.setTransform.apply(ctx, this.baseTransform);
      ctx.transform.apply(ctx, this.matrix);
      this.scaleToContext();

      return ctx.createPattern(temporaryPatternCanvas, 'repeat');
    }
  };

  return TilingPattern;
})();


PDFJS.disableFontFace = false;

var FontLoader = {
  insertRule: function fontLoaderInsertRule(rule) {
    var styleElement = document.getElementById('PDFJS_FONT_STYLE_TAG');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'PDFJS_FONT_STYLE_TAG';
      document.documentElement.getElementsByTagName('head')[0].appendChild(
        styleElement);
    }

    var styleSheet = styleElement.sheet;
    styleSheet.insertRule(rule, styleSheet.cssRules.length);
  },

  clear: function fontLoaderClear() {
    var styleElement = document.getElementById('PDFJS_FONT_STYLE_TAG');
    if (styleElement) {
      styleElement.parentNode.removeChild(styleElement);
    }
  },

  get loadTestFont() {
    
    
    return shadow(this, 'loadTestFont', atob(
      'T1RUTwALAIAAAwAwQ0ZGIDHtZg4AAAOYAAAAgUZGVE1lkzZwAAAEHAAAABxHREVGABQAFQ' +
      'AABDgAAAAeT1MvMlYNYwkAAAEgAAAAYGNtYXABDQLUAAACNAAAAUJoZWFk/xVFDQAAALwA' +
      'AAA2aGhlYQdkA+oAAAD0AAAAJGhtdHgD6AAAAAAEWAAAAAZtYXhwAAJQAAAAARgAAAAGbm' +
      'FtZVjmdH4AAAGAAAAAsXBvc3T/hgAzAAADeAAAACAAAQAAAAEAALZRFsRfDzz1AAsD6AAA' +
      'AADOBOTLAAAAAM4KHDwAAAAAA+gDIQAAAAgAAgAAAAAAAAABAAADIQAAAFoD6AAAAAAD6A' +
      'ABAAAAAAAAAAAAAAAAAAAAAQAAUAAAAgAAAAQD6AH0AAUAAAKKArwAAACMAooCvAAAAeAA' +
      'MQECAAACAAYJAAAAAAAAAAAAAQAAAAAAAAAAAAAAAFBmRWQAwAAuAC4DIP84AFoDIQAAAA' +
      'AAAQAAAAAAAAAAACAAIAABAAAADgCuAAEAAAAAAAAAAQAAAAEAAAAAAAEAAQAAAAEAAAAA' +
      'AAIAAQAAAAEAAAAAAAMAAQAAAAEAAAAAAAQAAQAAAAEAAAAAAAUAAQAAAAEAAAAAAAYAAQ' +
      'AAAAMAAQQJAAAAAgABAAMAAQQJAAEAAgABAAMAAQQJAAIAAgABAAMAAQQJAAMAAgABAAMA' +
      'AQQJAAQAAgABAAMAAQQJAAUAAgABAAMAAQQJAAYAAgABWABYAAAAAAAAAwAAAAMAAAAcAA' +
      'EAAAAAADwAAwABAAAAHAAEACAAAAAEAAQAAQAAAC7//wAAAC7////TAAEAAAAAAAABBgAA' +
      'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAA' +
      'AAAAD/gwAyAAAAAQAAAAAAAAAAAAAAAAAAAAABAAQEAAEBAQJYAAEBASH4DwD4GwHEAvgc' +
      'A/gXBIwMAYuL+nz5tQXkD5j3CBLnEQACAQEBIVhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWF' +
      'hYWFhYWFhYAAABAQAADwACAQEEE/t3Dov6fAH6fAT+fPp8+nwHDosMCvm1Cvm1DAz6fBQA' +
      'AAAAAAABAAAAAMmJbzEAAAAAzgTjFQAAAADOBOQpAAEAAAAAAAAADAAUAAQAAAABAAAAAg' +
      'ABAAAAAAAAAAAD6AAAAAAAAA=='
    ));
  },

  loadTestFontId: 0,

  loadingContext: {
    requests: [],
    nextRequestId: 0
  },

  isSyncFontLoadingSupported: (function detectSyncFontLoadingSupport() {
    if (isWorker) {
      return false;
    }

    
    
    var userAgent = window.navigator.userAgent;
    var m = /Mozilla\/5.0.*?rv:(\d+).*? Gecko/.exec(userAgent);
    if (m && m[1] >= 14) {
      return true;
    }
    
    return false;
  })(),

  bind: function fontLoaderBind(fonts, callback) {
    assert(!isWorker, 'bind() shall be called from main thread');

    var rules = [], fontsToLoad = [];
    for (var i = 0, ii = fonts.length; i < ii; i++) {
      var font = fonts[i];

      
      
      if (font.attached || font.loading === false) {
        continue;
      }
      font.attached = true;

      var rule = font.bindDOM();
      if (rule) {
        rules.push(rule);
        fontsToLoad.push(font);
      }
    }

    var request = FontLoader.queueLoadingCallback(callback);
    if (rules.length > 0 && !this.isSyncFontLoadingSupported) {
      FontLoader.prepareFontLoadEvent(rules, fontsToLoad, request);
    } else {
      request.complete();
    }
  },

  queueLoadingCallback: function FontLoader_queueLoadingCallback(callback) {
    function LoadLoader_completeRequest() {
      assert(!request.end, 'completeRequest() cannot be called twice');
      request.end = Date.now();

      
      while (context.requests.length > 0 && context.requests[0].end) {
        var otherRequest = context.requests.shift();
        setTimeout(otherRequest.callback, 0);
      }
    }

    var context = FontLoader.loadingContext;
    var requestId = 'pdfjs-font-loading-' + (context.nextRequestId++);
    var request = {
      id: requestId,
      complete: LoadLoader_completeRequest,
      callback: callback,
      started: Date.now()
    };
    context.requests.push(request);
    return request;
  },

  prepareFontLoadEvent: function fontLoaderPrepareFontLoadEvent(rules,
                                                                fonts,
                                                                request) {
      
      
      
      
      
      

      function int32(data, offset) {
        return (data.charCodeAt(offset) << 24) |
               (data.charCodeAt(offset + 1) << 16) |
               (data.charCodeAt(offset + 2) << 8) |
               (data.charCodeAt(offset + 3) & 0xff);
      }

      function string32(value) {
        return String.fromCharCode((value >> 24) & 0xff) +
               String.fromCharCode((value >> 16) & 0xff) +
               String.fromCharCode((value >> 8) & 0xff) +
               String.fromCharCode(value & 0xff);
      }

      function spliceString(s, offset, remove, insert) {
        var chunk1 = data.substr(0, offset);
        var chunk2 = data.substr(offset + remove);
        return chunk1 + insert + chunk2;
      }

      var i, ii;

      var canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      var ctx = canvas.getContext('2d');

      var called = 0;
      function isFontReady(name, callback) {
        called++;
        
        if(called > 30) {
          warn('Load test font never loaded.');
          callback();
          return;
        }
        ctx.font = '30px ' + name;
        ctx.fillText('.', 0, 20);
        var imageData = ctx.getImageData(0, 0, 1, 1);
        if (imageData.data[3] > 0) {
          callback();
          return;
        }
        setTimeout(isFontReady.bind(null, name, callback));
      }

      var loadTestFontId = 'lt' + Date.now() + this.loadTestFontId++;
      
      
      
      
      
      var data = this.loadTestFont;
      var COMMENT_OFFSET = 976; 
      data = spliceString(data, COMMENT_OFFSET, loadTestFontId.length,
                          loadTestFontId);
      
      var CFF_CHECKSUM_OFFSET = 16;
      var XXXX_VALUE = 0x58585858; 
      var checksum = int32(data, CFF_CHECKSUM_OFFSET);
      for (i = 0, ii = loadTestFontId.length - 3; i < ii; i += 4) {
        checksum = (checksum - XXXX_VALUE + int32(loadTestFontId, i)) | 0;
      }
      if (i < loadTestFontId.length) { 
        checksum = (checksum - XXXX_VALUE +
                    int32(loadTestFontId + 'XXX', i)) | 0;
      }
      data = spliceString(data, CFF_CHECKSUM_OFFSET, 4, string32(checksum));

      var url = 'url(data:font/opentype;base64,' + btoa(data) + ');';
      var rule = '@font-face { font-family:"' + loadTestFontId + '";src:' +
                 url + '}';
      FontLoader.insertRule(rule);

      var names = [];
      for (i = 0, ii = fonts.length; i < ii; i++) {
        names.push(fonts[i].loadedName);
      }
      names.push(loadTestFontId);

      var div = document.createElement('div');
      div.setAttribute('style',
                       'visibility: hidden;' +
                       'width: 10px; height: 10px;' +
                       'position: absolute; top: 0px; left: 0px;');
      for (i = 0, ii = names.length; i < ii; ++i) {
        var span = document.createElement('span');
        span.textContent = 'Hi';
        span.style.fontFamily = names[i];
        div.appendChild(span);
      }
      document.body.appendChild(div);

      isFontReady(loadTestFontId, function() {
        document.body.removeChild(div);
        request.complete();
      });
      
  }

















};

var FontFace = (function FontFaceClosure() {
  function FontFace(name, file, properties) {
    this.compiledGlyphs = {};
    if (arguments.length === 1) {
      
      var data = arguments[0];
      for (var i in data) {
        this[i] = data[i];
      }
      return;
    }
  }
  FontFace.prototype = {
    bindDOM: function FontFace_bindDOM() {
      if (!this.data) {
        return null;
      }

      if (PDFJS.disableFontFace) {
        this.disableFontFace = true;
        return null;
      }

      var data = bytesToString(this.data);
      var fontName = this.loadedName;

      
      var url = ('url(data:' + this.mimetype + ';base64,' +
                 window.btoa(data) + ');');
      var rule = '@font-face { font-family:"' + fontName + '";src:' + url + '}';
      FontLoader.insertRule(rule);

      if (PDFJS.pdfBug && 'FontInspector' in globalScope &&
          globalScope['FontInspector'].enabled) {
        globalScope['FontInspector'].fontAdded(this, url);
      }

      return rule;
    },

    getPathGenerator: function (objs, character) {
      if (!(character in this.compiledGlyphs)) {
        var js = objs.get(this.loadedName + '_path_' + character);
        
        this.compiledGlyphs[character] = new Function('c', 'size', js);
      }
      return this.compiledGlyphs[character];
    }
  };
  return FontFace;
})();


}).call((typeof window === 'undefined') ? this : window);

if (!PDFJS.workerSrc && typeof document !== 'undefined') {
  
  PDFJS.workerSrc = (function () {
    'use strict';
    var scriptTagContainer = document.body ||
                             document.getElementsByTagName('head')[0];
    var pdfjsSrc = scriptTagContainer.lastChild.src;
    return pdfjsSrc && pdfjsSrc.replace(/\.js$/i, '.worker.js');
  })();
}
