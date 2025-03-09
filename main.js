document.addEventListener('DOMContentLoaded', () => {
    // Retrieve configuration from localStorage
    const config = JSON.parse(localStorage.getItem('exerTypingConfig')) || {};
    
    // Set test parameters from configuration
    const userName = config.username || "User";
    const testType = config.testType || "words";
    const testDurationMinutes = parseInt(config.testDuration) || 1;
    const testDuration = testDurationMinutes === 0 ? 0 : testDurationMinutes * 60; // in seconds
    const testDifficulty = config.testDifficulty || "easy";
    
    // Display the configuration info
    document.getElementById('display-name').textContent = userName;
    document.getElementById('display-type').textContent = testType;
    document.getElementById('display-difficulty').textContent = testDifficulty;
    document.getElementById('display-duration').textContent = testDurationMinutes === 0 ? "Unlimited" : testDurationMinutes + " min";
    document.getElementById('welcome-user').textContent = `Welcome, ${userName}! Start typing below:`;
    
    // DOM Elements for the test
    const typingSection = document.getElementById('typing-section');
    const resultsSection = document.getElementById('results-section');
    
    const typingDisplay = document.getElementById('typing-display');
    const hiddenInput = document.getElementById('hidden-input');
    const timerDisplay = document.getElementById('timer');
    
    const resultUsername = document.getElementById('result-username');
    const resultDuration = document.getElementById('result-duration');
    const resultDifficulty = document.getElementById('result-difficulty');
    const resultWPM = document.getElementById('result-wpm');
    const resultAccuracy = document.getElementById('result-accuracy');
    const restartBtn = document.getElementById('restart-btn');
    
    // Test state variables
    let wordsList = [];
    let currentWordIndex = 0;
    let currentCharIndex = 0;
    let errorCount = 0;
    let totalKeystrokes = 0;
    let correctKeystrokes = 0;
    let testStarted = false;
    let timerInterval = null;
    let timeLeft = testDuration;
    let startTime = 0;
    
    // Default text arrays (could be customized per difficulty)
    const defaultWords = [
      "Apple", "Banana", "Computer", "Keyboard", "Science", "Elephant", "Journey", "Basketball", "Elephant", "Amazing", "Courage", "Favorite", "Beautiful", "Chocolate", "Window", "Sunrise", "Ocean", "Adventure", "Happiness", "Friend", "Teacher", "Sunshine", "Rainbow", "Mountain", "Forest", "Cloud", "Garden", "Energy", "Magic", "Winter", "Summer", "Autumn", "Spring", "Mirror", "Quiet", "Music", "Angel", "Colorful", "Explore", "Freedom", "Exciting", "Elephant", "Starfish", "Universe", "Discover", "Travel", "Coffee", "Universe", "Optimistic", "Wonderful", "Celebration", "Mountainous", "Discovery", "Adventure", "Kingdom", "Lightning", "Giraffe", "Surprise", "Elephant", "Telescope", "Technology", "Independence", "Creativity", "Reflection", "Imaginary", "Heartbeat", "Cloudy", "Magical", "Victory", "Whisper", "Lantern", "Chocolate", "Butterfly", "Vibrant", "Journey", "Telescope", "Energy", "Beautiful", "Courageous", "Galaxy", "Tranquil", "Reflection", "Dreaming", "Concept", "Alphabet", "Picture", "Diary", "Calendar", "Achievement", "Generation", "Stranger", "Illusion", "Mystery", "Timekeeper", "Lioness", "Stargazing", "Milestone", "Obstacle", "Theater", "Perception"
    ];
    
    const defaultParagraphs = [
      "Typing is an essential skill in today's digital world, whether for work, communication, or leisure. Improving your typing speed and accuracy requires consistent practice and proper techniques. Start by focusing on proper finger placement, using all ten fingers, and avoiding looking at the keyboard. Over time, your muscle memory will develop, and typing will feel more natural and efficient. Remember, the goal is not just speed, but also accuracy, as a faster typing rate with numerous errors is counterproductive.",
      "The quick brown fox jumps over the lazy dog. Practice typing to improve your speed and accuracy.",
      "As in most cases of great and valuable inventions in science and art, the English lay claim to the honor of having first discovered photogenic drawing. But we shall see in the progress of our discussion here, like many other assumptions of their authors, that claim is unfounded, and they are due no more credit than for the invention of the steamboat or the cotton gin.",
      "A piece of paper, or other convenient material, was placed upon a frame and sponged over with a solution of nitrate of silver; it was then placed behind a painting on glass and the light traversing the painting produced a kind of copy upon the prepared pape."
    ];


    // Helper: Format seconds into mm:ss
    function formatTime(seconds) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' + s : s}`;
    }
    
    function renderText() {
      // Clear previous content.
      typingDisplay.innerHTML = "";
    
      // Determine word count based on difficulty.
      let wordCount;
      if (testDifficulty === "easy") {
        wordCount = 50;
      } else if (testDifficulty === "medium") {
        wordCount = 120;
      } else if (testDifficulty === "hard") {
        wordCount = 350;
      } else {
        wordCount = 50; // Default
      }
    
      wordsList = [];
      let totalWords = 0;
    
      if (testType === "words") {
        // Generate a list of random words wrapped in quotes
        for (let i = 0; i < wordCount; i++) {
          const randomIndex = Math.floor(Math.random() * defaultWords.length);
          let word = `"${defaultWords[randomIndex]}"`;
          wordsList.push(word);
        }
      } else {
        // For paragraphs, select full paragraphs while respecting the word count.
        for (const paragraph of defaultParagraphs) {
          const paragraphWords = paragraph.split(" ");
          if (totalWords + paragraphWords.length <= wordCount) {
            wordsList.push(...paragraphWords);
            totalWords += paragraphWords.length;
          } else {
            wordsList.push(...paragraphWords.slice(0, wordCount - totalWords));
            break;
          }
        }
      }
    
      // Render words as spans.
      wordsList.forEach((word, index) => {
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word');
    
        for (const char of word) {
          const charSpan = document.createElement('span');
          charSpan.textContent = char;
          wordSpan.appendChild(charSpan);
        }
    
        typingDisplay.appendChild(wordSpan);
        
        // Add space between words
        if (index !== wordsList.length - 1) {
          typingDisplay.appendChild(document.createTextNode(" "));
        }
      });
    
      highlightCurrentWord();
    }
    

    
    // Highlight the word that is currently active
    function highlightCurrentWord() {
      const wordSpans = typingDisplay.querySelectorAll('.word');
      wordSpans.forEach((span, index) => {
        if(index === currentWordIndex) {
          span.classList.add('current-word');
        } else {
          span.classList.remove('current-word');
        }
      });
    }

    
    // Restart button functionality
    document.addEventListener("DOMContentLoaded", function() {
        let restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', function() {
                location.reload(); // Reloads the page to restart the test
            });
        } else {
            console.error("Restart button not found!");
        }
    });
    
    // Start the countdown timer
    function startTimer() {
      startTime = Date.now();
      if(testDuration > 0) {
        timerInterval = setInterval(() => {
          timeLeft--;
          timerDisplay.textContent = `Time: ${formatTime(timeLeft)}`;
          if(timeLeft <= 0) {
            endTest();
          }
        }, 1000);
      } else {
        timerDisplay.textContent = `Time: Unlimited`;
        startTime = Date.now();
      }
    }
    
    // End the test and calculate results
    function endTest() {
      clearInterval(timerInterval);
      testStarted = false;
      const elapsedTime = testDuration > 0 
        ? (testDuration - timeLeft) 
        : ((Date.now() - startTime) / 1000);
      const minutes = elapsedTime / 60;
      let wpm = 0;
      if(minutes > 0) {
        wpm = Math.round(currentWordIndex / minutes);
      }
      let accuracy = totalKeystrokes > 0 
        ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
        : 0;
      
      resultUsername.textContent = `Name: ${userName}`;
      resultDuration.textContent = `Duration: ${testDuration === 0 ? "Unlimited" : (testDuration/60) + " minute(s)"}`;
      resultDifficulty.textContent = `Difficulty: ${testDifficulty}`;
      resultWPM.textContent = `Speed: ${wpm} WPM`;
      resultAccuracy.textContent = `Accuracy: ${accuracy}%`;
      
      // Optionally, store the report
      const report = {
        name: userName,
        duration: testDuration === 0 ? "Unlimited" : (testDuration/60) + " minute(s)",
        difficulty: testDifficulty,
        wpm: wpm,
        accuracy: accuracy,
        timestamp: new Date().toLocaleString()
      };
      localStorage.setItem("exerTypingReport", JSON.stringify(report));
      
      // Show results and hide typing test
      typingSection.classList.remove('active');
      resultsSection.classList.add('active');
    }
    
    // Ensure hidden input stays focused
    typingDisplay.addEventListener('click', () => {
      hiddenInput.focus();
    });
    document.addEventListener('keydown', () => {
      if(typingSection.classList.contains('active') && document.activeElement !== hiddenInput) {
        hiddenInput.focus();
      }
    });
    
    // Handle keystrokes for typing test
    hiddenInput.addEventListener('keydown', (e) => {
      if(!testStarted) {
        testStarted = true;
        startTimer();
      }
      
      const currentWord = wordsList[currentWordIndex];
      const wordSpan = typingDisplay.querySelectorAll('.word')[currentWordIndex];
      if(!wordSpan) return;
      
      if(currentCharIndex === currentWord.length && e.key !== " ") {
        e.preventDefault();
        return;
      }
      
      if(e.key === "Backspace") {
        if(currentCharIndex > 0) {
          currentCharIndex--;
          totalKeystrokes++;
          const charSpan = wordSpan.children[currentCharIndex];
          charSpan.classList.remove('correct', 'incorrect');
        }
        e.preventDefault();
        return;
      }
      
      if(e.key.length !== 1) return;
      
      totalKeystrokes++;
      
      if(currentCharIndex < currentWord.length) {
        const charSpan = wordSpan.children[currentCharIndex];
        const expectedChar = currentWord[currentCharIndex];
        if(e.key === expectedChar) {
          charSpan.classList.add('correct');
          correctKeystrokes++;
        } else {
          charSpan.classList.add('incorrect');
          errorCount++;
        }
        currentCharIndex++;
      }
      
      if(e.key === " ") {
        e.preventDefault();
        if(currentCharIndex < currentWord.length) {
          for(let i = currentCharIndex; i < currentWord.length; i++){
            const span = wordSpan.children[i];
            span.classList.add('incorrect');
            errorCount++;
            totalKeystrokes++;
          }
        }
        currentWordIndex++;
        currentCharIndex = 0;
        highlightCurrentWord();
        hiddenInput.value = "";
      }
    });
    
    // Restart test: clear config and redirect back to index.html
    restartBtn.addEventListener('click', () => {
      localStorage.removeItem('exerTypingConfig');
      window.location.href = 'index.html';
    });
    
    // Initialize test display
    renderText();
  });
  