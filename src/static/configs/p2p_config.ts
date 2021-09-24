export const p2p_config = {
  config: {'iceServers': 
    [
      { url: 'stun:stun.1mind.pl:5349' },
      { url: 'turn:eu-turn8.xirsys.com:80?transport=udp', username: "DJVsNS8aBB11Rpr5_XzJFM-PapZ_82cucC25PDNakDmqiQB265rAGQdk74i99bt4AAAAAGFMqTVhc3pva2Fsc2tp",
      credential: "1c850b50-1c8a-11ec-ab67-0242ac140004" },
      
    ]   
} /* Sample servers, please use appropriate ones */
} as Object;

//TODO: Change TURN servers for our own