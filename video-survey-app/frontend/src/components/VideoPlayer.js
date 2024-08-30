import React, { useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPlayer = ({ videoSrc }) => {
  const videoRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [startTimestamp, setStartTimestamp] = useState(null);

  const handleStart = () => {
    setStartTimestamp(player.currentTime());
  };

  const handleStop = async () => {
    const stopTimestamp = player.currentTime();
    const segment = { start: startTimestamp, end: stopTimestamp };

    await fetch('http://localhost:5000/api/segments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(segment),
    });

    setStartTimestamp(null);
  };

  React.useEffect(() => {
    const vjsPlayer = videojs(videoRef.current, { controls: true, responsive: true, fluid: true });
    setPlayer(vjsPlayer);
    return () => { if (vjsPlayer) vjsPlayer.dispose(); };
  }, []);

  return (
    <div>
      <div data-vjs-player>
        <video ref={videoRef} className="video-js" />
      </div>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
    </div>
  );
};

export default VideoPlayer;
