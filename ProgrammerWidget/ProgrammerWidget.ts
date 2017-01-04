const userNameAttribute = "target-user";
const qiitaClass = "programmer-widget-qiita";
const teratailClass = "programmer-widget-teratail";
const githubClass = "programmer-widget-github";

const storageItemKey = "programmer-widget-storage-item: ";
const storageTimeKey = "programmer-widget-storage-time: ";
const second = 1000;
const minitu = second * 60;
const hour = minitu * 60;


class HttpClient {

    async getAsync(request: HttpRequest) {
        return new Promise<HttpResponse>((resolve) => {
            var http = new XMLHttpRequest();
            http.open("GET", request.url, false);
            http.send();
            var response = new HttpResponse(http.responseText, http.status);
            resolve(response);
        });
    }

}

class HttpRequest {

    url: string;

    constructor(url: string) {
        this.url = url;
    }
}

class HttpResponse {

    content: string;
    status: number;

    constructor(content: string, status: number) {
        this.content = content;
        this.status = status;
    }

}

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

async function getAsyncWithStorage(httpClient: HttpClient, url: string) {
    var storagedTime = window.localStorage.getItem(storageTimeKey + url);
    var storagedItem = window.localStorage.getItem(storageItemKey + url);
    if (storagedItem != null && storagedItem != undefined && new Date(storagedTime).getTime() + hour > new Date().getDate()) {
        return JSON.parse(storagedItem);
    }

    var httpRequest = new HttpRequest(url);
    var response = await httpClient.getAsync(httpRequest);
    if (response.status != 200) {
        return;
    }

    window.localStorage.setItem(storageItemKey + url, response.content);
    window.localStorage.setItem(storagedTime + url, new Date().toUTCString());
    return JSON.parse(response.content);
}


class Qiita {
    httpClient = new HttpClient();

    async set(element: Element) {
        var user = element.getAttribute(userNameAttribute);
        if (user == null || user == undefined) {
            return;
        }
        var url = "https://qiita.com/api/v1/users/" + user;
        var json = await getAsyncWithStorage(this.httpClient, url);
        if (json == null || json == undefined) {
            return;
        }
        this.setHead(element, json);
        this.setList(element, json);
        this.setTags(element, json);
    }

    setHead(element: Element, json: any) {
        element.addA((a) => {
            a.href = json["url"];
            a.addImg((img) => {
                img.className = "programmer-widget-image";
                img.src = json["profile_image_url"];
            });
        });
        element.addH2((h2) => {
            h2.className = "programmer-widget-heading";
            h2.addA((a) => {
                a.href = json["url"];
                a.text = json["name"];
            });
        });
        element.addH2((h2) => {
            h2.className = "programmer-widget-logo";
            h2.innerText = "Qiita";
        });
    }

    setTags(element: Element, json: any) {
        element.addP(async (p) => {
            p.className = "programmer-widget-paragraph-qiita";
            var url = "https://qiita.com/api/v1/users/" + json["url_name"] + "/items";
            var items = await getAsyncWithStorage(this.httpClient, url);
            if (items == null || items == undefined) {
                return;
            }
            var tagsCountMap = new Map<string, number>();
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                for (var j = 0; j < item.tags.length; j++) {
                    var tag = item.tags[j].name;
                    if (tagsCountMap.has(tag) == false) {
                        tagsCountMap.set(tag, 0);
                    }
                    tagsCountMap.set(tag, tagsCountMap.get(tag) + 1);
                }
            }
            var tagsCountArray = new Array();
            var tagsCountIterator = tagsCountMap.entries();
            for (var i = 0; i < tagsCountMap.size; i++) {
                var entry = tagsCountIterator.next().value;
                tagsCountArray[i] = { name: entry[0], count: entry[1] };
            }
            tagsCountArray.sort((a, b) => {
                return a.count > b.count ? -1 : a.count < b.count ? 1 : 0;
            });

            p.innerText = tagsCountArray[0].name + ", " + tagsCountArray[1].name + ", " + tagsCountArray[2].name;
        });
    }

    setList(element: Element, json: any) {
        element.addDiv((container) => {
            container.className = "programmer-widget-list-container";
            container.addDiv((div) => {
                div.addDiv((divNumber) => {
                    divNumber.className = "programmer-widget-list-number";
                    divNumber.innerHTML = json["following_users"];
                });
                div.addDiv((divTitle) => {
                    divTitle.className = "programmer-widget-list-title";
                    divTitle.innerHTML = "Following";
                });
            });
            container.addDiv((div) => {
                div.addDiv((divNumber) => {
                    divNumber.className = "programmer-widget-list-number";
                    divNumber.innerHTML = json["followers"];
                });
                div.addDiv((divTitle) => {
                    divTitle.className = "programmer-widget-list-title";
                    divTitle.innerHTML = "Followers";
                });
            });
            container.addDiv((div) => {
                div.addDiv((divNumber) => {
                    divNumber.className = "programmer-widget-list-number";
                    divNumber.innerHTML = json["items"];
                });
                div.addDiv((divTitle) => {
                    divTitle.className = "programmer-widget-list-title";
                    divTitle.innerHTML = "Items";
                });
            });
            container.addDiv((div) => {
                div.addDiv((divNumber) => {
                    divNumber.className = "programmer-widget-list-number";
                    divNumber.innerHTML = json["contribution"];
                });
                div.addDiv((divTitle) => {
                    divTitle.className = "programmer-widget-list-title";
                    divTitle.innerHTML = "Contribution";
                });
            });
        });
    }

}

class Teratail {
    httpClient = new HttpClient();

    async set(element: Element) {
        var user = element.getAttribute(userNameAttribute);
        if (user == null || user == undefined) {
            return;
        }
        var url = "https://teratail.com/api/v1/users/" + user;
        var json = await getAsyncWithStorage(this.httpClient, url);
        if (json == null || json == undefined) {
            return;
        }
        console.log(json);
        this.setHead(element, json);
        this.setList(element, json);
        this.setRank(element, json);
    }

    setHead(element: Element, json: any) {
        element.addA((a) => {
            a.href = "https://teratail.com/users/" + json["user"]["display_name"];
            a.addImg((img) => {
                img.className = "programmer-widget-image";
                img.src = json["user"]["photo"];
            });
        });
        element.addH2((h2) => {
            h2.className = "programmer-widget-heading";
            h2.addA((a) => {
                a.href = "https://teratail.com/users/" + json["user"]["display_name"];
                a.text = json["user"]["display_name"];
            });
        });
        element.addH2((h2) => {
            h2.className = "programmer-widget-logo";
            h2.innerText = "Teratail";
        });
    }

    setRank(element: Element, json: any) {
        element.addUl((ul) => {
            ul.className = "programmer-widget-paragraph-teratail-container";
            ul.addLi((li) => {
                li.className = "programmer-widget-paragraph-teratail-list1";
                li.innerText = json["user"]["score_ranking"]["total"]["rank"];
            });
            ul.addLi((li) => {
                li.className = "programmer-widget-paragraph-teratail-list2";
                li.innerText = json["user"]["score_ranking"]["weekly"]["rank"];
            });
        });
    }

    setList(element: Element, json: any) {
        element.addDiv((container) => {
            container.className = "programmer-widget-list-container";
            container.addDiv((div) => {
                div.addDiv(async (divNumber) => {
                    divNumber.className = "programmer-widget-list-number";
                    var url = "https://teratail.com/api/v1/users/" + json["user"]["display_name"] + "/followings";
                    var items = await getAsyncWithStorage(this.httpClient, url);
                    if (items == null || items == undefined) {
                        return;
                    }
                    divNumber.innerHTML = items["meta"]["hit_num"]
                });
                div.addDiv((divTitle) => {
                    divTitle.className = "programmer-widget-list-title";
                    divTitle.innerHTML = "Following";
                });
            });
            container.addDiv((div) => {
                div.addDiv(async (divNumber) => {
                    divNumber.className = "programmer-widget-list-number";
                    var url = "https://teratail.com/api/v1/users/" + json["user"]["display_name"] + "/followers"; 
                    var items = await getAsyncWithStorage(this.httpClient, url);
                    if (items == null || items == undefined) {
                        return;
                    }
                    divNumber.innerHTML = items["meta"]["hit_num"]
                });
                div.addDiv((divTitle) => {
                    divTitle.className = "programmer-widget-list-title";
                    divTitle.innerHTML = "Followers";
                });
            });
            container.addDiv((div) => {
                div.addDiv(async (divNumber) => {
                    divNumber.className = "programmer-widget-list-number";
                    var url = "https://teratail.com/api/v1/users/" + json["user"]["display_name"] + "/replies";
                    var items = await getAsyncWithStorage(this.httpClient, url);
                    if (items == null || items == undefined) {
                        return;
                    }
                    divNumber.innerHTML = items["meta"]["hit_num"];
                });
                div.addDiv((divTitle) => {
                    divTitle.className = "programmer-widget-list-title";
                    divTitle.innerHTML = "Answer";
                });
            });
            container.addDiv((div) => {
                div.addDiv((divNumber) => {
                    divNumber.className = "programmer-widget-list-number";
                    divNumber.innerHTML = json["user"]["score"];
                });
                div.addDiv((divTitle) => {
                    divTitle.className = "programmer-widget-list-title";
                    divTitle.innerHTML = "Score";
                });
            });
        });
    }

}

class Github {
    httpClient = new HttpClient();

    async set(element: Element) {
        var user = element.getAttribute(userNameAttribute);
        if (user == null || user == undefined) {
            return;
        }
        var url = "https://api.github.com/users/" + user;
        var json = await getAsyncWithStorage(this.httpClient, url);
        if (json == null || json == undefined) {
            return;
        }
        this.setHead(element, json);
        this.setList(element, json);
        this.setLang(element, json);
    }

    setHead(element: Element, json: any) {
        element.addA((a) => {
            a.href = json["html_url"];
            a.addImg((img) => {
                img.className = "programmer-widget-image";
                img.src = json["avatar_url"];
            });
        });
        element.addH2((h2) => {
            h2.className = "programmer-widget-heading";
            h2.addA((a) => {
                a.href = json["html_url"];
                a.text = json["name"];
            });
        });
        element.addH2((h2) => {
            h2.className = "programmer-widget-logo";
            h2.innerText = "Github";
        });
    }

    setLang(element: Element, json: any) {
        element.addP(async (p) => {
            p.className = "programmer-widget-paragraph-github";
            var url = "https://api.github.com/users/" + json["login"] + "/repos?sort=updated&direction=desc";
            var items = await getAsyncWithStorage(this.httpClient, url);
            if (items == null || items == undefined) {
                return;
            }
            var langCountMap = new Map<string, number>();
            for (var i = 0; i < items.length&&i<25; i++) {
                var langUrl = "https://api.github.com/repos/" + items[i]["full_name"] + "/languages";
                var langItems = await getAsyncWithStorage(this.httpClient, langUrl);
                if (items == null || items == undefined) {
                    break;
                }
                for (var key in langItems) {
                    if (langCountMap.has(key) == false) {
                        langCountMap.set(key, 0);
                    }
                    langCountMap.set(key, langCountMap.get(key) + langItems[key]);
                }
            }
            var langCountArray = new Array();
            var langCountIterator = langCountMap.entries();
            for (var i = 0; i < langCountMap.size; i++) {
                var entry = langCountIterator.next().value;
                langCountArray[i] = { name: entry[0], count: entry[1] };
            }
            langCountArray.sort((a, b) => {
                return a.count > b.count ? -1 : a.count < b.count ? 1 : 0;
            });
            console.log(langCountArray);
            p.innerText = langCountArray[0].name + ", " + langCountArray[1].name + ", " + langCountArray[2].name;
        });
    }

    setList(element: Element, json: any) {
        element.addDiv((container) => {
            container.className = "programmer-widget-list-container";
            container.addDiv((div) => {
                div.addDiv((divNumber) => {
                    divNumber.className = "programmer-widget-list-number";
                    divNumber.innerHTML = json["following"];
                });
                div.addDiv((divTitle) => {
                    divTitle.className = "programmer-widget-list-title";
                    divTitle.innerHTML = "Following";
                });
            });
            container.addDiv((div) => {
                div.addDiv((divNumber) => {
                    divNumber.className = "programmer-widget-list-number";
                    divNumber.innerHTML = json["followers"];
                });
                div.addDiv((divTitle) => {
                    divTitle.className = "programmer-widget-list-title";
                    divTitle.innerHTML = "Followers";
                });
            });
            container.addDiv((div) => {
                div.addDiv((divNumber) => {
                    divNumber.className = "programmer-widget-list-number";
                    divNumber.innerHTML = json["public_repos"];
                });
                div.addDiv((divTitle) => {
                    divTitle.className = "programmer-widget-list-title";
                    divTitle.innerHTML = "Repositories";
                });
            });
            container.addDiv((div) => {
                div.addDiv((divNumber) => {
                    divNumber.className = "programmer-widget-list-number";
                    divNumber.innerHTML = json["public_gists"];
                });
                div.addDiv((divTitle) => {
                    divTitle.className = "programmer-widget-list-title";
                    divTitle.innerHTML = "Gits";
                });
            });
        });
    }

}


window.onload = () => {
    {
        var qiitaElements = document.getElementsByClassName(qiitaClass);
        if (qiitaElements.length > 0) {
            var qiita = new Qiita();
            for (var i = 0; i < qiitaElements.length; i++) {
                var element = qiitaElements[i];
                qiita.set(element);
            }
        }
    }
    {
        var teratailElements = document.getElementsByClassName(teratailClass);
        if (teratailElements.length > 0) {
            var teratail = new Teratail();
            for (var i = 0; i < teratailElements.length; i++) {
                var element = teratailElements[i];
                teratail.set(element);
            }
        }
    }
    {
        var githubElements = document.getElementsByClassName(githubClass);
        if (githubElements.length > 0) {
            var github = new Github();
            for (var i = 0; i < githubElements.length; i++) {
                var element = githubElements[i];
                github.set(element);
            }
        }
    }
};