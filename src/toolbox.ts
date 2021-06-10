export class ToolBox {

  btnPrevPage: HTMLButtonElement
  btnNextPage: HTMLButtonElement
  btnFirstPage: HTMLButtonElement
  btnLastPage: HTMLButtonElement
  main: any

  constructor(main: any) {
    this.main = main
    this.btnPrevPage = <HTMLButtonElement>document.getElementById('btnPrevPage')
    this.btnNextPage = <HTMLButtonElement>document.getElementById('btnNextPage')
    this.btnFirstPage = <HTMLButtonElement>document.getElementById('btnFirstPage')
    this.btnLastPage = <HTMLButtonElement>document.getElementById('btnLastPage')
  }

  bindActions() {
    this.btnFirstPage.onclick = () => {
      this.main.finishText()
      this.goToFirstPage()
      this.main.resetMediaObjects()
    }
    this.btnLastPage.onclick = () => {
      this.main.finishText()
      this.goToLastPage()
      this.main.resetMediaObjects()
    }
    this.btnPrevPage.onclick = () => {
      this.main.finishText()
      this.main.pageNumber = this.main.pageNumber - 2
      if (this.main.pageNumber == 1 || this.main.pageNumber < 1) this.goToFirstPage()
      this.btnNextPage.disabled = false
      this.btnLastPage.disabled = true
      this.main.setImgSrc()
      this.main.inputPageNumber.value = this.main.pageNumber.toString()
      this.main.resetMediaObjects()
    }

    this.btnNextPage.onclick = () => {
      this.main.finishText()
      this.main.pageNumber = this.main.pageNumber + 2
      if (this.main.pageNumber >= this.main.mainData.pages.length - 1) this.goToLastPage()
      this.btnPrevPage.disabled = false
      this.btnFirstPage.disabled = false
      this.main.setImgSrc()
      this.main.inputPageNumber.value = this.main.pageNumber.toString()
      this.main.resetMediaObjects()
    }
  }

  goToFirstPage() {
    this.main.pageNumber = 1
    this.btnPrevPage.disabled = true
    this.btnFirstPage.disabled = true
    this.btnLastPage.disabled = false
    this.btnNextPage.disabled = false
    this.main.setImgSrc()
    this.main.inputPageNumber.value = this.main.pageNumber.toString()
  }

  goToLastPage() {
    this.main.pageNumber = this.main.mainData.pages.length - 1
    this.btnPrevPage.disabled = false
    this.btnFirstPage.disabled = false
    this.btnLastPage.disabled = true
    this.btnNextPage.disabled = true
    this.main.setImgSrc()
    this.main.inputPageNumber.value = this.main.pageNumber.toString()
  }
}