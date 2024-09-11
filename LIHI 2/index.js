const video1 = document.getElementById('video1');
const video2 = document.getElementById('video2');
const progressBar = document.getElementById('progressBar');
const highlightButton = document.getElementById('highlightButton');
const progressContainer = document.getElementById('progressContainer');
const elapsedTimeDisplay = document.getElementById('elapsedTime');
const remainingTimeDisplay = document.getElementById('remainingTime');

let totalDuration = 0;
let highlightStartTime = null;
let highlightEndTime = null;
let currentHighlightElement = null;
let highlights = [];
let isHighlighting = false;

// Set the total duration based on one of the videos (since they are the same)
video1.addEventListener('loadedmetadata', () => {
    totalDuration = video1.duration;
});

// Format time in MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format time to minutes:seconds:milliseconds
function formatTimeMLS(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
}

// Update the progress bar and timers as the video plays
function updateProgressBar() {
    const currentTime = video1.currentTime;
    const progressPercentage = (currentTime / totalDuration) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    // Update timers
    elapsedTimeDisplay.textContent = formatTime(currentTime);
    remainingTimeDisplay.textContent = `-${formatTime(totalDuration - currentTime)}`;

    // If highlighting is active, update the width of the green highlight dynamically
    if (isHighlighting && currentHighlightElement) {
        const highlightDuration = currentTime - highlightStartTime;
        currentHighlightElement.style.width = `${(highlightDuration / totalDuration) * 100}%`;
    }
}

video1.addEventListener('timeupdate', updateProgressBar);
video2.addEventListener('timeupdate', updateProgressBar); // Keeps the same logic for video2

// Autoplay videos on load
window.onload = function() {
    video1.play();
    video2.play();
};

// Handle highlight button click (toggles between start and end)
highlightButton.addEventListener('click', () => {
    const currentTime = video1.currentTime; // Same time for both videos

    if (!isHighlighting) {
        // Start highlight
        highlightStartTime = currentTime;
        highlightButton.textContent = 'Highlight End';
        highlightButton.classList.remove('startButton');
        highlightButton.classList.add('stopButton');

        // Create and append the highlight element
        currentHighlightElement = document.createElement('div');
        currentHighlightElement.className = 'highlight';
        currentHighlightElement.style.left = `${(highlightStartTime / totalDuration) * 100}%`;
        progressContainer.appendChild(currentHighlightElement);

        console.log('Highlight Start:', formatTimeMLS(highlightStartTime));
    } else {
        // End highlight
        highlightEndTime = currentTime;

        if (highlightStartTime !== null && highlightEndTime > highlightStartTime) {
            const highlightDuration = highlightEndTime - highlightStartTime;
            highlights.push([highlightStartTime, highlightEndTime]);

            // Finalize the highlight's width
            currentHighlightElement.style.width = `${(highlightDuration / totalDuration) * 100}%`;

            console.log('Highlight End:', formatTimeMLS(highlightEndTime));
            console.log('Highlights:', highlights);
        } else {
            console.log('Invalid highlight end time.');
        }

        // Reset the button back to "Start"
        highlightButton.textContent = 'Highlight Start';
        highlightButton.classList.remove('stopButton');
        highlightButton.classList.add('startButton');

        // Clear the reference to the current highlight
        currentHighlightElement = null;
    }

    isHighlighting = !isHighlighting; // Toggle the state
});
