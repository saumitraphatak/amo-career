/* Minimal Chart.js stand-in for browser tests (the real library loads from a CDN, which test sandboxes block). */
(function(){ if (window.Chart) return;
  function C(ctx, cfg){ this.data=(cfg&&cfg.data)||{datasets:[],labels:[]}; this.options=(cfg&&cfg.options)||{}; this.canvas=ctx&&ctx.canvas; }
  C.prototype.update=function(){}; C.prototype.destroy=function(){}; C.prototype.resize=function(){};
  C.register=function(){}; C.defaults={font:{},color:'',plugins:{legend:{labels:{}},tooltip:{}},scale:{grid:{},ticks:{}},scales:{},elements:{line:{},point:{}}};
  window.Chart=C; })();
