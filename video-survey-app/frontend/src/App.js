import React from 'react';
import VideoPlayer from './components/VideoPlayer';

const App = () => {
  return (
    <div>
      <h1>Video Survey</h1>
      <VideoPlayer videoSrc="https://path-to-your-video.mp4" />
    </div>
  );
};

export default App;
