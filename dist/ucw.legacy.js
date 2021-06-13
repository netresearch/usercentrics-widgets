!function(){"use strict";function t(e){return(t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(e)}function e(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function n(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function r(t,e,r){return e&&n(t.prototype,e),r&&n(t,r),t}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&c(t,e)}function o(t){return(o=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function c(t,e){return(c=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function a(t,e){return!e||"object"!=typeof e&&"function"!=typeof e?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):e}function u(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=o(t);if(e){var i=o(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return a(this,n)}}function s(t,e,n){return(s="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(t,e,n){var r=function(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=o(t)););return t}(t,e);if(r){var i=Object.getOwnPropertyDescriptor(r,e);return i.get?i.get.call(n):i.value}})(t,e,n||t)}function l(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function h(t,e){var n="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!n){if(Array.isArray(t)||(n=function(t,e){if(t){if("string"==typeof t)return l(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?l(t,e):void 0}}(t))||e&&t&&"number"==typeof t.length){n&&(t=n);var r=0,i=function(){};return{s:i,n:function(){return r>=t.length?{done:!0}:{done:!1,value:t[r++]}},e:function(t){throw t},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,c=!0,a=!1;return{s:function(){n=n.call(t)},n:function(){var t=n.next();return c=t.done,t},e:function(t){a=!0,o=t},f:function(){try{c||null==n.return||n.return()}finally{if(a)throw o}}}}function f(){var e,n=this.parentNode,r=arguments.length;if(n)for(r||n.removeChild(this);r--;)"object"!==t(e=arguments[r])?e=this.ownerDocument.createTextNode(e):e.parentNode&&e.parentNode.removeChild(e),r?n.insertBefore(this.previousSibling,e):n.replaceChild(e,this)}Element.prototype.replaceWith||(Element.prototype.replaceWith=f),CharacterData.prototype.replaceWith||(CharacterData.prototype.replaceWith=f),DocumentType.prototype.replaceWith||(DocumentType.prototype.replaceWith=f);var p=function(){function t(){e(this,t)}return r(t,[{key:"waitForCmp",value:function(t){window.UC_UI&&window.UC_UI.isInitialized()?t():window.addEventListener("UC_UI_INITIALIZED",(function(e){t()}))}},{key:"waitForCmpConsent",value:function(t,e){var n=this;this.waitForCmp((function(){!0===n.getConsent(t)&&e()}))}},{key:"isCmpReady",value:function(){return window.UC_UI&&window.UC_UI.isInitialized()}},{key:"setConsent",value:function(t){if(!this.isCmpReady())throw new Error("Usercentrics CMP is not ready!");window.UC_UI.acceptService(t)}},{key:"getConsent",value:function(t){try{for(var e=window.UC_UI.getServicesBaseInfo(),n=0;n<e.length;n++)if(e[n].id===t)return!!e[n].consent.status;return!1}catch(t){return!1}}}]),t}(),d=new(function(){function t(){e(this,t),this.store={}}return r(t,[{key:"register",value:function(t,e){this.store[t]||(this.store[t]=[]),this.store[t].push(e)}},{key:"unregister",value:function(t,e){var n=this.store[t];if(n)for(var r=0;r<n.length;r++)if(n[r]===e){delete n[r];break}}},{key:"unregisterAll",value:function(t){this.store[t]=[]}},{key:"activate",value:function(t){var e=this.store[t];if(e)for(var n=0;n<e.length;n++)e[n]&&e[n].activate(!1);this.unregisterAll(t)}},{key:"linkCmp",value:function(){for(var t=this,e=new p,n=function(){var n=i[r];e.waitForCmpConsent(n,(function(){return t.activate(n)}))},r=0,i=Object.keys(this.store);r<i.length;r++)n();window.addEventListener("UC_UI_VIEW_CHANGED",(function(n){if(!n.detail||"NONE"!==n.detail.previousView&&"PRIVACY_BUTTON"!==n.detail.previousView)for(var r=function(){var n=o[i];e.waitForCmpConsent(n,(function(){return t.activate(n)}))},i=0,o=Object.keys(t.store);i<o.length;i++)r()}))}}]),t}()),y=function(t){i(c,t);var n=u(c);function c(){return e(this,c),n.apply(this,arguments)}return r(c,[{key:"activate",value:function(t){s(o(c.prototype),"activate",this).call(this,t);var e=this.el;if(e){var n=e.getAttribute("data-src");e.setAttribute("data-src",null),this.container.parentElement.replaceChild(e,this.container),window.setTimeout((function(){e.setAttribute("src",n)}),0)}}}]),c}(function(){function t(n){e(this,t),this.el=n,this.dimensions=this.el.getBoundingClientRect(),this.width=this.el.getAttribute("width"),this.height=this.el.getAttribute("height"),this.ucId=this.el.getAttribute("data-uc-id")}return r(t,[{key:"getEmbeddingText",value:function(){return"This external content may collect data about your activity. Click the button below to show the content."}},{key:"getEmbedding",value:function(){return'\n            <img class="uc-widget-background" src="'.concat(this.getBackground(),'"/>\n            <div class="uc-widget-embedding">\n                <div class="uc-widget-text">').concat(this.getEmbeddingText(),'</div>\n                <div class="uc-widget-control"><button class="uc-widget-accept">Activate</button></div>\n            </div>\n        ')}},{key:"getBackground",value:function(){return"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="}},{key:"activate",value:function(t){(d.unregister(this.ucId,this),d.activate(this.ucId),t)&&(new p).setConsent(this.ucId)}},{key:"render",value:function(){var t=document.createElement("div");t.innerHTML=this.getEmbedding(),t.setAttribute("class","uc-widget-container");var e=this.width?isNaN(this.width)?this.width:"".concat(this.width,"px"):"".concat(this.dimensions.width,"px"),n=this.height?isNaN(this.height)?this.height:"".concat(this.height,"px"):"".concat(this.dimensions.height,"px");t.setAttribute("style","width: ".concat(e,"; height: ").concat(n,";")),this.el.replaceWith(t),t.getElementsByClassName("uc-widget-accept")[0].addEventListener("click",this.activate.bind(this,!0)),this.container=t,d.register(this.ucId,this)}}]),t}()),v=function(){function t(n){e(this,t),this.url=n;var r=n.split("/");this._protocol=r.shift(),r.shift(),this._host=r.shift();var i=r.join("/").split(/[?#]/);this._pathname=i[0]}return r(t,[{key:"host",get:function(){return this._host}},{key:"protocol",get:function(){return this._protocol}},{key:"pathname",get:function(){return this._pathname}}]),t}(),g=function(t){i(c,t);var n=u(c);function c(){return e(this,c),n.apply(this,arguments)}return r(c,[{key:"getBackground",value:function(){var t=this.el.getAttribute("data-src");if(!t)return s(o(c.prototype),"getBackground",this).call(this);try{var e=new v(t).pathname.split("/").pop();return"https://privacy-proxy-server.usercentrics.eu/video/youtube/".concat(e,"-poster-image")}catch(t){return s(o(c.prototype),"getBackground",this).call(this)}}}]),c}(y),w=function(){function t(){e(this,t)}return r(t,null,[{key:"create",value:function(t){try{var e=new v(t.getAttribute("data-src")).host;t.tagName.toLowerCase();return/\.youtube(-nocookie)\./.test(e)?new g(t):new y(t)}catch(e){return new y(t)}}}]),t}();function m(){if("complete"===document.readyState){document.removeEventListener("readystatechange",m);var t,e,n=h((t=document.getElementsByClassName("uc-widget"),Array.prototype.slice.call(t)));try{for(n.s();!(e=n.n()).done;){var r=e.value;w.create(r).render()}}catch(t){n.e(t)}finally{n.f()}d.linkCmp()}}"complete"===document.readyState?m():document.addEventListener("readystatechange",m)}();
