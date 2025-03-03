let flashcards = [];
let score = 0;
let question = 0;
let totalQuestions = 0;
let numberOfQuestions = 0;
let answeredQuestions = 0;
let optionsLength = 0;
let questionsSeened = 0;

const scoreElement = document.querySelector("div.score");
const progressElement = document.querySelector("div.progress-bar");
const answerButton = document.querySelector(".answer-button");

let randomIndex = 0;

let correctAnswers = "";
let secondRun = false;

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// animate
function animate() {    
    console.log('start animation');
    document.querySelector('#splash').addEventListener('transitionend', (event) => {
        // document.querySelector('#splash').classList.remove('animate');
    });
    requestAnimationFrame(() => {
        document.querySelector('#splash').classList.add('animate');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded');
    //window.performance.navigation.type
    console.log('window.performance.navigation.type: ', window.performance.navigation.type)
    console.log('window.PerformanceNavigationTiming.type: ', window.PerformanceNavigationTiming.type)
    if (window.performance.navigation.type == 0) {        
        animate();
    }
});


// When the user clicks on the button, open the modal
btn.onclick = function () {
    modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};


function startApp() {
    fetch("./questionBank/cp_326_.tsv")
        .then((response) => response.text())
        .then((tsvData) => {
            // console.log("tsvData:", tsvData);

            const lines = tsvData.split("\n");

            for (let i = 0; i < lines.length; i++) {
                const values = lines[i].split("\t"); // Split values using the tab delimiter
                const question = values[0];
                var options = [];
                var correctAnswers = "";
                if (values.length == 6) {
                    options = values.slice(1, 5);
                    correctAnswers = values
                        .slice(5)
                        .filter((answer) => answer !== "");
                } else if (values.length == 7) {
                    options = values.slice(1, 6);
                    correctAnswers = values
                        .slice(6)
                        .filter((answer) => answer !== "");
                } else if (values.length == 5) {
                    options = values.slice(1, 4);
                    correctAnswers = values
                        .slice(4)
                        .filter((answer) => answer !== "");
                }
                // Filter out any empty values
                flashcards.push({ question, options, correctAnswers });
            }

            // console.log("flashcards"); // Log the flashcards array to the console
            // console.table(flashcards); // Log the flashcards array to the console as a table

            score = 0;

            chooseNumberOfQuestions();
            cutFlashcards(numberOfQuestions);
            totalQuestions = flashcards.length;
            // Proceed with the rest of your JavaScript code here
            updateQuestion(flashcards);
            updateScoreDisplay();
            updateProgressDisplay();
            if (secondRun) {
                startTimer(60 * 60, document.querySelector("h4#time"));
            }
        });
}

// Write a function to cut flashcards down to 50 questions
function cutFlashcards(numberOfQuestions) {
    let currentIndex = flashcards.length,
        randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [flashcards[currentIndex], flashcards[randomIndex]] = [
            flashcards[randomIndex],
            flashcards[currentIndex],
        ];
    }

    flashcards = flashcards.splice(0, numberOfQuestions);
    console.log("flashcards after cut: ", flashcards.length);
    // toastr.success("flashcards after cut: ", flashcards.length);
    questionsSeened = 0;
    question = 0;
}

// Write a function to update the question and options elemnts in index.html using flashcards variable
function updateQuestion(flashcards) {
    console.log("updateQuestion");
    const questionElement = document.querySelector(".question");
    const optionsElement = document.querySelectorAll("label.answer");

    // get a random question from flashcards
    randomIndex = Math.floor(Math.random() * flashcards.length);
    const randomItem = flashcards[randomIndex];

    console.log("randomItem: ", randomItem);

    // update question element
    questionElement.innerHTML = randomItem.question;

    optionsLength = randomItem.options.length;

    // update options element
    optionsElement.forEach((option, index) => {
        option.textContent = randomItem.options[index];
        if (option.textContent === "") {
            option.parentElement.classList.add("hidden");
        } else {
            option.parentElement.classList.remove("hidden");
        }
    });

    correctAnswers = randomItem.correctAnswers;
    questionsSeened++;    
    question++;
    updateScoreDisplay();
}

// Write a function to check if the selected option is correct or not based on the index.html elements
function checkAnswer() {      
    answeredQuestions++;
    if (!checkTickedBoxes(optionsLength)) {
        updateStatusDisplay(`You have to tick ${optionsLength - 3} answers!`);
        return;
    } else {
        updateStatusDisplay("");
    }
    console.log("checkAnswer");
    const optionsElement = document.querySelectorAll('input[type="checkbox"]');
    const optionsLabelElement = document.querySelectorAll("label.answer");
    const selectedOption = document.querySelector(
        'input[type="checkbox"]:checked'
    );
    const optionsArray = Array.from(optionsElement);
    const optionsLabelArray = Array.from(optionsLabelElement);
    const selectedIndex = optionsArray.indexOf(selectedOption);
    const selectedAnswer = optionsArray[selectedIndex].id;
    const questionElement = document.querySelector(".question");
    const question = questionElement.textContent;

    // get selected answers id into a variable when two checkboxes are ticked
    const selectedAnswers = optionsArray
        .filter((option) => option.checked === true)
        .map((option) => option.id)
        .toString()
        .replace(",", "");

    console.log("selectedAnswers: ", selectedAnswers);
    console.log("correctAnswers[0]: ", correctAnswers[0]);

    // check if selectedAnswers is in correctAnswers
    const isCorrect = correctAnswers[0].includes(selectedAnswers);

    // if answer is correct update that checkbox as green otherwise update it as red and update corret answer as green
    optionsArray.forEach((option, index) => {
        if (correctAnswers[0].includes(option.id)) {
            option.parentElement.classList.add("correct-answer");
        } else {
            option.parentElement.classList.add("incorrect-answer");
        }
    });

    // add a status message to .post-answer-message element to inform user if answer is correct or not
    const postAnswerMessageElement = document.querySelector(
        ".post-answer-message"
    );
    if (isCorrect) {
        postAnswerMessageElement.textContent = "Correct!";
        score++;
    } else {
        postAnswerMessageElement.textContent = "Incorrect!";
    }
    //disable answer button
    answerButton.disabled = true;
    updateScoreDisplay();
}

// Write a function to reset the selected option
function resetAnswer() {
    console.log("resetAnswer");
    const optionsElement = document.querySelectorAll('input[type="checkbox"]');
    optionsElement.forEach((option) => {
        option.checked = false;
        option.parentElement.classList.remove("correct-answer");
        option.parentElement.classList.remove("incorrect-answer");
    });
    const postAnswerMessageElement = document.querySelector(
        ".post-answer-message"
    );
    postAnswerMessageElement.textContent = "";
}

function btnNextQuestion() {
    removeQuestion();
    resetAnswer();
    updateQuestion(flashcards);
    updateProgressDisplay();
    // enableAnswerButton();
    answerButton.disabled = false;
}

function checkTickedBoxes(optionsLength) {
    console.log("checkTickedBoxes optionsLength: ", optionsLength);
    // check how many checkboxes are ticked
    const optionsElement = document.querySelectorAll('input[type="checkbox"]');
    const optionsArray = Array.from(optionsElement);
    const tickedOptions = optionsArray.filter(
        (option) => option.checked === true
    );
    console.log("tickedOptions: ", tickedOptions);
    console.log("tickedOptions length: ", tickedOptions.length);
    console.log("optionsLength: ", optionsLength);
    // if there are more than 2 checkboxes ticked, untick the last one
    if (tickedOptions.length > 2) {
        tickedOptions[tickedOptions.length - 1].checked = false;
    }
    if (optionsLength === 3) {
        return optionsLength - 2 === tickedOptions.length;
    }
    return optionsLength - 3 === tickedOptions.length;
}

function updateScoreDisplay() {
    // update div.score with total score
    scoreElement.innerHTML = `Score: ${score}/${answeredQuestions} |&nbsp;${Math.ceil(score/totalQuestions * 1000)}/1000 <br />Question: ${question}/${totalQuestions}`;
}

function updateProgressDisplay() {
    progressElement.setAttribute(
        "style",
        `width: ${(question / totalQuestions) * 100}%`
    );
}

function enableAnswerButton() {
    answerButton.disabled = false;
}

function removeQuestion() {
    //remove that question from flashcards
    flashcards.splice(randomIndex, 1);
    console.log("questions left: ", flashcards.length);
    // console.table(flashcards);
}

function btnRestart() {
    location.reload();
}

function btnRefresh() {
    //clear service worker cache
    registerServiceWorker();
    location.reload(true);
    // location.href = location.href;
}

function unregisterServiceWorker() {

    self.addEventListener('install', function (e) {
        toastr.info('reaced install');
        self.skipWaiting();
    });

    self.addEventListener('activate', function (e) {
        toastr.info("reached activate");
        console.log(`Unregistering service worker`)
        self.registration.unregister()
            .then(function () {
                return self.clients.matchAll();
            })
            .then(function (clients) {
                clients.forEach(client => {
                    console.log(`Navigating ${client.url}`)
                    client.navigate(client.url)
                })
            });
    })
}

// when app starts start a countdown timer of 60 minutes on h4.time element
// when timer reaches 0, disable all the options and show a message to user that time is up
function startTimer(duration, display) {
    var timer = duration,
        minutes,
        seconds;
    var intervalId = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = "Time left: " + minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(intervalId);
            disableOptions();
            display.textContent = "Time is up!";
        }
    }, 1000);
}

// Add a hotkey to submit the answer when user presses a key
document.addEventListener("keyup", function (event) {
    if (event.key === "a" || event.key === "A") {
        if (answerButton.disabled == false) {
            checkAnswer();
        }
    }
});

// Add a hotkey to move to next question when user presses a key
document.addEventListener("keyup", function (event) {
    if (event.key === "s" || event.key === "S") {
        btnNextQuestion();
    }
});

// create a function for a div to click to check answer for checkbox in its child via id
function answer(id) {
    document.getElementById(id).click();
}

// pop up a dialog when it first loaded to let users choose a number of questions
function chooseNumberOfQuestions() {
    answeredQuestions = 0;
    if (secondRun) {
        return;
    }
    // numberOfQuestions = prompt("Please enter number of questions", "50");
    btn.click();

    // Get the selected option count when the confirm button is clicked
    document
        .getElementById("confirmBtn")
        .addEventListener("click", function () {
            const selectedOptionCount = document.querySelector(
                'input[name="optionCount"]:checked'
            ).value;
            console.log("Selected Option Count:", selectedOptionCount);
            // Proceed with your logic here
            numberOfQuestions = selectedOptionCount;
            span.click();
            secondRun = true;
            startApp();
        });

    if (numberOfQuestions == null || numberOfQuestions == "") {
        numberOfQuestions = 50;
    }
    return numberOfQuestions;
}

function updateStatusDisplay(msg) {
    const statusElement = document.querySelector(".status");
    statusElement.innerHTML = msg;
}

// create a function to add event listener to radio.optionCount upon click
function addEventListenerToRadio() {
    const radioElement = document.querySelectorAll('input[name="optionCount"]');
    radioElement.forEach((radio) => {
        radio.addEventListener("click", function () {
            console.log("radio clicked");

            // click button with id confirmBtn
            document.querySelector("#confirmBtn").click();
        });
    });
}

tippy("#btnAnswer", {
    content: 'Keyboard shortcut: "A"',
});

tippy("#btnNextQuestion", {
    content: 'Keyboard shortcut: "S"',
});

addEventListenerToRadio();


startApp();


// document.addEventListener('DOMContentLoaded', () => {
//     console.log('DOMContentLoaded');
//     animate();
// });

// document.addEventListener('readystatechange', () => {
//     console.log('readystatechange');
//     animate();
// });



// register service worker for PWA to the browser if its supported
//dont register service worker if service worker is already registered

if ("serviceWorker" in navigator) {
    if (navigator.serviceWorker.controller) {
        console.log("Service Worker is already registered");
        // toastr.info("Service Worker is already registered");
    } else {
        window.addEventListener("load", function () {
            registerServiceWorker();
        });
    }
}

function registerServiceWorker() {
    navigator.serviceWorker
        .register("/serviceWorker.js")
        .then((res) => {
            console.log("service worker registered");
            toastr.success("service worker registered");
        })
        .catch((err) => console.log("service worker not registered", err));
}

