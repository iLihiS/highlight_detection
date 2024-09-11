import React, { useRef, useState, useEffect } from 'react';
import '../index.css'; // Import the correct CSS path

function VideoPlayer() {
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const progressBarRef = useRef(null);
  const progressContainerRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [highlightStartTime, setHighlightStartTime] = useState(null);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [currentHighlightElement, setCurrentHighlightElement] = useState(null);
  const [highlights, setHighlights] = useState([]); // מערך להיילייטים

  // פונקציה להמרת זמן לפורמט mm:ss:mls
  const formatTimeMLS = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
  };

  useEffect(() => {
    if (!isReady) return;

    const video1 = video1Ref.current;
    const video2 = video2Ref.current;

    if (video1 && video2) {
      video1.play();
      video2.play();

      video1.addEventListener('pause', () => {
        if (!video2.paused) {
          video2.pause();
        }
      });

      video2.addEventListener('pause', () => {
        if (!video1.paused) {
          video1.pause();
        }
      });

      video1.addEventListener('play', () => {
        if (video2.paused) {
          video2.play();
        }
      });

      video2.addEventListener('play', () => {
        if (video1.paused) {
          video1.play();
        }
      });

      video1.addEventListener('seeked', () => {
        if (Math.abs(video1.currentTime - video2.currentTime) > 0.1) {
          video2.currentTime = video1.currentTime;
        }
      });

      video2.addEventListener('seeked', () => {
        if (Math.abs(video2.currentTime - video1.currentTime) > 0.1) {
          video1.currentTime = video2.currentTime;
        }
      });

      video1.addEventListener('loadedmetadata', () => {
        setTotalDuration(video1.duration);
      });

      const updateProgressBar = () => {
        const currentTime = video1.currentTime;
        const progressPercentage = (currentTime / totalDuration) * 100;
        progressBarRef.current.style.width = `${progressPercentage}%`;

        if (isHighlighting && currentHighlightElement) {
          const highlightDuration = currentTime - highlightStartTime;
          currentHighlightElement.style.width = `${(highlightDuration / totalDuration) * 100}%`;
        }
      };

      video1.addEventListener('timeupdate', updateProgressBar);

      return () => {
        video1.removeEventListener('timeupdate', updateProgressBar);
        video1.removeEventListener('pause', () => {});
        video2.removeEventListener('pause', () => {});
        video1.removeEventListener('play', () => {});
        video2.removeEventListener('play', () => {});
        video1.removeEventListener('seeked', () => {});
        video2.removeEventListener('seeked', () => {});
      };
    }
  }, [isReady, totalDuration, isHighlighting, currentHighlightElement, highlightStartTime]);

  // השתמש ב-useEffect להדפסת המערך בכל פעם שהוא מתעדכן
  useEffect(() => {
    console.log("Current highlights array:", highlights);
  }, [highlights]); // יופעל בכל פעם שהמערך משתנה

  // הפונקציה שתופעל כאשר לוחצים על הכפתור בדיב החדש
  const handleReadyClick = () => {
    setIsReady(true); // מסתיר את הדיב ומציג את שאר האלמנטים
  };

  const handleHighlightClick = () => {
    const video1 = video1Ref.current;
    const currentTime = video1.currentTime;

    if (!isHighlighting) {
      // Start highlight: יצירת אלמנט חדש להיילייט והתחלת זמן
      setHighlightStartTime(currentTime);

      const newHighlightElement = document.createElement('div');
      newHighlightElement.className = 'temp-highlight'; // Temporary highlight
      newHighlightElement.style.left = `${(currentTime / totalDuration) * 100}%`;
      newHighlightElement.style.width = '0%'; // Initial width
      progressContainerRef.current.appendChild(newHighlightElement);
      setCurrentHighlightElement(newHighlightElement); // שמירת האלמנט הירוק
      console.log("Highlight started at:", formatTimeMLS(currentTime)); // בדיקה עצמית
    } else {
      // End highlight: חישוב הזמן והכנסת ההיילייט למערך
      const highlightEndTime = currentTime;

      // בדיקה אם זמן הסיום קטן או שווה לזמן ההתחלה
      if (highlightEndTime <= highlightStartTime) {
        console.log("Invalid highlight: end time is earlier than start time.");
        if (currentHighlightElement) {
          progressContainerRef.current.removeChild(currentHighlightElement);
        }
        setCurrentHighlightElement(null);
      } else {
        // היילייט תקין
        const highlightDuration = highlightEndTime - highlightStartTime;
        if (currentHighlightElement) {
          currentHighlightElement.style.width = `${(highlightDuration / totalDuration) * 100}%`;
          currentHighlightElement.className = 'highlight'; // הפיכת האלמנט לקבוע
        }

        // הוספת זמני התחלה וסיום למערך highlights
        const formattedStart = formatTimeMLS(highlightStartTime);
        const formattedEnd = formatTimeMLS(highlightEndTime);
        setHighlights((prevHighlights) => {
          const newHighlights = [...prevHighlights, [formattedStart, formattedEnd]];
          console.log("Highlight added:", [formattedStart, formattedEnd]); // בדיקה עצמית
          return newHighlights;
        });

        setCurrentHighlightElement(null); // Reset the current highlight
      }
    }

    setIsHighlighting(!isHighlighting); // מעבר בין מצב פעיל ללא פעיל
  };

  return (
    <div className="container">
      {!isReady && (
        <div className="welcome-screen">
          <img className="logo nameLogo nameLogo-welcome-screen" src="/logo/nameLogo.svg" alt="NameCompany" />
          <img className="logo WelcomeScreen logo-welcome-screen" src="/logo/logoWelcomeScreen.svg" alt="Logo" />
          <div className="text-welcome-screen">
            <h1>
              <img className='textWelcomeScreen' src= '/logo/textWelcomeScreen.svg' alt="TextWelcomeScreen" />
            </h1>
            <button onClick={handleReadyClick} className="readyButton">
              Press when you are ready
            </button>
          </div>
        </div>
      )}

      {isReady && (
        <>
          <div className="header">
            <img className="logo icon" src="/logo/logo.svg" alt="Logo" />
            <img className="logo nameLogo" src="/logo/nameLogo.svg" alt="NameCompany" />
            <img className="logo sloganLogo" src="/logo/sloganLogo.svg" alt="SloganCompany" />
          </div>

          <video
            id="video1"
            ref={video1Ref}
            src="/videos/Video1 Lior_noy_test2 28_06_2023 18_48_16 1.mp4"
            controls
          ></video>
          <video
            id="video2"
            ref={video2Ref}
            src="/videos/Video3 Lior_noy_test2 28_06_2023 18_48_16 3.mp4"
            muted
            controls
          ></video>

          <button onClick={handleHighlightClick} className={isHighlighting ? 'stopButton' : 'startButton'}>
            {isHighlighting ? 'End Highlight' : 'Start Highlight'}
          </button>

          <div className="progress-container" ref={progressContainerRef}>
            <div className="progress-bar" ref={progressBarRef}></div>
          </div>
        </>
      )}
    </div>
  );
}

export default VideoPlayer;
