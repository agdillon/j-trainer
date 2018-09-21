let cats = []

// click handler when you pick a category to send you to the questions screen
function selectCategory(event) {
  event.preventDefault()
  let idNumberString = this.id.slice(3)
  let catNoOnBoard = parseInt(idNumberString, 10) - 1
  makeQuestionsScreen(catNoOnBoard, cats[catNoOnBoard])
}

// this function makes the statistics screen, also used to switch users
function logInUser(event) {
  event.preventDefault()

  let users = JSON.parse(localStorage.getItem("users")) || {} // should be an object
  let name = document.getElementById("username-blank").value // should probably validate it isn't blank, at least... meh

  // if new user, set up a blank object for them and put in localStorage
  if (!users[name]) {
    users[name] = {
      right: 0,
      wrong: 0
    }
    localStorage.setItem("users", JSON.stringify(users))
  }
  localStorage.setItem("loggedInUser", name)
  let usernameNav = document.getElementById("username")
  usernameNav.textContent = localStorage.getItem("loggedInUser") || "Not logged in"
  displayStats(name)
}

function getUsername() {
  // make a form with 2 elements, a regular text input and a submit button
  let userForm = document.createElement("form")
  userForm.id = "user-form"
  let userFormRow = document.createElement("div")
  userFormRow.className = "form-group row"
  let userFormCol = document.createElement("div")
  userFormCol.className = "col-md-3 offset-md-3"
  let usernameBlank = document.createElement("input")
  usernameBlank.className = "form-control my-2"
  usernameBlank.id = "username-blank"
  usernameBlank.setAttribute("placeholder", "Your name")
  let submitUname = document.createElement("button")
  submitUname.className = "btn btn-light"
  submitUname.setAttribute("type", "submit")
  submitUname.textContent = "Log in or create an account"
  userFormCol.appendChild(usernameBlank)
  userFormCol.appendChild(submitUname)
  userFormRow.appendChild(userFormCol)
  userForm.appendChild(userFormRow)

  while (display.lastChild) {
    display.removeChild(display.lastChild)
  }

  display.appendChild(userForm)

  submitUname.addEventListener("click", logInUser)
}

function displayStats(name) {
  // get data for chosen user from localStorage
  let userData = JSON.parse(localStorage.getItem("users"))[name]

  let percentRight = Math.round((userData.right / (userData.right + userData.wrong)) * 100) || 0
  let percentWrong = Math.round((userData.wrong / (userData.right + userData.wrong)) * 100) || 0

  while (display.lastChild) {
    display.removeChild(display.lastChild)
  }

  let statsRow = document.createElement("div")
  statsRow.className = "row"
  let statsCol = document.createElement("div")
  statsCol.className = "col-md-6 offset-md-2"
  let stats = document.createElement("ul")
  stats.className = "list-group my-2"
  for (let i = 1; i <= 4; i++) { // 4 is the number of stats I'm currently displaying
    let li = document.createElement("li")
    li.className = "list-group-item"
    li.id = `stat${i}`
    stats.appendChild(li)
  }
  statsCol.appendChild(stats)

  // also add button to change user, then ask for name on click
  let changeUserButton = document.createElement("button")
  changeUserButton.textContent = "Log in as a different user"
  let gameButton = document.createElement("button")
  gameButton.className = "ml-3"
  gameButton.textContent = "Back to game"
  statsCol.appendChild(changeUserButton)
  statsCol.appendChild(gameButton)

  statsRow.appendChild(statsCol)
  display.appendChild(statsRow)

  document.getElementById("stat1").textContent = `Total questions correct: ${userData.right}`
  document.getElementById("stat2").textContent = `Total questions wrong: ${userData.wrong}`
  document.getElementById("stat3").textContent = `Percent correct: ${percentRight}%`
  document.getElementById("stat4").textContent = `Percent wrong: ${percentWrong}%`

  changeUserButton.addEventListener("click", getUsername)
  gameButton.addEventListener("click", reloadCategoriesScreen)
}

function makeStatsScreen() {
  // hide or delete other screens' content (you could be starting from anywhere)
  // hide all previous screen elements

  // should really remove all event listeners and then remove elements
  // or remove event listeners and then hide all elements
  while (display.lastChild) {
    display.removeChild(display.lastChild)
  }

  // if no one is logged in, ask for name
  if (!localStorage.getItem("loggedInUser")) {
    getUsername()
  }
  // show stats for current user
  else {
    displayStats(localStorage.getItem("loggedInUser"))
  }
}

// this function sets up the empty categories board (one time)
function makeCategoriesScreen() {
  while (display.lastChild) {
    display.removeChild(display.lastChild)
  }

  let rows = []
  for (let j = 1; j <= 2; j++) { // 2 rows
    rows[j] = document.createElement("div")
    rows[j].className = "row my-2"

    for (let i = 1; i <= 3; i++) { // 3 items in each row
      let catTV = document.createElement("div")
      catTV.className = "col-md-3 col-sm-12 mx-1 d-flex align-items-center justify-content-center tv category-card"
      catTV.addEventListener("click", selectCategory)

      if (j === 1) {
        catTV.id = `cat${i}`
      }
      else {
        catTV.id = `cat${i + 3}`
      }

      catTV.appendChild(document.createElement("h1"))
      rows[j].appendChild(catTV)
    }
    display.appendChild(rows[j])
  }

  // add a button at the bottom to refresh categories
  let refreshRow = document.createElement("div")
  refreshRow.className = "row"
  let refreshCol = document.createElement("div")
  refreshCol.className = "col-md-9 text-center"
  let refreshButton = document.createElement("button")
  refreshButton.className = "btn btn-light"
  refreshButton.textContent = "Get new categories"
  // add event listener to get new categories
  refreshButton.addEventListener("click", populateCategories)
  refreshCol.appendChild(refreshButton)
  refreshRow.appendChild(refreshCol)
  display.appendChild(refreshRow)
}

// this function puts the question into its questionTV div
// as well as the header with the category and dollar value
function getQuestion(questionNumber, questionsArr, category) {
  let infoHeader = document.getElementById("info-header")
  let questionTVText = document.getElementById("question-TV-text")

  let qValue = questionsArr[questionNumber].value
  let question = questionsArr[questionNumber].question.toUpperCase()

  infoHeader.textContent = `${category.title} — $${qValue} — ${questionNumber + 1} of 5`
  questionTVText.textContent = question

  // clear answer blank and alert
  let answer = document.getElementById("answer")
  answer.value = ""
  let feedback = document.getElementById("feedback")
  if (feedback) {
    feedback.parentElement.removeChild(feedback)
  }

  // unhide answer form
  let answerForm = document.getElementById("answerForm")
  if (answerForm.hidden) { answerForm.hidden = false }
}

// this function makes the board setup for the questions
// and gets the question data via AJAX, then displays first q
function makeQuestionsScreen(catNoOnBoard, category) {
  // hide all previous screen elements
  for (let i = 0; i < display.children.length; i++) {
    display.children[i].hidden = true
  }

  // get questions for selected category id
  axios.get(`http://jservice.io/api/category?id=${category.id}`)
    .then((qresponse) => {
      let questionsArr = qresponse.data.clues

      // make a space for the category name and dollar value info
      let infoRow = document.createElement("div")
      infoRow.className = "row"
      infoRow.id = "info-row"
      let infoCol = document.createElement("div")
      infoCol.className = "col-md-8 offset-md-1 text-light text-center"
      let infoHeader = document.createElement("h2")
      infoHeader.id = "info-header"
      infoCol.appendChild(infoHeader)
      infoRow.appendChild(infoCol)
      display.appendChild(infoRow)

      // make question TV
      let questionTV = document.createElement("div")
      questionTV.className = "col-md-4 offset-md-3 tv question-card"
      let questionTVText = document.createElement("h1")
      questionTVText.id = "question-TV-text"
      questionTV.appendChild(questionTVText)
      let qRow = document.createElement("div")
      qRow.className = "row"
      qRow.id = "qrow"
      qRow.appendChild(questionTV)
      display.appendChild(qRow)

      // make a "next question" button
      let bottomRow = document.createElement("div")
      bottomRow.className = "row"
      let bottomCol = document.createElement("div")
      bottomCol.className = "col-md-4 offset-md-3 text-center pt-2"
      bottomCol.id = "bottom-col"
      let nextQButton = document.createElement("button")
      nextQButton.setAttribute("type", "button")
      nextQButton.className = "btn btn-light"
      nextQButton.id = "next-q-button"
      nextQButton.textContent = "Next question"
      bottomCol.appendChild(nextQButton)
      bottomRow.appendChild(bottomCol)
      display.appendChild(bottomRow)

      let bottomButton = nextQButton // so we know where to insert alert

      // answer blank and submit button
      let answerForm = document.createElement("form")
      answerForm.id = "answerForm"
      let answerFormDiv = document.createElement("div")
      answerFormDiv.className = "form-group"
      let input = document.createElement("input")
      input.className = "form-control"
      input.id = "answer"
      input.setAttribute("placeholder", "Your answer")
      let submit = document.createElement("button")
      submit.className = "btn btn-light mt-2"
      submit.setAttribute("type", "submit")
      submit.textContent = "Check Answer"
      answerFormDiv.appendChild(input)
      answerFormDiv.appendChild(submit)
      answerForm.appendChild(answerFormDiv)
      bottomCol.insertBefore(answerForm, nextQButton)

      // get first question
      let currentQ = 0
      getQuestion(currentQ, questionsArr, category)

      function nextQ() {
        currentQ++
        getQuestion(currentQ, questionsArr, category)

        // remove nextQButton when on last question
        if (currentQ === 4) {
          nextQButton.removeEventListener("click", nextQ)
          nextQButton.parentElement.removeChild(nextQButton)

          // add a button to go back to the categories screen
          let showCategoriesButton = document.createElement("button")
          showCategoriesButton.className = "btn btn-light"
          showCategoriesButton.textContent = "Back to categories"
          bottomCol.appendChild(showCategoriesButton)
          showCategoriesButton.addEventListener("click", showCategories)

          bottomButton = showCategoriesButton // so we know where to insert alert
        }
      }

      nextQButton.addEventListener("click", nextQ)

      function checkAnswer(event) {
        event.preventDefault()

        // get answer from response.data and guess from form
        let answer = questionsArr[currentQ].answer
        let guess = input.value

        let feedback = document.createElement("div")
        feedback.id = "feedback"

        // increment right or wrong answers in local storage (doesn't exist yet)
        let users = JSON.parse(localStorage.getItem("users"))
        let name = localStorage.getItem("loggedInUser")

        // normalize both the answer from the API and the guess
        // then check whether they are the same
        // I do some of the normalizing on the answer here instead of in the
        // normalizeAnswer function because I don't want it to display
        // in lowercase or without the/a/an when giving correct answer
        if (normalizeInput(guess) === normalizeAnswer(answer).toLowerCase().replace(/^(the|a|an) (.*)/, "$2")) {
          users[name].right++
          localStorage.setItem("users", JSON.stringify(users))
          feedback.className = "alert alert-success"
          feedback.textContent = "Correct!"
        }
        // give some feedback - right/wrong and correct answer
        else {
          users[name].wrong++
          localStorage.setItem("users", JSON.stringify(users))
          feedback.className = "alert alert-danger"
          feedback.textContent = `Incorrect!  The correct answer is "${normalizeAnswer(answer)}".`
        }

        bottomCol.insertBefore(feedback, bottomButton)

        // you shouldn't be able to answer more than once
        // so hide (?) answer form
        answerForm.hidden = true
      }

      submit.addEventListener("click", checkAnswer)
    })
}

// this function unhides categories and removes question screen
// (remove vs. hide because getting new q's will be another
// AJAX request no matter what)
function showCategories() {
  for (let i = 0; i < display.children.length; i++) {
    display.children[i].hidden = false
  }

  let infoRow = document.getElementById("info-row")
  let qRow = document.getElementById("qrow")
  let bottomCol = document.getElementById("bottom-col") // could this be changed to bottom row?
  infoRow.parentElement.removeChild(infoRow)
  qRow.parentElement.removeChild(qRow)
  bottomCol.parentElement.removeChild(bottomCol)
}

// clean up API answers
function normalizeAnswer(ans) {
  ans = ans.replace(/^<.*>(.*)<\/.*>$/, "$1") // get rid of HTML tags
  ans = ans.replace(/^"(.*)"$/, "$1") // get rid of quotation marks
  ans = ans.replace(/(.[^\\]*)\\(.*)/g, "$&") // get rid of backslash escape chars
  ans = ans.replace(/^\((.[^(]*)\)/, "$1") // get rid of parens around first name

  return ans
}

// this function gets rid of "what is", "who is", "the", "a", "an" at
// beginning of answer and "?" at end, as well as lowercases everything
function normalizeInput(ans) {
  ans = ans.toLowerCase()

  // gets rid of "what is"/"what are"/"who is"/"who are"
  ans = ans.replace(/^(who|what) (is|are) (.*)/, "$3")

  // gets rid of the/a/an
  ans = ans.replace(/^(the|a|an) (.*)/, "$2")

  // gets rid of question mark
  ans = ans.replace(/(.[^?]*)\??$/, "$1")

  return ans
}

// this function grabs category data, adds categories to board, adds click listeners
function populateCategories() {
  // get a random offset
  let offset = Math.ceil(Math.random() * 18300) + 1

  axios.get(`http://jservice.io/api/categories?count=6&offset=${offset}`)
    .then((response) => {
      // add category text to board and click listener for each category
      for (let i = 0; i < response.data.length; i++) {
        let id = response.data[i].id
        let title = response.data[i].title.toUpperCase()
        cats[i] = { id, title }
        let catClickArea = document.getElementById(`cat${i + 1}`)
        let catName = document.getElementById(`cat${i + 1}`).children[0]
        catName.textContent = cats[i].title
      }
    })
}

function reloadCategoriesScreen() {
  makeCategoriesScreen()
  populateCategories()
}

document.addEventListener("DOMContentLoaded", () => {
  let display = document.getElementById("display")

  let usernameNav = document.getElementById("username")
  usernameNav.textContent = localStorage.getItem("loggedInUser") || "Not logged in"

  let statsButton = document.getElementById("statistics")
  statsButton.addEventListener("click", makeStatsScreen)

  let playButton = document.getElementById("play")
  playButton.addEventListener("click", reloadCategoriesScreen)

  if (!localStorage.getItem("loggedInUser")) {
    makeStatsScreen()
  }
  else {
    reloadCategoriesScreen()
  }
})
