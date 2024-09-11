import React, { useRef, useState, useEffect } from 'react';
import '../index.css';

function VideoPlayer() {
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const progressBarRef = useRef(null);
  const elapsedTimeRef = useRef(null);
  const remainingTimeRef = useRef(null);

  const [totalDuration, setTotalDuration] = useState(0);
  const [highlightStartTime, setHighlightStartTime] = useState(null);
  const [currentHighlightElement, setCurrentHighlightElement] = useState(null);
  const [isHighlighting, setIsHighlighting] = useState(false);

  useEffect(() => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;

    video1.play().catch(error => console.log("Autoplay failed for video1:", error));
    video2.play().catch(error => console.log("Autoplay failed for video2:", error));

    // אירוע שמעדכן את ה-progress bar תוך כדי שהסרטונים מתנגנים
    const updateProgressBar = () => {
      const currentTime = video1.currentTime;
      const progressPercentage = (currentTime / totalDuration) * 100;
      progressBarRef.current.style.width = `${progressPercentage}%`;

      elapsedTimeRef.current.textContent = formatTime(currentTime);
      remainingTimeRef.current.textContent = `-${formatTime(totalDuration - currentTime)}`;

      if (isHighlighting && currentHighlightElement) {
        const highlightDuration = currentTime - highlightStartTime;
        currentHighlightElement.style.width = `${(highlightDuration / totalDuration) * 100}%`;
      }
    };

    video1.addEventListener('timeupdate', updateProgressBar);
    video2.addEventListener('timeupdate', updateProgressBar);

    return () => {
      video1.removeEventListener('timeupdate', updateProgressBar);
      video2.removeEventListener('timeupdate', updateProgressBar);
    };
  }, [totalDuration, isHighlighting, currentHighlightElement, highlightStartTime]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const handleHighlightClick = () => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;
  
    const currentTime = video1.currentTime;
  
    if (!isHighlighting) {
      setHighlightStartTime(currentTime);
      // Ensure progressContainerRef exists before using appendChild
      if (progressBarRef.current) {
        const highlightElement = document.createElement('div');
        highlightElement.className = 'highlight';
        highlightElement.style.left = `${(currentTime / totalDuration) * 100}%`;
        progressBarRef.current.appendChild(highlightElement);
        setCurrentHighlightElement(highlightElement);
      } else {
        console.error('Progress bar container is not available.');
      }
    } else {
      // Handle highlight end logic
      if (highlightStartTime !== null && currentTime > highlightStartTime) {
        const highlightDuration = currentTime - highlightStartTime;
        currentHighlightElement.style.width = `${(highlightDuration / totalDuration) * 100}%`;
      }
      setCurrentHighlightElement(null);
    }
  
    setIsHighlighting(!isHighlighting);
  };

  return (
    <div className="container">
      <div className="header">
        <img className="logo icon" src="/logo/logo.svg" alt="Logo2" />
        <img className="logo nameLogo" src="/logo/nameLogo.svg" alt="NameCompany" />
        <img className="logo sloganLogo" src="/logo/sloganLogo.svg" alt="sloganCompany" />
      </div>

      {/* Video elements */}
      <video id="video1" ref={video1Ref} src="/videos/Video1 Lior_noy_test2 28_06_2023 18_48_16 1.mp4" muted controls></video>
      <video id="video2" ref={video2Ref} src="/videos/Video3 Lior_noy_test2 28_06_2023 18_48_16 3.mp4" muted controls ></video>

      <button id="highlightButton" className="startButton" onClick={handleHighlightClick}>
        Highlight Start
      </button>

      <div className="progress-container" ref={progressBarRef}>
        <div className="progress-bar"></div>
        <div className="timer elapsed-time" ref={elapsedTimeRef}>00:00</div>
        <div className="timer remaining-time" ref={remainingTimeRef}>-00:00</div>
      </div>
    </div>
  );
}

export default VideoPlayer;
