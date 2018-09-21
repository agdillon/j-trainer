const { expect } = chai

describe("normalizeAnswer function", () => {
  it("is a function", () => {
    expect(normalizeAnswer).to.be.a("function")
  })
  it("removes HTML tags from answer", () => {
    expect(normalizeAnswer("<i>The Grapes of Wrath</i>")).to.equal("The Grapes of Wrath")
  })
  it("removes quotation marks from answer", () => {
    expect(normalizeAnswer('"Wish You Were Here"')).to.equal('Wish You Were Here')
  })
  it("doesn't remove anything from an answer without HTML or quotes", () => {
    expect(normalizeAnswer("Gravity's Rainbow")).to.equal("Gravity's Rainbow")
  })
})

describe("normalizeInput function", () => {
  it("is a function", () => {
    expect(normalizeInput).to.be.a("function")
  })
  it('removes "What is" and "?" and lowercases answer', () => {
    expect(normalizeInput("What is the White House?")).to.equal("white house")
  })
  it("doesn't remove anything from an answer without that stuff", () => {
    expect(normalizeInput("What to Expect When You're Expecting")).to.equal("what to expect when you're expecting")
  })
  it("only removes what it's supposed to", () => {
    expect(normalizeInput("The Who")).to.equal("who")
  })
})
