var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var ProgrammerWidget;
(function (ProgrammerWidget) {
    ProgrammerWidget.userNameAttribute = "target-user";
    ProgrammerWidget.qiitaClass = "programmer-widget-qiita";
    ProgrammerWidget.teratailClass = "programmer-widget-teratail";
    ProgrammerWidget.githubClass = "programmer-widget-github";
    ProgrammerWidget.widgetClass = "programmer-widget";
    ProgrammerWidget.storageItemKey = "programmer-widget-storage-item: ";
    ProgrammerWidget.storageTimeKey = "programmer-widget-storage-time: ";
    ProgrammerWidget.second = 1000;
    ProgrammerWidget.minitu = ProgrammerWidget.second * 60;
    ProgrammerWidget.hour = ProgrammerWidget.minitu * 60;
})(ProgrammerWidget || (ProgrammerWidget = {}));
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
var ProgrammerWidget;
(function (ProgrammerWidget) {
    class HttpClient {
        getAsync(request) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve) => {
                    var http = new XMLHttpRequest();
                    http.open("GET", request.url);
                    http.onload = (e) => {
                        var response = new HttpResponse(http.responseText, http.status);
                        resolve(response);
                    };
                    http.send();
                });
            });
        }
    }
    ProgrammerWidget.HttpClient = HttpClient;
    class HttpRequest {
        constructor(url) {
            this.url = url;
        }
    }
    ProgrammerWidget.HttpRequest = HttpRequest;
    class HttpResponse {
        constructor(content, status) {
            this.content = content;
            this.status = status;
        }
    }
    ProgrammerWidget.HttpResponse = HttpResponse;
})(ProgrammerWidget || (ProgrammerWidget = {}));
/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
var ProgrammerWidget;
(function (ProgrammerWidget) {
    class Widget {
        getAsyncWithStorage(httpClient, url) {
            return __awaiter(this, void 0, void 0, function* () {
                var storagedTime = window.localStorage.getItem(ProgrammerWidget.storageTimeKey + url);
                var storagedItem = window.localStorage.getItem(ProgrammerWidget.storageItemKey + url);
                if (storagedItem != null && storagedItem != undefined && new Date(storagedTime).getTime() + ProgrammerWidget.hour > new Date().getTime()) {
                    return JSON.parse(storagedItem);
                }
                var httpRequest = new ProgrammerWidget.HttpRequest(url);
                var response = yield httpClient.getAsync(httpRequest);
                if (response.status != 200) {
                    return;
                }
                window.localStorage.setItem(ProgrammerWidget.storageItemKey + url, response.content);
                window.localStorage.setItem(ProgrammerWidget.storageTimeKey + url, new Date().toUTCString());
                return JSON.parse(response.content);
            });
        }
    }
    ProgrammerWidget.Widget = Widget;
})(ProgrammerWidget || (ProgrammerWidget = {}));
/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
/// <reference path="./Widget.ts" />
/// <reference path="./ElementExtensions.ts" />
var ProgrammerWidget;
(function (ProgrammerWidget) {
    class GithubWidget extends ProgrammerWidget.Widget {
        constructor(...args) {
            super(...args);
            this.httpClient = new ProgrammerWidget.HttpClient();
        }
        set(element) {
            return __awaiter(this, void 0, void 0, function* () {
                var user = element.getAttribute(ProgrammerWidget.userNameAttribute);
                if (user == null || user == undefined) {
                    return;
                }
                var url = "https://api.github.com/users/" + user;
                var json = yield this.getAsyncWithStorage(this.httpClient, url);
                if (json == null || json == undefined) {
                    return;
                }
                var div = document.createElement("div");
                div.className = ProgrammerWidget.widgetClass;
                element.appendChild(div);
                element = div;
                this.setHead(element, json);
                this.setList(element, json);
                var repoUrl = "https://api.github.com/users/" + json["login"] + "/repos?sort=updated&direction=desc";
                var repoItems = yield this.getAsyncWithStorage(this.httpClient, repoUrl);
                if (repoItems == null || repoItems == undefined) {
                    return;
                }
                var langCountMap = new Map();
                for (var i = 0; i < repoItems.length && i < 10; i++) {
                    var langUrl = "https://api.github.com/repos/" + repoItems[i]["full_name"] + "/languages";
                    var langItems = yield this.getAsyncWithStorage(this.httpClient, langUrl);
                    if (langItems == null || langItems == undefined) {
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
                this.setLang(element, langCountArray);
            });
        }
        setHead(element, json) {
            element.addDiv((div) => {
                div.className = "programmer-widget-image-container";
                div.addA((a) => {
                    a.href = json["html_url"];
                    a.addImg((img) => {
                        img.className = "programmer-widget-image";
                        img.src = json["avatar_url"];
                    });
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
        setLang(element, langCountArray) {
            element.addP((p) => __awaiter(this, void 0, void 0, function* () {
                p.className = "programmer-widget-paragraph-github";
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
    ProgrammerWidget.GithubWidget = GithubWidget;
})(ProgrammerWidget || (ProgrammerWidget = {}));
/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
/// <reference path="./Widget.ts" />
/// <reference path="./ElementExtensions.ts" />
var ProgrammerWidget;
(function (ProgrammerWidget) {
    class QiitaWidget extends ProgrammerWidget.Widget {
        constructor(...args) {
            super(...args);
            this.httpClient = new ProgrammerWidget.HttpClient();
        }
        set(element) {
            return __awaiter(this, void 0, void 0, function* () {
                var user = element.getAttribute(ProgrammerWidget.userNameAttribute);
                if (user == null || user == undefined) {
                    return;
                }
                var url = "https://qiita.com/api/v1/users/" + user;
                var json = yield this.getAsyncWithStorage(this.httpClient, url);
                if (json == null || json == undefined) {
                    return;
                }
                var div = document.createElement("div");
                div.className = ProgrammerWidget.widgetClass;
                element.appendChild(div);
                element = div;
                this.setHead(element, json);
                this.setList(element, json);
                var tagsUrl = "https://qiita.com/api/v1/users/" + json["url_name"] + "/items";
                var tagsItems = yield this.getAsyncWithStorage(this.httpClient, tagsUrl);
                if (tagsItems == null || tagsItems == undefined) {
                    return;
                }
                var tagsCountMap = new Map();
                for (var i = 0; i < tagsItems.length; i++) {
                    var item = tagsItems[i];
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
                this.setTags(element, tagsCountArray);
            });
        }
        setHead(element, json) {
            element.addDiv((div) => {
                div.className = "programmer-widget-image-container";
                div.addA((a) => {
                    a.href = json["url"];
                    a.addImg((img) => {
                        img.className = "programmer-widget-image";
                        img.src = json["profile_image_url"];
                    });
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
        setTags(element, tagsCountArray) {
            element.addP((p) => __awaiter(this, void 0, void 0, function* () {
                p.className = "programmer-widget-paragraph-qiita";
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
    ProgrammerWidget.QiitaWidget = QiitaWidget;
})(ProgrammerWidget || (ProgrammerWidget = {}));
/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
/// <reference path="./Widget.ts" />
/// <reference path="./ElementExtensions.ts" />
var ProgrammerWidget;
(function (ProgrammerWidget) {
    class TeratailWidget extends ProgrammerWidget.Widget {
        constructor(...args) {
            super(...args);
            this.httpClient = new ProgrammerWidget.HttpClient();
        }
        set(element) {
            return __awaiter(this, void 0, void 0, function* () {
                var user = element.getAttribute(ProgrammerWidget.userNameAttribute);
                if (user == null || user == undefined) {
                    return;
                }
                var url = "https://teratail.com/api/v1/users/" + user;
                var json = yield this.getAsyncWithStorage(this.httpClient, url);
                if (json == null || json == undefined) {
                    return;
                }
                var div = document.createElement("div");
                div.className = ProgrammerWidget.widgetClass;
                element.appendChild(div);
                element = div;
                this.setHead(element, json);
                this.setRank(element, json);
                var followingUrl = "https://teratail.com/api/v1/users/" + json["user"]["display_name"] + "/followings";
                var followingItems = yield this.getAsyncWithStorage(this.httpClient, followingUrl);
                var following = followingItems != null && followingItems != undefined ? followingItems["meta"]["hit_num"] : "?";
                var followerUrl = "https://teratail.com/api/v1/users/" + json["user"]["display_name"] + "/followers";
                var followerItems = yield this.getAsyncWithStorage(this.httpClient, followerUrl);
                var follower = followerItems != null && followerItems != undefined ? followerItems["meta"]["hit_num"] : "?";
                var answerUrl = "https://teratail.com/api/v1/users/" + json["user"]["display_name"] + "/replies";
                var answerItems = yield this.getAsyncWithStorage(this.httpClient, answerUrl);
                var answer = answerItems != null && answerItems != undefined ? answerItems["meta"]["hit_num"] : "?";
                this.setList(element, json, following, follower, answer);
            });
        }
        setHead(element, json) {
            element.addDiv((div) => {
                div.className = "programmer-widget-image-container";
                div.addA((a) => {
                    a.href = "https://teratail.com/users/" + json["user"]["display_name"];
                    a.addImg((img) => {
                        img.className = "programmer-widget-image";
                        img.src = json["user"]["photo"];
                    });
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
        setList(element, json, following, follower, answer) {
            element.addDiv((container) => {
                container.className = "programmer-widget-list-container";
                container.addDiv((div) => {
                    div.addDiv((divNumber) => __awaiter(this, void 0, void 0, function* () {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.innerHTML = following;
                    }));
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Following";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv((divNumber) => __awaiter(this, void 0, void 0, function* () {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.innerHTML = follower;
                    }));
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Followers";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv((divNumber) => __awaiter(this, void 0, void 0, function* () {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.innerHTML = answer;
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
    ProgrammerWidget.TeratailWidget = TeratailWidget;
})(ProgrammerWidget || (ProgrammerWidget = {}));
/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
/// <reference path="./Widget.ts" />
/// <reference path="./ElementExtensions.ts" />
/// <reference path="./QiitaWidget.ts" />
/// <reference path="./TeratailWidget.ts" />
/// <reference path="./GithubWidget.ts" />
window.onload = () => {
    {
        var qiitaElements = document.getElementsByClassName(ProgrammerWidget.qiitaClass);
        if (qiitaElements.length > 0) {
            var qiita = new ProgrammerWidget.QiitaWidget();
            for (var i = 0; i < qiitaElements.length; i++) {
                var element = qiitaElements[i];
                qiita.set(element);
            }
        }
    }
    {
        var teratailElements = document.getElementsByClassName(ProgrammerWidget.teratailClass);
        if (teratailElements.length > 0) {
            var teratail = new ProgrammerWidget.TeratailWidget();
            for (var i = 0; i < teratailElements.length; i++) {
                var element = teratailElements[i];
                teratail.set(element);
            }
        }
    }
    {
        var githubElements = document.getElementsByClassName(ProgrammerWidget.githubClass);
        if (githubElements.length > 0) {
            var github = new ProgrammerWidget.GithubWidget();
            for (var i = 0; i < githubElements.length; i++) {
                var element = githubElements[i];
                github.set(element);
            }
        }
    }
};
//# sourceMappingURL=ProgrammerWidget.js.map