document.addEventListener("DOMContentLoaded", () => {
  let howManyCategories = 6

  let display = document.getElementById("display")

  // this function sets up the empty categories board
  // may need to clear previous display content when coming back to it
  function makeCategoriesModule() {
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
  makeCategoriesModule()

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
        makeQuestionsModule(catNoOnBoard, cats[catNoOnBoard])
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
      }

      // this function makes the board setup for the questions
      // and gets the question data via AJAX, then displays first q
      function makeQuestionsModule(catNoOnBoard, category) {
        // remove event listeners
        for (let i = 0; i < howManyCategories; i++) {
          let catClickArea = document.getElementById(`cat${i + 1}`)
          catClickArea.removeEventListener("click", selectCategory)
        }

        // remove categories module
        while (display.firstChild) {
          display.removeChild(display.firstChild)
        }

        axios.get(`http://jservice.io/api/category?id=${category.id}`)
          .then((qresponse) => {
            console.log(qresponse.data)

            let questionsArr = qresponse.data.clues

            // make a space for the category name and dollar value info
            let infoRow = document.createElement("div")
            infoRow.classList = "row"
            let infoCol = document.createElement("div")
            infoCol.classList = "col-md-6 offset-md-2 text-light text-center"
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

            // get first question
            let currentQ = 0
            getQuestion(currentQ, questionsArr, category)

            // make a "next question" button
            let nextQRow = document.createElement("div")
            nextQRow.classList = "row"
            let nextQCol = document.createElement("div")
            nextQCol.classList = "col-md-4 offset-md-3 text-center pt-2"
            let nextQButton = document.createElement("button")
            nextQButton.setAttribute("type", "button")
            nextQButton.className = "btn btn-light"
            nextQButton.setAttribute("id", "next-q-button")
            nextQButton.textContent = "Next question"
            nextQCol.appendChild(nextQButton)
            nextQRow.appendChild(nextQCol)
            display.appendChild(nextQRow)

            function nextQ() {
              currentQ++
              getQuestion(currentQ, questionsArr, category)

              // need to remove nextQButton when on last question
              if (currentQ === 4) {
                nextQButton.removeEventListener("click", nextQ)
                nextQButton.parentElement.removeChild(nextQButton)
              }
            }

            nextQButton.addEventListener("click", nextQ)

            // answer blank and submit button


          })
      }
    })
})
