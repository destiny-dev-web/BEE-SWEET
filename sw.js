const V='bee-sweet-v2',SHELL=['./','index.html','admin.html','offline.html','config.js','manifest.webmanifest','icons/logo.png','icons/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res})
    .catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('offline.html'):Response.error()))));
});

self.addEventListener('push',e=>{
  let d={};try{d=e.data.json()}catch(_){}
  const icon=new URL('icons/icon-192.png',self.registration.scope).href;
  e.waitUntil(Promise.all([
    self.registration.showNotification(d.title||'New order',{body:d.body||'',icon,badge:icon,tag:'bs-alert',renotify:true,vibrate:[200,100,200,100,200],data:{url:d.url||'admin.html'}}),
    (self.navigator&&self.navigator.setAppBadge)?self.navigator.setAppBadge(d.count||1).catch(()=>{}):Promise.resolve()
  ]));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||'admin.html',self.registration.scope).href;
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
    for(const c of l){if(c.url.split('#')[0]===url&&'focus' in c)return c.focus()}
    return clients.openWindow(url);
  }));
});
