document.addEventListener("DOMContentLoaded", () => {
  let howManyCategories = 6

  let display = document.getElementById("display")

  // this function sets up the empty categories board (one time)
  function makeCategoriesScreen() {
    let howManyRows = 2 // all of this should be rewritten to be responsive
    let rows = []
    for (let j = 1; j <= howManyRows; j++) {
      rows[j] = document.createElement("div")
      rows[j].className = "row my-2"

      for (let i = 1; i <= howManyCategories / howManyRows; i++) {
        let catTV = document.createElement("div")
        catTV.className = "col-md-3 py-4 mx-1 tv category-card"

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
    refreshRow.classList = "row"
    let refreshCol = document.createElement("div")
    refreshCol.classList = "col-md-9 text-center"
    let refreshButton = document.createElement("button")
    refreshButton.classList = "btn btn-light"
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
        console.log(qresponse.data)
        let questionsArr = qresponse.data.clues

        // make a space for the category name and dollar value info
        let infoRow = document.createElement("div")
        infoRow.classList = "row"
        infoRow.id = "info-row"
        let infoCol = document.createElement("div")
        infoCol.classList = "col-md-8 offset-md-1 text-light text-center"
        let infoHeader = document.createElement("h2")
        infoHeader.id = "info-header"
        infoCol.appendChild(infoHeader)
        infoRow.appendChild(infoCol)
        display.appendChild(infoRow)

        // make question TV
        let questionTV = document.createElement("div")
        // questionTV.setAttribute("id", "question-TV")
        questionTV.classList = "col-md-4 offset-md-3 tv question-card"
        let questionTVText = document.createElement("h1")
        questionTVText.id = "question-TV-text"
        questionTV.appendChild(questionTVText)
        let qRow = document.createElement("div")
        qRow.classList = "row"
        qRow.id = "qrow"
        qRow.appendChild(questionTV)
        display.appendChild(qRow)

        // make a "next question" button
        let bottomRow = document.createElement("div")
        bottomRow.classList = "row"
        let bottomCol = document.createElement("div")
        bottomCol.classList = "col-md-4 offset-md-3 text-center pt-2"
        bottomCol.id = "bottom-col"
        let nextQButton = document.createElement("button")
        nextQButton.setAttribute("type", "button")
        nextQButton.className = "btn btn-light"
        nextQButton.id = "next-q-button"
        nextQButton.textContent = "Next question"
        bottomCol.appendChild(nextQButton)
        bottomRow.appendChild(bottomCol)
        display.appendChild(bottomRow)

        // answer blank and submit button
        let answerForm = document.createElement("form")
        answerForm.id = "answerForm"
        let answerFormDiv = document.createElement("div")
        answerFormDiv.classList = "form-group"
        let input = document.createElement("input")
        input.classList = "form-control"
        input.id = "answer"
        input.setAttribute("placeholder", "Your answer")
        let submit = document.createElement("button")
        submit.classList = "btn btn-light"
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
            showCategoriesButton.classList = "btn btn-light"
            showCategoriesButton.textContent = "Back to categories"
            bottomCol.appendChild(showCategoriesButton)
            showCategoriesButton.addEventListener("click", showCategories)
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

          // normalize both the answer from the API and the guess
          // then check whether they are the same
          if (normalizeAnswer(guess) === normalizeAnswer(answer)) {
            feedback.classList = "alert alert-success"
            feedback.textContent = "Correct!"
          }
          // give some feedback - right/wrong and correct answer
          else {
            feedback.classList = "alert alert-danger"
            feedback.textContent = `Incorrect!  The correct answer is "${answer}".`
          }

          bottomCol.insertBefore(feedback, nextQButton)

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

  // this function gets rid of "what is", "who is", "the", "a", "an" at
  // beginning of answer and "?" at end, as well as lowercases everything
  function normalizeAnswer(ans) {
    ans = ans.toLowerCase()

    if (ans.indexOf("what is ") === 0) { ans = ans.slice(8) }

    if (ans.indexOf("who is ") === 0) { ans = ans.slice(7) }

    if (ans.indexOf("the ") === 0) { ans = ans.slice(4) }

    if (ans.indexOf("a ") === 0) { ans = ans.slice(2) }

    if (ans.indexOf("an ") === 0) { ans = ans.slice(3) }

    if (ans.indexOf("?") === ans.length - 1) { ans = ans.slice(0, ans.length - 1) }

    return ans
  }

  // main program starts here
  makeCategoriesScreen()
  populateCategories()

  // this function grabs category data, adds categories to board, adds click listeners
  function populateCategories() {
    // get a random offset
    let offset = Math.ceil(Math.random() * 18300) + 1

    axios.get(`http://jservice.io/api/categories?count=6&offset=${offset}`)
      .then((response) => {
        console.log(response.data)
        let cats = []

        // add category text to board and click listener for each category
        for (let i = 0; i < response.data.length; i++) {
          let id = response.data[i].id
          let title = response.data[i].title.toUpperCase()
          cats[i] = { id, title }
          let catClickArea = document.getElementById(`cat${i + 1}`)
          let catName = document.getElementById(`cat${i + 1}`).children[0]
          catName.textContent = cats[i].title
          catClickArea.removeEventListener("click", selectCategory)
          catClickArea.addEventListener("click", selectCategory)
        }

        // click handler when you pick a category to send you to the questions screen
        function selectCategory(event) {
          event.preventDefault()
          let idNumberString = this.id.slice(3)
          let catNoOnBoard = parseInt(idNumberString, 10) - 1
          makeQuestionsScreen(catNoOnBoard, cats[catNoOnBoard])
        }

      })
  }
})
