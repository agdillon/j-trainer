document.addEventListener("DOMContentLoaded", () => {
  let howManyCategories = 6

  let display = document.getElementById("display")

  function makeCategoriesModule() {
    let howManyRows = 2
    let rows = []
    for (let j = 1; j <= howManyRows; j++) {
      rows[j] = document.createElement("div")
      rows[j].className = "row"

      for (let i = 1; i <= howManyCategories / howManyRows; i++) {
        let catTV = document.createElement("div")
        catTV.className = "col-md-3 py-4 tv card-front"
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

  function getCategory(catData) {
    let id = catData.id
    let title = catData.title.toUpperCase()

    return {id, title}
  }

  makeCategoriesModule()

  axios.get(`http://jservice.io/api/categories?count=6&offset=10`)
    .then((response) => {
      console.log(response.data)
      let cats = []

      for (let i = 0; i < response.data.length; i++) {
        cats[i] = getCategory(response.data[i])
        let catName = document.getElementById(`cat${i + 1}`).children[0]
        catName.textContent = cats[i].title
      }

      display.addEventListener("click", selectCategory)

      function selectCategory(event) {
        event.preventDefault()
        let idNumberString = event.target.parentElement.id.slice(3)
        let catNo = parseInt(idNumberString) - 1
        makeQuestionsModule(cats[catNo])
      }

      function makeQuestionsModule(category) {
        // category, dollar value of q
        // single question in tv box
        // answer blank and submit button (maybe saying "next question")

        // remove categories module and event listener
        display.removeEventListener("click", selectCategory)
        while(display.firstChild) {
          display.removeChild(display.firstChild)
        }

        getQuestion(cats[0].id)

        function getQuestion(id) {
        // each category on category screen needs to be a link
        // that link will execute makeQuestionsModule, then this function, loading the
        // question module with the first question from the
        // selected category (this is a axios.get request)

          axios.get(`http://jservice.io/api/category?id=${id}`)
            .then((qresponse) => {
              console.log(qresponse.data)

              let questionTV = document.createElement("div")
              questionTV.classList = "col-md-4 tv"
              let questionsArr = qresponse.data.clues
              questionTV.textContent = questionsArr[0].question // this actually needs to be catNo

              let row = document.createElement("div")
              row.classList = "row"
              let col = document.createElement("div")
              col.classList = "col-md"

              col.appendChild(questionTV)
              row.appendChild(col)
              display.appendChild(row)
            })
        }
      }
    })
})
