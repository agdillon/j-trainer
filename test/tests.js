const { expect } = chai

describe('check tests are running', () => {
  it('Check Tests running', () => {
    expect(true).to.equal(true);
  })
})

describe('test DOM helpers', () => {
  it('does makeCategoriesScreen exist', () => {
    expect(makeCategoriesScreen).to.be.a("function")
  })
})
