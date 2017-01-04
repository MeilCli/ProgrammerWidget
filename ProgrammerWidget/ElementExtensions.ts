interface Element {

    addDiv(reciever: (div: HTMLDivElement) => void);
    addH2(reciever: (h2: HTMLHeadingElement) => void);
    addP(reciever: (h2: HTMLParagraphElement) => void);
    addA(reciever: (a: HTMLAnchorElement) => void);
    addImg(reciever: (img: HTMLImageElement) => void);
    addUl(reciever: (ul: HTMLUListElement) => void);
    addLi(reciever: (li: HTMLLIElement) => void);
}

Element.prototype.addDiv = function (reciever: (div: HTMLDivElement) => void) {
    var element = document.createElement("div");
    reciever(element);
    this.appendChild(element);
}
Element.prototype.addH2 = function (reciever: (h2: HTMLHeadingElement) => void) {
    var element = document.createElement("h2");
    reciever(element);
    this.appendChild(element);
}
Element.prototype.addP = function (reciever: (h2: HTMLParagraphElement) => void) {
    var element = document.createElement("p");
    reciever(element);
    this.appendChild(element);
}
Element.prototype.addA = function (reciever: (a: HTMLAnchorElement) => void) {
    var element = document.createElement("a");
    reciever(element);
    this.appendChild(element);
}
Element.prototype.addImg = function (reciever: (img: HTMLImageElement) => void) {
    var element = document.createElement("img");
    reciever(element);
    this.appendChild(element);
}
Element.prototype.addUl = function (reciever: (img: HTMLUListElement) => void) {
    var element = document.createElement("ul");
    reciever(element);
    this.appendChild(element);
}
Element.prototype.addLi = function (reciever: (img: HTMLLIElement) => void) {
    var element = document.createElement("li");
    reciever(element);
    this.appendChild(element);
}