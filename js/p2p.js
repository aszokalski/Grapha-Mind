var peer = new Peer(); 

//console.log(id)

var conn = peer.connect('another-peers-id');
// on open will be launch when you successfully connect to PeerServer
conn.on('open', function(){
  // here you have conn.id
  conn.send('hi!');
});



peer.on('connection', function(conn) {
    conn.on('data', function(data){
      // Will print 'hi!'
      console.log(data);
    });
  });


  
  var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  getUserMedia({video: true, audio: true}, function(stream) {
    var call = peer.call('another-peers-id', stream);
    call.on('stream', function(remoteStream) {
      // Show stream in some video/canvas element.
    });
  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
  


  var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  peer.on('call', function(call) {
    getUserMedia({video: true, audio: true}, function(stream) {
      call.answer(stream); // Answer the call with an A/V stream.
      call.on('stream', function(remoteStream) {
        // Show stream in some video/canvas element.
      });
    }, function(err) {
      console.log('Failed to get local stream' ,err);
    });
  });
  