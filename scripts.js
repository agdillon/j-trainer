document.addEventListener("DOMContentLoaded", () => {
  let howManyCategories = 6

  let display = document.getElementById("display")

  // this function sets up the empty categories board
  // may need to clear previous display content when coming back to it
  function makeCategoriesScreen() {
    let howManyRows = 2
    let rows = []
    for (let j = 1; j <= howManyRows; j++) {
      rows[j] = document.createElement("div")
      rows[j].className = "row"

      for (let i = 1; i <= howManyCategories / howManyRows; i++) { // 3x2, could add responsiveness here instead
        let catTV = document.createElement("div")
        catTV.className = "col-md-3 py-4 tv category-card"
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
    rows[1].classList.add("my-1")
  }

  // main program starts here
  makeCategoriesScreen()

  // grab category data, add categories to board, add click listeners
  //
  axios.get(`http://jservice.io/api/categories?count=6&offset=10`)
    .then((response) => {
      console.log(response.data)
      let cats = []

      for (let i = 0; i < response.data.length; i++) {
        let id = response.data[i].id
        let title = response.data[i].title.toUpperCase()
        cats[i] = { id, title }
        let catClickArea = document.getElementById(`cat${i + 1}`)
        let catName = document.getElementById(`cat${i + 1}`).children[0]
        catName.textContent = cats[i].title
        catClickArea.addEventListener("click", selectCategory)
      }

      function selectCategory(event) {
        event.preventDefault()
        let idNumberString = this.id.slice(3)
        let catNoOnBoard = parseInt(idNumberString, 10) - 1
        makeQuestionsScreen(catNoOnBoard, cats[catNoOnBoard])
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

        // need to clear answer blank and alert
        let answer = document.getElementById("answer")
        answer.value = ""
        let feedback = document.getElementById("feedback")
        if (feedback) {
          feedback.parentElement.removeChild(feedback)
        }
      }

      // this function makes the board setup for the questions
      // and gets the question data via AJAX, then displays first q
      function makeQuestionsScreen(catNoOnBoard, category) {
        // remove event listeners - commented out because the elements will be hidden
        // for (let i = 0; i < howManyCategories; i++) {
        //   let catClickArea = document.getElementById(`cat${i + 1}`)
        //   catClickArea.removeEventListener("click", selectCategory)
        // }

        // remove -- now hide! -- categories screen
        // while (display.firstChild) {
        // display.removeChild(display.firstChild)
        // }
        for (let i = 0; i < display.children.length; i++) {
          display.children[i].hidden = true
        }

        axios.get(`http://jservice.io/api/category?id=${category.id}`)
          .then((qresponse) => {
            console.log(qresponse.data)

            let questionsArr = qresponse.data.clues

            // make a space for the category name and dollar value info
            let infoRow = document.createElement("div")
            infoRow.classList = "row"
            let infoCol = document.createElement("div")
            infoCol.classList = "col-md-8 offset-md-1 text-light text-center"
            let infoHeader = document.createElement("h2")
            infoHeader.setAttribute("id", "info-header")
            infoCol.appendChild(infoHeader)
            infoRow.appendChild(infoCol)
            display.appendChild(infoRow)

            // make question TV
            let questionTV = document.createElement("div")
            // questionTV.setAttribute("id", "question-TV")
            questionTV.classList = "col-md-4 offset-md-3 tv question-card"
            let questionTVText = document.createElement("h1")
            questionTVText.setAttribute("id", "question-TV-text")
            questionTV.appendChild(questionTVText)
            let qRow = document.createElement("div")
            qRow.classList = "row"
            qRow.appendChild(questionTV)
            display.appendChild(qRow)

            // make a "next question" button
            let bottomRow = document.createElement("div")
            bottomRow.classList = "row"
            let bottomCol = document.createElement("div")
            bottomCol.classList = "col-md-4 offset-md-3 text-center pt-2"
            let nextQButton = document.createElement("button")
            nextQButton.setAttribute("type", "button")
            nextQButton.className = "btn btn-light"
            nextQButton.setAttribute("id", "next-q-button")
            nextQButton.textContent = "Next question"
            bottomCol.appendChild(nextQButton)
            bottomRow.appendChild(bottomCol)
            display.appendChild(bottomRow)

            // answer blank and submit button
            let form = document.createElement("form")
            let formDiv = document.createElement("div")
            formDiv.classList = "form-group"
            let input = document.createElement("input")
            input.classList = "form-control"
            input.setAttribute("id", "answer")
            input.setAttribute("placeholder", "Your answer")
            let submit = document.createElement("button")
            submit.classList = "btn btn-light"
            submit.setAttribute("type", "submit")
            submit.textContent = "Check Answer"
            formDiv.appendChild(input)
            formDiv.appendChild(submit)
            form.appendChild(formDiv)
            bottomCol.insertBefore(form, nextQButton)

            // get first question
            let currentQ = 0
            getQuestion(currentQ, questionsArr, category)

            function nextQ() {
              currentQ++
              getQuestion(currentQ, questionsArr, category)

              function showCategories() {
                for (let i = 0; i < display.children.length; i++) {
                  display.children[i].hidden = false
                }

                // then need to remove question screen
                // (remove vs. hide because getting new q's will be another
                // AJAX request no matter what)
                infoRow.parentElement.removeChild(infoRow)
                qRow.parentElement.removeChild(qRow)
                bottomCol.parentElement.removeChild(bottomCol)
              }

              // need to remove nextQButton when on last question
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

              // need to get answer from response.data
              let answer = questionsArr[currentQ].answer
              guess = normalizeAnswer(input.value)

              let feedback = document.createElement("div")
              feedback.setAttribute("id", "feedback")
              // do some stuff to both input and right answer (can test without this)
              // then check input against answer
              // increment right or wrong answers in local storage (doesn't exist yet)
              // and give some feedback - right/wrong and correct answer
              // also, you shouldn't be able to answer more than once
              if (guess === normalizeAnswer(answer)) {
                feedback.classList = "alert alert-success"
                feedback.textContent = "Correct!"
                bottomCol.insertBefore(feedback, nextQButton)
              }
              else {
                feedback.classList = "alert alert-danger"
                feedback.textContent = `Incorrect!  The correct answer is "${answer}".`
                bottomCol.insertBefore(feedback, nextQButton)
              }
            }

            // // need to get answer from response.data
            // let answer = questionsArr[currentQ].answer.toLowerCase()
            let guess = ""
            // take answer from form blank (value) with event listener on submit button
            submit.addEventListener("click", checkAnswer)
          })
      }
    })
})
