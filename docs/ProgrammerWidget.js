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
                var storagedTime = window.localStorage.getItem(`${ProgrammerWidget.storageTimeKey}${url}`);
                var storagedItem = window.localStorage.getItem(`${ProgrammerWidget.storageItemKey}${url}`);
                if (storagedItem != null && storagedItem != undefined && new Date(storagedTime).getTime() + ProgrammerWidget.hour > new Date().getTime()) {
                    return JSON.parse(storagedItem);
                }
                var httpRequest = new ProgrammerWidget.HttpRequest(url);
                var response = yield httpClient.getAsync(httpRequest);
                if (response.status != 200) {
                    return;
                }
                window.localStorage.setItem(`${ProgrammerWidget.storageItemKey}${url}`, response.content);
                window.localStorage.setItem(`${ProgrammerWidget.storageTimeKey}${url}`, new Date().toUTCString());
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
                var url = `https://api.github.com/users/${user}`;
                var githubUser = yield this.getAsyncWithStorage(this.httpClient, url);
                if (githubUser == null || githubUser == undefined) {
                    return;
                }
                var div = document.createElement("div");
                div.className = ProgrammerWidget.widgetClass;
                element.appendChild(div);
                element = div;
                this.setHead(element, githubUser);
                this.setContent(element, githubUser);
                this.setList(element, githubUser);
                var repoUrl = `https://api.github.com/users/${githubUser.login}/repos?sort=updated&direction=desc`;
                var repoItems = yield this.getAsyncWithStorage(this.httpClient, repoUrl);
                if (repoItems == null || repoItems == undefined) {
                    return;
                }
                var langSizeMap = new Map();
                for (var i = 0; i < repoItems.length && i < 10; i++) {
                    var langUrl = `https://api.github.com/repos/${repoItems[i].full_name}/languages`;
                    var langItems = yield this.getAsyncWithStorage(this.httpClient, langUrl);
                    if (langItems == null || langItems == undefined) {
                        break;
                    }
                    for (var key in langItems) {
                        if (langSizeMap.has(key) == false) {
                            langSizeMap.set(key, 0);
                        }
                        langSizeMap.set(key, langSizeMap.get(key) + langItems[key]);
                    }
                }
                var langSizeArray = new Array();
                var langSizeIterator = langSizeMap.entries();
                for (var i = 0; i < langSizeMap.size; i++) {
                    var entry = langSizeIterator.next().value;
                    langSizeArray[i] = { name: entry[0], size: entry[1] };
                }
                langSizeArray.sort((a, b) => {
                    return a.size > b.size ? -1 : a.size < b.size ? 1 : 0;
                });
                this.setLang(element, langSizeArray);
            });
        }
        setHead(element, githubUser) {
            element.addDiv((div) => {
                div.className = "programmer-widget-head-container";
                div.addP((p) => {
                    p.className = "programmer-widget-logo";
                    p.innerText = "Github";
                });
                div.addA((a) => {
                    a.className = "programmer-widget-follow";
                    a.href = githubUser.html_url;
                    a.innerText = `Follow @${githubUser.login}`;
                });
            });
        }
        setContent(element, githubUser) {
            element.addH2((h2) => {
                h2.className = "programmer-widget-heading";
                h2.innerText = githubUser.name;
            });
            element.addDiv((div) => {
                div.className = "programmer-widget-image-container";
                div.addImg((img) => {
                    img.className = "programmer-widget-image";
                    img.src = githubUser.avatar_url;
                });
            });
        }
        setLang(element, langSizeArray) {
            element.addP((p) => {
                p.className = "programmer-widget-paragraph-github";
                p.innerText = langSizeArray.slice(0, 3).map((lang, index, array) => lang.name).join(", ");
            });
        }
        setList(element, githubUser) {
            element.addDiv((container) => {
                container.className = "programmer-widget-list-container";
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA((a) => {
                            a.href = `${githubUser.html_url}?tab=following`;
                            a.text = githubUser.following.toString();
                        });
                    });
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Following";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA((a) => {
                            a.href = `${githubUser.html_url}?tab=followers`;
                            a.text = githubUser.followers.toString();
                        });
                    });
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Followers";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA((a) => {
                            a.href = `${githubUser.html_url}?tab=repositories`;
                            a.text = githubUser.public_repos.toString();
                        });
                    });
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Repositories";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA((a) => {
                            a.href = `https://gist.github.com/${githubUser.login}`;
                            a.text = githubUser.public_gists.toString();
                        });
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
                var url = `https://qiita.com/api/v1/users/${user}`;
                var qiitaUser = yield this.getAsyncWithStorage(this.httpClient, url);
                if (qiitaUser == null || qiitaUser == undefined) {
                    return;
                }
                var div = document.createElement("div");
                div.className = ProgrammerWidget.widgetClass;
                element.appendChild(div);
                element = div;
                this.setHead(element, qiitaUser);
                this.setContent(element, qiitaUser);
                this.setList(element, qiitaUser);
                var tagsUrl = `https://qiita.com/api/v1/users/${qiitaUser.url_name}/items`;
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
        setHead(element, qiitaUser) {
            element.addDiv((div) => {
                div.className = "programmer-widget-head-container";
                div.addP((p) => {
                    p.className = "programmer-widget-logo";
                    p.innerText = "Qiita";
                });
                div.addA((a) => {
                    a.className = "programmer-widget-follow";
                    a.href = qiitaUser.url;
                    a.innerText = `Follow @${qiitaUser.url_name}`;
                });
            });
        }
        setContent(element, qiitaUser) {
            element.addH2((h2) => {
                h2.className = "programmer-widget-heading";
                h2.innerText = qiitaUser.name;
            });
            element.addDiv((div) => {
                div.className = "programmer-widget-image-container";
                div.addImg((img) => {
                    img.className = "programmer-widget-image";
                    img.src = qiitaUser.profile_image_url;
                });
            });
        }
        setTags(element, tagsCountArray) {
            element.addP((p) => {
                p.className = "programmer-widget-paragraph-qiita";
                p.innerText = tagsCountArray.slice(0, 3).map((tag, index, array) => tag.name).join(", ");
            });
        }
        setList(element, qiitaUser) {
            element.addDiv((container) => {
                container.className = "programmer-widget-list-container";
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA((a) => {
                            a.href = `${qiitaUser.url}/following_users`;
                            a.text = qiitaUser.following_users.toString();
                        });
                    });
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Following";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA((a) => {
                            a.href = `${qiitaUser.url}/followers`;
                            a.text = qiitaUser.followers.toString();
                        });
                    });
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Followers";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA((a) => {
                            a.href = `${qiitaUser.url}/items`;
                            a.text = qiitaUser.items.toString();
                        });
                    });
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Items";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA((a) => {
                            a.href = `${qiitaUser.url}/contributions`;
                            a.text = qiitaUser.contribution.toString();
                        });
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
                var url = `https://teratail.com/api/v1/users/${user}`;
                var teratailUserResponse = yield this.getAsyncWithStorage(this.httpClient, url);
                if (teratailUserResponse == null || teratailUserResponse == undefined) {
                    return;
                }
                var div = document.createElement("div");
                div.className = ProgrammerWidget.widgetClass;
                element.appendChild(div);
                element = div;
                this.setHead(element, teratailUserResponse);
                this.setContent(element, teratailUserResponse);
                this.setRank(element, teratailUserResponse);
                var followingUrl = `https://teratail.com/api/v1/users/${teratailUserResponse.user.display_name}/followings`;
                var followingItems = yield this.getAsyncWithStorage(this.httpClient, followingUrl);
                var following = followingItems != null && followingItems != undefined ? followingItems.meta.hit_num.toString() : "?";
                var followerUrl = `https://teratail.com/api/v1/users/${teratailUserResponse.user.display_name}/followers`;
                var followerItems = yield this.getAsyncWithStorage(this.httpClient, followerUrl);
                var follower = followerItems != null && followerItems != undefined ? followerItems.meta.hit_num.toString() : "?";
                var answerUrl = `https://teratail.com/api/v1/users/${teratailUserResponse.user.display_name}/replies`;
                var answerItems = yield this.getAsyncWithStorage(this.httpClient, answerUrl);
                var answer = answerItems != null && answerItems != undefined ? answerItems.meta.hit_num.toString() : "?";
                this.setList(element, teratailUserResponse, following, follower, answer);
            });
        }
        setHead(element, teratailUserResponse) {
            element.addDiv((div) => {
                div.className = "programmer-widget-head-container";
                div.addP((p) => {
                    p.className = "programmer-widget-logo";
                    p.innerText = "Teratail";
                });
                div.addA((a) => {
                    a.className = "programmer-widget-follow";
                    a.href = `https://teratail.com/users/${teratailUserResponse.user.display_name}`;
                    a.innerText = `Follow @${teratailUserResponse.user.display_name}`;
                });
            });
        }
        setContent(element, teratailUserResponse) {
            element.addH2((h2) => {
                h2.className = "programmer-widget-heading";
                h2.innerText = teratailUserResponse.user.display_name;
            });
            element.addDiv((div) => {
                div.className = "programmer-widget-image-container";
                div.addImg((img) => {
                    img.className = "programmer-widget-image";
                    img.src = teratailUserResponse.user.photo;
                });
            });
        }
        setRank(element, teratailUserResponse) {
            element.addUl((ul) => {
                ul.className = "programmer-widget-paragraph-teratail-container";
                ul.addLi((li) => {
                    li.className = "programmer-widget-paragraph-teratail-list1";
                    li.innerText = teratailUserResponse.user.score_ranking.total.rank.toString();
                });
                ul.addLi((li) => {
                    li.className = "programmer-widget-paragraph-teratail-list2";
                    li.innerText = teratailUserResponse.user.score_ranking.weekly.rank.toString();
                });
            });
        }
        setList(element, teratailUserResponse, following, follower, answer) {
            element.addDiv((container) => {
                container.className = "programmer-widget-list-container";
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA((a) => {
                            a.href = `https://teratail.com/users/${teratailUserResponse.user.display_name}/connections`;
                            a.text = following;
                        });
                    });
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Following";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA((a) => {
                            a.href = `https://teratail.com/users/${teratailUserResponse.user.display_name}/connections`;
                            a.text = follower;
                        });
                    });
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Followers";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA((a) => {
                            a.href = `https://teratail.com/users/${teratailUserResponse.user.display_name}#reply`;
                            a.text = answer;
                        });
                    });
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Answer";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA((a) => {
                            a.href = `https://teratail.com/users/${teratailUserResponse.user.display_name}#score`;
                            a.text = teratailUserResponse.user.score.toString();
                        });
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
window.addEventListener("load", () => {
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
});
//# sourceMappingURL=ProgrammerWidget.js.map