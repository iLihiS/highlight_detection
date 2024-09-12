import React, { useRef, useState, useEffect } from 'react';
import '../index.css'; // Import the correct CSS path

function VideoPlayer() {
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const progressBarRef = useRef(null);
  const progressContainerRef = useRef(null);
  const elapsedTimeRef = useRef(null);
  const remainingTimeRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [highlightStartTime, setHighlightStartTime] = useState(null);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [currentHighlightElement, setCurrentHighlightElement] = useState(null);
  const [highlights, setHighlights] = useState([]); // מערך להיילייטים
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [textNotes, setTextNotes] = useState([]); // מערך לשמירת הטקסט עם הזמן
  const [inputValue, setInputValue] = useState(""); // הערך של תיבת הטקסט

  // פונקציה להמרת זמן לפורמט mm:ss:mls
  const formatTimeMLS = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
  };

  // פונקציה להמרת זמן לפורמט mm:ss (ללא מילישניות)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isReady) return;

    const video1 = video1Ref.current;
    const video2 = video2Ref.current;

    if (video1 && video2) {
      if (video1.paused && !video1.ended) {
        video1.play().catch((error) => console.log(error));
      }
      if (video2.paused && !video2.ended) {
        video2.play().catch((error) => console.log(error));
      }

      video1.addEventListener('pause', () => {
        if (!video2.paused && !video2.ended) {
          video2.pause();
        }
      });

      video2.addEventListener('pause', () => {
        if (!video1.paused && !video1.ended) {
          video1.pause();
        }
      });

      video1.addEventListener('play', () => {
        if (video2.paused && !video2.ended) {
          video2.play().catch((error) => console.log(error));

        }
      });

      video2.addEventListener('play', () => {
        if (video1.paused && !video1.ended) {
          video1.play().catch((error) => console.log(error));

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

        // עדכון השעונים (זמן שחלף וזמן שנותר)
        elapsedTimeRef.current.textContent = formatTime(currentTime);
        remainingTimeRef.current.textContent = `-${formatTime(totalDuration - currentTime)}`;

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

  // טיפול בלחיצה על רווח (התחלת היילייט) ושחרור רווח (סיום היילייט)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space' && !isSpacePressed) {
        setIsSpacePressed(true);
        if (!isHighlighting) {
          handleHighlightClick(true); // התחלת היילייט עם רווח
        }
      }
    };

    const handleKeyUp = (event) => {
      if (event.code === 'Space' && isSpacePressed) {
        setIsSpacePressed(false);
        if (isHighlighting) {
          handleHighlightClick(false); // סיום היילייט עם רווח
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed, isHighlighting]); // מתעדכן לפי מצב הלחיצה

  // טיפול בהזנת הטקסט ושמירתו עם הזמן הנוכחי
  const handleTextInput = (e) => {
    if (e.key === 'Enter') {
      const video1 = video1Ref.current;
      const currentTime = formatTimeMLS(video1.currentTime); // הזמן הנוכחי בפורמט mm:ss:mls

      // הוספת הטקסט והזמן למערך
      setTextNotes((prevNotes) => [...prevNotes, { time: currentTime, note: inputValue }]);
      console.log("Text note added:", { time: currentTime, note: inputValue });
      console.log("All text notes:", textNotes); // בדיקה עצמית

      // ניקוי תיבת הטקסט לאחר ההזנה
      setInputValue("");
    }
  };

  // הפונקציה שתופעל כאשר לוחצים על הכפתור בדיב החדש
  const handleReadyClick = () => {
    setIsReady(true); // מסתיר את הדיב ומציג את שאר האלמנטים
  };

  const handleHighlightClick = (isStarting) => {
    const video1 = video1Ref.current;
    const currentTime = video1.currentTime;

    if (!isReady || video1.paused || currentTime === 0) {
      video1.play(); // במידה והסרטון לא מתנגן, נתחיל את הסרטון
      return; // לא מבצעים היילייט עד שהסרטון מתחיל לשחק
    }

    if (isStarting) {
      // Start highlight: יצירת אלמנט חדש להיילייט והתחלת זמן מהנקודה הנוכחית
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

    setIsHighlighting(isStarting); // מעבר בין מצב פעיל ללא פעיל
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

          <p>You can use the button below or space-button to highlight</p>

          <button onClick={() => handleHighlightClick(!isHighlighting)} className={isHighlighting ? 'stopButton' : 'startButton'}>
            {isHighlighting ? 'End Highlight' : 'Start Highlight'}
          </button>

          {/* תיבת הטקסט לקליטת טקסט מהמשתמש */}
          <input
            className='text-input'
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleTextInput}
            placeholder="Enter your note and press Enter"
          />

          <div className="progress-container" ref={progressContainerRef}>
            <div className="progress-bar" ref={progressBarRef}></div>
            {/* הצגת השעונים */}
            <div className="timer elapsed-time" ref={elapsedTimeRef}>00:00</div>
            <div className="timer remaining-time" ref={remainingTimeRef}>-00:00</div>
          </div>
        </>
      )}
    </div>
  );
}

export default VideoPlayer;
