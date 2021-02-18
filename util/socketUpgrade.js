exports.handleUpgrade = (request, socket, head, app) => {
  const publicWS = app.get('publicWS');
  const pathname = new URL(`http://${request.headers.host}${request.url}`)
    .pathname;

  console.log(pathname);
  switch (pathname) {
    case '/api/realtime/public':
      publicWS.wss.handleUpgrade(request, socket, head, function done(ws) {
        publicWS.wss.emit('connection', ws, request);
      });
      break;
  }
};
