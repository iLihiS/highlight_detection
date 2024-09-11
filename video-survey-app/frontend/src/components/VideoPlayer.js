import React, { useRef, useState, useEffect } from 'react';
import '../index.css';

function VideoPlayer() {
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const progressBarRef = useRef(null);
  const progressContainerRef = useRef(null);

  const [totalDuration, setTotalDuration] = useState(0);
  const [highlightStartTime, setHighlightStartTime] = useState(null);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [currentHighlightElement, setCurrentHighlightElement] = useState(null);

  // Load the video metadata and set the total duration
  useEffect(() => {
    const video1 = video1Ref.current;

    video1.addEventListener('loadedmetadata', () => {
      setTotalDuration(video1.duration);
    });

    // Update the progress bar as the video plays
    const updateProgressBar = () => {
      const currentTime = video1.currentTime;
      const progressPercentage = (currentTime / totalDuration) * 100;
      progressBarRef.current.style.width = `${progressPercentage}%`;

      // If highlighting is active, update the green highlight bar width dynamically
      if (isHighlighting && currentHighlightElement) {
        const highlightDuration = currentTime - highlightStartTime;
        currentHighlightElement.style.width = `${(highlightDuration / totalDuration) * 100}%`;
      }
    };

    video1.addEventListener('timeupdate', updateProgressBar);

    return () => {
      video1.removeEventListener('timeupdate', updateProgressBar);
    };
  }, [totalDuration, isHighlighting, currentHighlightElement, highlightStartTime]);

  // Handle highlight button click (toggle between start and stop highlighting)
  const handleHighlightClick = () => {
    const video1 = video1Ref.current;
    const currentTime = video1.currentTime;

    if (!isHighlighting) {
      // Start highlight: Create a new temp-highlight element and set its position
      setHighlightStartTime(currentTime);

      const newHighlightElement = document.createElement('div');
      newHighlightElement.className = 'temp-highlight'; // Temporary highlight
      newHighlightElement.style.left = `${(currentTime / totalDuration) * 100}%`;
      newHighlightElement.style.width = '0%'; // Initial width
      progressContainerRef.current.appendChild(newHighlightElement);
      setCurrentHighlightElement(newHighlightElement); // Keep track of the element
    } else {
      // End highlight: Fix the width and change the class to highlight
      const highlightDuration = currentTime - highlightStartTime;
      if (currentHighlightElement) {
        currentHighlightElement.style.width = `${(highlightDuration / totalDuration) * 100}%`;
        currentHighlightElement.className = 'highlight'; // Change to fixed highlight
      }
      setCurrentHighlightElement(null); // Reset the current highlight
    }

    setIsHighlighting(!isHighlighting); // Toggle highlight state
  };

  return (
    <div className="container">
      {/* Header with logos */}
      <div className="header">
        <img className="logo icon" src="/logo/logo.svg" alt="Logo" />
        <img className="logo nameLogo" src="/logo/nameLogo.svg" alt="NameCompany" />
        <img className="logo sloganLogo" src="/logo/sloganLogo.svg" alt="SloganCompany" />
      </div>

      {/* Video elements */}
      <video id="video1" ref={video1Ref} src="/videos/Video1 Lior_noy_test2 28_06_2023 18_48_16 1.mp4" muted controls></video>
      <video id="video2" ref={video2Ref} src="/videos/Video3 Lior_noy_test2 28_06_2023 18_48_16 3.mp4" muted controls></video>

      {/* Highlight start/stop button */}
      <button onClick={handleHighlightClick} className={isHighlighting ? 'stopButton' : 'startButton'}>
        {isHighlighting ? 'End Highlight' : 'Start Highlight'}
      </button>

      {/* Progress Bar */}
      <div className="progress-container" ref={progressContainerRef}>
        <div className="progress-bar" ref={progressBarRef}></div>
        {/* The dynamic highlights will be appended here */}
      </div>
    </div>
  );
}

export default VideoPlayer;
