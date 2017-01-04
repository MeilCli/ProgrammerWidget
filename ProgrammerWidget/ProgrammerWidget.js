var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
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
    getAsync(request) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                var http = new XMLHttpRequest();
                http.open("GET", request.url, false);
                http.send();
                var response = new HttpResponse(http.responseText, http.status);
                resolve(response);
            });
        });
    }
}
class HttpRequest {
    constructor(url) {
        this.url = url;
    }
}
class HttpResponse {
    constructor(content, status) {
        this.content = content;
        this.status = status;
    }
}
Element.prototype.addDiv = function (reciever) {
    var element = document.createElement("div");
    reciever(element);
    this.appendChild(element);
};
Element.prototype.addH2 = function (reciever) {
    var element = document.createElement("h2");
    reciever(element);
    this.appendChild(element);
};
Element.prototype.addP = function (reciever) {
    var element = document.createElement("p");
    reciever(element);
    this.appendChild(element);
};
Element.prototype.addA = function (reciever) {
    var element = document.createElement("a");
    reciever(element);
    this.appendChild(element);
};
Element.prototype.addImg = function (reciever) {
    var element = document.createElement("img");
    reciever(element);
    this.appendChild(element);
};
Element.prototype.addUl = function (reciever) {
    var element = document.createElement("ul");
    reciever(element);
    this.appendChild(element);
};
Element.prototype.addLi = function (reciever) {
    var element = document.createElement("li");
    reciever(element);
    this.appendChild(element);
};
function getAsyncWithStorage(httpClient, url) {
    return __awaiter(this, void 0, void 0, function* () {
        var storagedTime = window.localStorage.getItem(storageTimeKey + url);
        var storagedItem = window.localStorage.getItem(storageItemKey + url);
        if (storagedItem != null && storagedItem != undefined && new Date(storagedTime).getTime() + hour > new Date().getDate()) {
            return JSON.parse(storagedItem);
        }
        var httpRequest = new HttpRequest(url);
        var response = yield httpClient.getAsync(httpRequest);
        if (response.status != 200) {
            return;
        }
        window.localStorage.setItem(storageItemKey + url, response.content);
        window.localStorage.setItem(storagedTime + url, new Date().toUTCString());
        return JSON.parse(response.content);
    });
}
class Qiita {
    constructor() {
        this.httpClient = new HttpClient();
    }
    set(element) {
        return __awaiter(this, void 0, void 0, function* () {
            var user = element.getAttribute(userNameAttribute);
            if (user == null || user == undefined) {
                return;
            }
            var url = "https://qiita.com/api/v1/users/" + user;
            var json = yield getAsyncWithStorage(this.httpClient, url);
            if (json == null || json == undefined) {
                return;
            }
            this.setHead(element, json);
            this.setList(element, json);
            this.setTags(element, json);
        });
    }
    setHead(element, json) {
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
    setTags(element, json) {
        element.addP((p) => __awaiter(this, void 0, void 0, function* () {
            p.className = "programmer-widget-paragraph-qiita";
            var url = "https://qiita.com/api/v1/users/" + json["url_name"] + "/items";
            var items = yield getAsyncWithStorage(this.httpClient, url);
            if (items == null || items == undefined) {
                return;
            }
            var tagsCountMap = new Map();
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
        }));
    }
    setList(element, json) {
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
    constructor() {
        this.httpClient = new HttpClient();
    }
    set(element) {
        return __awaiter(this, void 0, void 0, function* () {
            var user = element.getAttribute(userNameAttribute);
            if (user == null || user == undefined) {
                return;
            }
            var url = "https://teratail.com/api/v1/users/" + user;
            var json = yield getAsyncWithStorage(this.httpClient, url);
            if (json == null || json == undefined) {
                return;
            }
            console.log(json);
            this.setHead(element, json);
            this.setList(element, json);
            this.setRank(element, json);
        });
    }
    setHead(element, json) {
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
    setRank(element, json) {
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
    setList(element, json) {
        element.addDiv((container) => {
            container.className = "programmer-widget-list-container";
            container.addDiv((div) => {
                div.addDiv((divNumber) => __awaiter(this, void 0, void 0, function* () {
                    divNumber.className = "programmer-widget-list-number";
                    var url = "https://teratail.com/api/v1/users/" + json["user"]["display_name"] + "/followings";
                    var items = yield getAsyncWithStorage(this.httpClient, url);
                    if (items == null || items == undefined) {
                        return;
                    }
                    divNumber.innerHTML = items["meta"]["hit_num"];
                }));
                div.addDiv((divTitle) => {
                    divTitle.className = "programmer-widget-list-title";
                    divTitle.innerHTML = "Following";
                });
            });
            container.addDiv((div) => {
                div.addDiv((divNumber) => __awaiter(this, void 0, void 0, function* () {
                    divNumber.className = "programmer-widget-list-number";
                    var url = "https://teratail.com/api/v1/users/" + json["user"]["display_name"] + "/followers";
                    var items = yield getAsyncWithStorage(this.httpClient, url);
                    if (items == null || items == undefined) {
                        return;
                    }
                    divNumber.innerHTML = items["meta"]["hit_num"];
                }));
                div.addDiv((divTitle) => {
                    divTitle.className = "programmer-widget-list-title";
                    divTitle.innerHTML = "Followers";
                });
            });
            container.addDiv((div) => {
                div.addDiv((divNumber) => __awaiter(this, void 0, void 0, function* () {
                    divNumber.className = "programmer-widget-list-number";
                    var url = "https://teratail.com/api/v1/users/" + json["user"]["display_name"] + "/replies";
                    var items = yield getAsyncWithStorage(this.httpClient, url);
                    if (items == null || items == undefined) {
                        return;
                    }
                    divNumber.innerHTML = items["meta"]["hit_num"];
                }));
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
    constructor() {
        this.httpClient = new HttpClient();
    }
    set(element) {
        return __awaiter(this, void 0, void 0, function* () {
            var user = element.getAttribute(userNameAttribute);
            if (user == null || user == undefined) {
                return;
            }
            var url = "https://api.github.com/users/" + user;
            var json = yield getAsyncWithStorage(this.httpClient, url);
            if (json == null || json == undefined) {
                return;
            }
            this.setHead(element, json);
            this.setList(element, json);
            this.setLang(element, json);
        });
    }
    setHead(element, json) {
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
    setLang(element, json) {
        element.addP((p) => __awaiter(this, void 0, void 0, function* () {
            p.className = "programmer-widget-paragraph-github";
            var url = "https://api.github.com/users/" + json["login"] + "/repos?sort=updated&direction=desc";
            var items = yield getAsyncWithStorage(this.httpClient, url);
            if (items == null || items == undefined) {
                return;
            }
            var langCountMap = new Map();
            for (var i = 0; i < items.length && i < 25; i++) {
                var langUrl = "https://api.github.com/repos/" + items[i]["full_name"] + "/languages";
                var langItems = yield getAsyncWithStorage(this.httpClient, langUrl);
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
        }));
    }
    setList(element, json) {
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
//# sourceMappingURL=ProgrammerWidget.js.map