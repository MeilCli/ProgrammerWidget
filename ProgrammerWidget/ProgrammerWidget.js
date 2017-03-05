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
    ProgrammerWidget.listHeightAttribute = "target-list-height";
    ProgrammerWidget.qiitaClass = "programmer-widget-qiita";
    ProgrammerWidget.qiitaWithItemsClass = "programmer-widget-qiita-with-items";
    ProgrammerWidget.teratailClass = "programmer-widget-teratail";
    ProgrammerWidget.teratailWithAnswerClass = "programmer-widget-teratail-with-answer";
    ProgrammerWidget.githubClass = "programmer-widget-github";
    ProgrammerWidget.githubWithActivityClass = "programmer-widget-github-with-activity";
    ProgrammerWidget.widgetClass = "programmer-widget";
    ProgrammerWidget.storageItemKey = "programmer-widget-storage-item: ";
    ProgrammerWidget.storageTimeKey = "programmer-widget-storage-time: ";
    ProgrammerWidget.second = 1000;
    ProgrammerWidget.minute = ProgrammerWidget.second * 60;
    ProgrammerWidget.hour = ProgrammerWidget.minute * 60;
    ProgrammerWidget.day = ProgrammerWidget.hour * 24;
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
                return new Promise(resolve => {
                    var http = new XMLHttpRequest();
                    http.open("GET", request.url);
                    http.onload = e => {
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
        user(element) {
            this.set(element, false);
        }
        userWithActivity(element) {
            this.set(element, true);
        }
        set(element, containsActivity) {
            return __awaiter(this, void 0, void 0, function* () {
                var user = element.getAttribute(ProgrammerWidget.userNameAttribute);
                var listHeight = element.getAttribute(ProgrammerWidget.listHeightAttribute);
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
                if (containsActivity) {
                    var activityUrl = `https://api.github.com/users/${githubUser.login}/events/public`;
                    var activityItems = yield this.getAsyncWithStorage(this.httpClient, activityUrl);
                    if (activityItems != null && activityItems != undefined) {
                        this.setItems(element, listHeight, activityItems);
                    }
                }
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
            element.addDiv(div => {
                div.className = "programmer-widget-head-container";
                div.addP(p => {
                    p.className = "programmer-widget-logo";
                    p.innerText = "Github";
                });
                div.addA(a => {
                    a.className = "programmer-widget-follow";
                    a.href = githubUser.html_url;
                    a.innerText = `View on Github`;
                });
            });
        }
        setContent(element, githubUser) {
            element.addH2(h2 => {
                h2.className = "programmer-widget-heading";
                h2.innerText = githubUser.name;
            });
            element.addDiv(div => {
                div.className = "programmer-widget-image-container";
                div.addImg(img => {
                    img.className = "programmer-widget-image";
                    img.src = githubUser.avatar_url;
                });
            });
        }
        setLang(element, langSizeArray) {
            element.addP(p => {
                p.className = "programmer-widget-paragraph-github";
                p.innerText = langSizeArray.slice(0, 3).map((lang, index, array) => lang.name).join(", ");
            });
        }
        setList(element, githubUser) {
            element.addDiv(container => {
                container.className = "programmer-widget-list-container";
                container.addDiv(div => {
                    div.addDiv(divNumber => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA(a => {
                            a.href = `${githubUser.html_url}?tab=following`;
                            a.text = githubUser.following.toString();
                        });
                    });
                    div.addDiv(divTitle => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Following";
                    });
                });
                container.addDiv(div => {
                    div.addDiv(divNumber => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA(a => {
                            a.href = `${githubUser.html_url}?tab=followers`;
                            a.text = githubUser.followers.toString();
                        });
                    });
                    div.addDiv(divTitle => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Followers";
                    });
                });
                container.addDiv(div => {
                    div.addDiv(divNumber => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA(a => {
                            a.href = `${githubUser.html_url}?tab=repositories`;
                            a.text = githubUser.public_repos.toString();
                        });
                    });
                    div.addDiv(divTitle => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Repositories";
                    });
                });
                container.addDiv(div => {
                    div.addDiv(divNumber => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA(a => {
                            a.href = `https://gist.github.com/${githubUser.login}`;
                            a.text = githubUser.public_gists.toString();
                        });
                    });
                    div.addDiv(divTitle => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Gits";
                    });
                });
            });
        }
        setItems(element, listHeight, items) {
            element.addDiv(container => {
                container.className = "programmer-widget-github-items-container";
                if (listHeight != null && listHeight != undefined) {
                    container.style.height = listHeight;
                }
                var addHr = i => {
                    if (i != 0) {
                        container.appendChild(document.createElement("hr"));
                    }
                };
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    container.addDiv(panel => {
                        panel.className = "programmer-widget-github-items-panel";
                        if (item.type == "CommitCommentEvent") {
                            addHr(i);
                            this.setCommitCommentEvent(panel, item);
                        }
                        if (item.type == "CreateEvent") {
                            addHr(i);
                            this.setCreateEvent(panel, item);
                        }
                        if (item.type == "DeleteEvent") {
                            addHr(i);
                            this.setDeleteEvent(panel, item);
                        }
                        if (item.type == "ForkEvent") {
                            addHr(i);
                            this.setForkEvent(panel, item);
                        }
                        if (item.type == "GollumEvent") {
                            addHr(i);
                            this.setGollumEvent(panel, item);
                        }
                        if (item.type == "IssueCommentEvent") {
                            addHr(i);
                            this.setIssueCommentEvent(panel, item);
                        }
                        if (item.type == "IssuesEvent") {
                            addHr(i);
                            this.setIssuesEvent(panel, item);
                        }
                        if (item.type == "PublicEvent") {
                            addHr(i);
                            this.setPublicEvent(panel, item);
                        }
                        if (item.type == "PullRequestEvent") {
                            addHr(i);
                            this.setPullRequestEvent(panel, item);
                        }
                        if (item.type == "PullRequestReviewEvent") {
                            addHr(i);
                            this.setPullRequestReviewEvent(panel, item);
                        }
                        if (item.type == "PullRequestReviewCommentEvent") {
                            addHr(i);
                            this.setPullRequestReviewCommentEvent(panel, item);
                        }
                        if (item.type == "PushEvent") {
                            addHr(i);
                            this.setPushEvent(panel, item);
                        }
                        if (item.type == "ReleaseEvent") {
                            addHr(i);
                            this.setReleaseEvent(panel, item);
                        }
                        if (item.type == "WatchEvent") {
                            addHr(i);
                            this.setWatchEvent(panel, item);
                        }
                    });
                }
            });
        }
        setCommitCommentEvent(element, item) {
            element.addDiv(div => {
                div.addDiv(divImage => {
                    divImage.className = "programmer-widget-github-items-image";
                    divImage.innerHTML = `<span class="octicon octicon-comment-discussion"></span>`;
                });
            });
            element.addDiv(div => {
                div.addP(p => {
                    p.className = "programmer-widget-github-items-head";
                    p.innerText = this.toString(new Date(item.created_at));
                });
                div.addP(p => {
                    p.className = "programmer-widget-github-items-title";
                    p.innerHTML = `<a href="https://github.com/${item.actor.login}">${item.actor.login}</a>` +
                        ` commented on commit <a href="${item.payload.comment.html_url}">${item.repo.name}@${item.payload.comment.commit_id.substring(0, 6)}</a>`;
                });
                div.addUl(ul => {
                    ul.className = "programmer-widget-github-items-list";
                    ul.addLi(li => {
                        li.innerHTML = `<img src="${item.actor.avatar_url}"></img>` +
                            ` ${this.toTitle(item.payload.comment.body)}`;
                    });
                });
            });
        }
        setCreateEvent(element, item) {
            element.addDiv(div => {
                div.addDiv(divImage => {
                    divImage.className = "programmer-widget-github-items-image";
                    var imgClass = "";
                    if (item.payload.ref_type == "repository") {
                        imgClass = "octicon-repo";
                    }
                    if (item.payload.ref_type == "branch") {
                        imgClass = "octicon-git-branch";
                    }
                    if (item.payload.ref_type == "tag") {
                        imgClass = "octicon-tag";
                    }
                    divImage.innerHTML = `<span class="octicon ${imgClass}"></span>`;
                });
            });
            element.addDiv(div => {
                div.addP(p => {
                    p.className = "programmer-widget-github-items-head";
                    p.innerText = this.toString(new Date(item.created_at));
                });
                div.addP(p => {
                    p.className = "programmer-widget-github-items-title";
                    var html = `<a href="https://github.com/${item.actor.login}">${item.actor.login}</a>`;
                    html += ` created ${item.payload.ref_type}`;
                    if (item.payload.ref != null && item.payload.ref != undefined) {
                        html += ` <a href="https://github.com/${item.repo.name}/tree/${item.payload.ref}">${item.payload.ref}</a> at`;
                    }
                    html += ` <a href="https://github.com/${item.repo.name}">${item.repo.name.replace("/", "/<wbr/>")}</a>`;
                    p.innerHTML = html;
                });
            });
        }
        setDeleteEvent(element, item) {
            element.addDiv(div => {
                div.addDiv(divImage => {
                    divImage.className = "programmer-widget-github-items-image";
                    var imgClass = "";
                    if (item.payload.ref_type == "repository") {
                        imgClass = "octicon-repo";
                    }
                    if (item.payload.ref_type == "branch") {
                        imgClass = "octicon-git-branch";
                    }
                    if (item.payload.ref_type == "tag") {
                        imgClass = "octicon-tag";
                    }
                    divImage.innerHTML = `<span class="octicon ${imgClass}"></span>`;
                });
            });
            element.addDiv(div => {
                div.addP(p => {
                    p.className = "programmer-widget-github-items-head";
                    p.innerText = this.toString(new Date(item.created_at));
                });
                div.addP(p => {
                    p.className = "programmer-widget-github-items-title";
                    var html = `<a href="https://github.com/${item.actor.login}">${item.actor.login}</a>`;
                    html += ` deleted ${item.payload.ref_type}`;
                    if (item.payload.ref != null && item.payload.ref != undefined) {
                        html += ` <a href="https://github.com/${item.repo.name}/tree/${item.payload.ref}">${item.payload.ref}</a> at`;
                    }
                    html += ` <a href="https://github.com/${item.repo.name}">${item.repo.name.replace("/", "/<wbr/>")}</a>`;
                    p.innerHTML = html;
                });
            });
        }
        setForkEvent(element, item) {
            element.addDiv(div => {
                div.addDiv(divImage => {
                    divImage.className = "programmer-widget-github-items-image";
                    divImage.innerHTML = `<span class="octicon octicon-repo-forked"></span>`;
                });
            });
            element.addDiv(div => {
                div.addP(p => {
                    p.className = "programmer-widget-github-items-head";
                    p.innerText = this.toString(new Date(item.created_at));
                });
                div.addP(p => {
                    p.className = "programmer-widget-github-items-title";
                    p.innerHTML = `<a href="https://github.com/${item.actor.login}">${item.actor.login}</a>` +
                        ` forked <a href="https://github.com/${item.repo.name}">${item.repo.name.replace("/", "/<wbr/>")}</a>` +
                        ` to <a href="https://github.com/${item.payload.forkee.full_name}">${item.payload.forkee.full_name.replace("/", "/<wbr/>")}</a>`;
                });
            });
        }
        setGollumEvent(element, item) {
            element.addDiv(div => {
                div.addDiv(divImage => {
                    divImage.className = "programmer-widget-github-items-image";
                    divImage.innerHTML = `<span class="octicon octicon-book"></span>`;
                });
            });
            element.addDiv(div => {
                div.addP(p => {
                    p.className = "programmer-widget-github-items-head";
                    p.innerText = this.toString(new Date(item.created_at));
                });
                div.addP(p => {
                    p.className = "programmer-widget-github-items-title";
                    p.innerHTML = `<a href="https://github.com/${item.actor.login}">${item.actor.login}</a>` +
                        ` updated wiki at <a href="https://github.com/${item.repo.name}">${item.repo.name.replace("/", "/<wbr/>")}</a>`;
                });
                div.addUl(ul => {
                    ul.className = "programmer-widget-github-items-list";
                    for (var j = 0; j < item.payload.pages.length; j++) {
                        var page = item.payload.pages[j];
                        ul.addLi(li => {
                            var imgClass = "";
                            if (page.action == "created") {
                                imgClass = "octicon-plus";
                            }
                            if (page.action == "edited") {
                                imgClass = "octicon-pencil";
                            }
                            li.innerHTML = `<span class="octicon ${imgClass}"></span>` +
                                ` <a href="${page.html_url}">${page.sha.substring(0, 6)}</a>` +
                                ` ${page.title}`;
                        });
                    }
                });
            });
        }
        setIssueCommentEvent(element, item) {
            element.addDiv(div => {
                div.addDiv(divImage => {
                    divImage.className = "programmer-widget-github-items-image";
                    divImage.innerHTML = `<span class="octicon octicon-comment-discussion"></span>`;
                });
            });
            element.addDiv(div => {
                div.addP(p => {
                    p.className = "programmer-widget-github-items-head";
                    p.innerText = this.toString(new Date(item.created_at));
                });
                div.addP(p => {
                    p.className = "programmer-widget-github-items-title";
                    p.innerHTML = `<a href="https://github.com/${item.actor.login}">${item.actor.login}</a>` +
                        ` ${item.payload.action} comment on ${item.payload.issue.pull_request == undefined ? "issue" : "pull request"}` +
                        ` <a href="${item.payload.issue.html_url}">${item.repo.name}#${item.payload.issue.number}</a>`;
                });
                div.addUl(ul => {
                    ul.className = "programmer-widget-github-items-list";
                    ul.addLi(li => {
                        li.innerHTML = `<img src="${item.actor.avatar_url}"></img>` +
                            ` ${this.toTitle(item.payload.comment.body)}`;
                    });
                });
            });
        }
        setIssuesEvent(element, item) {
            element.addDiv(div => {
                div.addDiv(divImage => {
                    var imgClass = "octicon-info";
                    if (item.payload.action == "opened") {
                        imgClass = "octicon-issue-opened";
                    }
                    if (item.payload.action == "closed") {
                        imgClass = "octicon-issue-closed";
                    }
                    if (item.payload.action == "reopened") {
                        imgClass = "octicon-issue-reopened";
                    }
                    divImage.className = "programmer-widget-github-items-image";
                    divImage.innerHTML = `<span class="octicon ${imgClass}"></span>`;
                });
            });
            element.addDiv(div => {
                div.addP(p => {
                    p.className = "programmer-widget-github-items-head";
                    p.innerText = this.toString(new Date(item.created_at));
                });
                div.addP(p => {
                    p.className = "programmer-widget-github-items-title";
                    p.innerHTML = `<a href="https://github.com/${item.actor.login}">${item.actor.login}</a>` +
                        ` ${item.payload.action} issue` +
                        ` <a href="${item.payload.issue.html_url}">${item.repo.name}#${item.payload.issue.number}</a>`;
                });
                div.addUl(ul => {
                    ul.className = "programmer-widget-github-items-list";
                    ul.addLi(li => {
                        li.innerHTML = `<img src="${item.actor.avatar_url}"></img>` +
                            ` ${item.payload.issue.title}`;
                    });
                });
            });
        }
        setPublicEvent(element, item) {
            element.addDiv(div => {
                div.addDiv(divImage => {
                    divImage.className = "programmer-widget-github-items-image";
                    divImage.innerHTML = `<span class="octicon octicon-repo"></span>`;
                });
            });
            element.addDiv(div => {
                div.addP(p => {
                    p.className = "programmer-widget-github-items-head";
                    p.innerText = this.toString(new Date(item.created_at));
                });
                div.addP(p => {
                    p.className = "programmer-widget-github-items-title";
                    p.innerHTML = `<a href="https://github.com/${item.actor.login}">${item.actor.login}</a>` +
                        ` made <a href="https://github.com/${item.repo.name}">${item.repo.name.replace("/", "/<wbr/>")}</a> public`;
                });
            });
        }
        setPullRequestEvent(element, item) {
            element.addDiv(div => {
                div.addDiv(divImage => {
                    divImage.className = "programmer-widget-github-items-image";
                    divImage.innerHTML = `<span class="octicon octicon-git-pull-request"></span>`;
                });
            });
            element.addDiv(div => {
                div.addP(p => {
                    p.className = "programmer-widget-github-items-head";
                    p.innerText = this.toString(new Date(item.created_at));
                });
                div.addP(p => {
                    p.className = "programmer-widget-github-items-title";
                    p.innerHTML = `<a href="https://github.com/${item.actor.login}">${item.actor.login}</a>` +
                        ` ${item.payload.action} pull request` +
                        ` <a href="${item.payload.pull_request.html_url}">${item.repo.name}#${item.payload.pull_request.number}</a>`;
                });
                div.addUl(ul => {
                    ul.className = "programmer-widget-github-items-list";
                    ul.addLi(li => {
                        li.innerHTML = `<img src="${item.actor.avatar_url}"></img>` +
                            ` ${item.payload.pull_request.title}`;
                    });
                });
            });
        }
        setPullRequestReviewEvent(element, item) {
            element.addDiv(div => {
                div.addDiv(divImage => {
                    divImage.className = "programmer-widget-github-items-image";
                    divImage.innerHTML = `<span class="octicon octicon-comment-discussion"></span>`;
                });
            });
            element.addDiv(div => {
                div.addP(p => {
                    p.className = "programmer-widget-github-items-head";
                    p.innerText = this.toString(new Date(item.created_at));
                });
                div.addP(p => {
                    p.className = "programmer-widget-github-items-title";
                    p.innerHTML = `<a href="https://github.com/${item.actor.login}">${item.actor.login}</a>` +
                        ` created review on pull request` +
                        ` <a href="${item.payload.pull_request.html_url}">${item.repo.name}#${item.payload.pull_request.number}</a>`;
                });
                div.addUl(ul => {
                    ul.className = "programmer-widget-github-items-list";
                    ul.addLi(li => {
                        li.innerHTML = `<img src="${item.actor.avatar_url}"></img>` +
                            ` ${this.toTitle(item.payload.review.body)}`;
                    });
                });
            });
        }
        setPullRequestReviewCommentEvent(element, item) {
            element.addDiv(div => {
                div.addDiv(divImage => {
                    divImage.className = "programmer-widget-github-items-image";
                    divImage.innerHTML = `<span class="octicon octicon-comment-discussion"></span>`;
                });
            });
            element.addDiv(div => {
                div.addP(p => {
                    p.className = "programmer-widget-github-items-head";
                    p.innerText = this.toString(new Date(item.created_at));
                });
                div.addP(p => {
                    p.className = "programmer-widget-github-items-title";
                    p.innerHTML = `<a href="https://github.com/${item.actor.login}">${item.actor.login}</a>` +
                        ` commented review on pull request` +
                        ` <a href="${item.payload.pull_request.html_url}">${item.repo.name}#${item.payload.pull_request.number}</a>`;
                });
                div.addUl(ul => {
                    ul.className = "programmer-widget-github-items-list";
                    ul.addLi(li => {
                        li.innerHTML = `<img src="${item.actor.avatar_url}"></img>` +
                            ` ${this.toTitle(item.payload.review.body)}`;
                    });
                });
            });
        }
        setPushEvent(element, item) {
            element.addDiv(div => {
                div.addDiv(divImage => {
                    divImage.className = "programmer-widget-github-items-image";
                    divImage.innerHTML = `<span class="octicon octicon-repo-push"></span>`;
                });
            });
            element.addDiv(div => {
                div.addP(p => {
                    p.className = "programmer-widget-github-items-head";
                    p.innerText = this.toString(new Date(item.created_at));
                });
                div.addP(p => {
                    p.className = "programmer-widget-github-items-title";
                    var branch = item.payload.ref.substring(item.payload.ref.lastIndexOf("/") + 1, item.payload.ref.length);
                    p.innerHTML = `<a href="https://github.com/${item.actor.login}">${item.actor.login}</a>` +
                        ` pushed to <a href="https://github.com/${item.repo.name}/tree/${branch}">${branch}</a>` +
                        ` at <a href="https://github.com/${item.repo.name}">${item.repo.name.replace("/", "/<wbr/>")}</a>`;
                });
                div.addUl(ul => {
                    ul.className = "programmer-widget-github-items-list";
                    for (var j = 0; j < item.payload.commits.length; j++) {
                        var commit = item.payload.commits[j];
                        ul.addLi(li => {
                            li.innerHTML = `<span class="octicon octicon-git-commit"></span>` +
                                ` <a href="https://github.com/${item.repo.name}/commit/${commit.sha}">${commit.sha.substring(0, 6)}</a>` +
                                ` ${commit.message}`;
                        });
                    }
                });
            });
        }
        setReleaseEvent(element, item) {
            element.addDiv(div => {
                div.addDiv(divImage => {
                    divImage.className = "programmer-widget-github-items-image";
                    divImage.innerHTML = `<span class="octicon octicon-tag"></span>`;
                });
            });
            element.addDiv(div => {
                div.addP(p => {
                    p.className = "programmer-widget-github-items-head";
                    p.innerText = this.toString(new Date(item.created_at));
                });
                div.addP(p => {
                    p.className = "programmer-widget-github-items-title";
                    p.innerHTML = `<a href="https://github.com/${item.actor.login}">${item.actor.login}</a>` +
                        ` released <a href="${item.payload.release.html_url}">${item.payload.release.tag_name}</a>` +
                        ` at <a href="https://github.com/${item.repo.name}">${item.repo.name.replace("/", "/<wbr/>")}</a>`;
                });
                div.addUl(ul => {
                    ul.className = "programmer-widget-github-items-list";
                    for (var j = 0; j < item.payload.release.assets.length; j++) {
                        var asset = item.payload.release.assets[j];
                        ul.addLi(li => {
                            li.innerHTML = `<span class="octicon octicon-cloud-download"></span>` +
                                ` <a href="${asset.browser_download_url}">Download ${asset.name}</a>`;
                        });
                    }
                    ul.addLi(li => {
                        li.innerHTML = `<span class="octicon octicon-cloud-download"></span>` +
                            ` <a href="${item.payload.release.zipball_url}">Download Source Code (zip)</a>`;
                    });
                });
            });
        }
        setWatchEvent(element, item) {
            element.addDiv(div => {
                div.addDiv(divImage => {
                    divImage.className = "programmer-widget-github-items-image";
                    divImage.innerHTML = `<span class="octicon octicon-star"></span>`;
                });
            });
            element.addDiv(div => {
                div.addP(p => {
                    p.className = "programmer-widget-github-items-head";
                    p.innerText = this.toString(new Date(item.created_at));
                });
                div.addP(p => {
                    p.className = "programmer-widget-github-items-title";
                    p.innerHTML = `<a href="https://github.com/${item.actor.login}">${item.actor.login}</a>` +
                        ` starred <a href="https://github.com/${item.repo.name}">${item.repo.name.replace("/", "/<wbr/>")}</a>`;
                });
            });
        }
        toString(date) {
            var now = new Date();
            if (now.getTime() < date.getTime() + ProgrammerWidget.minute) {
                return "now";
            }
            if (now.getTime() < date.getTime() + ProgrammerWidget.hour) {
                var minutes = Math.floor((now.getTime() - date.getTime()) / ProgrammerWidget.minute);
                return `about ${minutes} ${minutes == 1 ? "minute" : "minutes"} ago`;
            }
            if (now.getTime() < date.getTime() + ProgrammerWidget.day) {
                var hours = Math.floor((now.getTime() - date.getTime()) / ProgrammerWidget.hour);
                return `about ${hours} ${hours == 1 ? "hour" : "hours"} ago`;
            }
            if (now.getTime() < date.getTime() + ProgrammerWidget.day * 28) {
                var days = Math.floor((now.getTime() - date.getTime()) / ProgrammerWidget.day);
                return `about ${days} ${days == 1 ? "day" : "days"} ago`;
            }
            return date.toLocaleDateString();
        }
        toTitle(body) {
            var title = body.replace("\r\n", " ");
            return title.substring(0, title.length > 140 ? 140 : title.length);
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
        user(element) {
            this.set(element, false);
        }
        userAndItems(element) {
            this.set(element, true);
        }
        set(element, containsItems) {
            return __awaiter(this, void 0, void 0, function* () {
                var user = element.getAttribute(ProgrammerWidget.userNameAttribute);
                var listHeight = element.getAttribute(ProgrammerWidget.listHeightAttribute);
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
                var itemsUrl = `https://qiita.com/api/v1/users/${qiitaUser.url_name}/items`;
                var qiitaItems = yield this.getAsyncWithStorage(this.httpClient, itemsUrl);
                if (qiitaItems == null || qiitaItems == undefined) {
                    return;
                }
                var tagsCountMap = new Map();
                for (var i = 0; i < qiitaItems.length; i++) {
                    var item = qiitaItems[i];
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
                if (containsItems) {
                    this.setItems(element, listHeight, qiitaItems);
                }
            });
        }
        setHead(element, qiitaUser) {
            element.addDiv(div => {
                div.className = "programmer-widget-head-container";
                div.addP(p => {
                    p.className = "programmer-widget-logo";
                    p.innerText = "Qiita";
                });
                div.addA(a => {
                    a.className = "programmer-widget-follow";
                    a.href = qiitaUser.url;
                    a.innerText = `View on Qiita`;
                });
            });
        }
        setContent(element, qiitaUser) {
            element.addH2(h2 => {
                h2.className = "programmer-widget-heading";
                h2.innerText = qiitaUser.name;
            });
            element.addDiv(div => {
                div.className = "programmer-widget-image-container";
                div.addImg(img => {
                    img.className = "programmer-widget-image";
                    img.src = qiitaUser.profile_image_url;
                });
            });
        }
        setTags(element, tagsCountArray) {
            element.addP(p => {
                p.className = "programmer-widget-paragraph-qiita";
                p.innerText = tagsCountArray.slice(0, 3).map((tag, index, array) => tag.name).join(", ");
            });
        }
        setList(element, qiitaUser) {
            element.addDiv(container => {
                container.className = "programmer-widget-list-container";
                container.addDiv(div => {
                    div.addDiv(divNumber => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA(a => {
                            a.href = `${qiitaUser.url}/following_users`;
                            a.text = qiitaUser.following_users.toString();
                        });
                    });
                    div.addDiv(divTitle => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Following";
                    });
                });
                container.addDiv(div => {
                    div.addDiv(divNumber => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA(a => {
                            a.href = `${qiitaUser.url}/followers`;
                            a.text = qiitaUser.followers.toString();
                        });
                    });
                    div.addDiv(divTitle => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Followers";
                    });
                });
                container.addDiv(div => {
                    div.addDiv(divNumber => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA(a => {
                            a.href = `${qiitaUser.url}/items`;
                            a.text = qiitaUser.items.toString();
                        });
                    });
                    div.addDiv(divTitle => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Items";
                    });
                });
                container.addDiv(div => {
                    div.addDiv(divNumber => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA(a => {
                            a.href = `${qiitaUser.url}/contributions`;
                            a.text = qiitaUser.contribution.toString();
                        });
                    });
                    div.addDiv(divTitle => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Contribution";
                    });
                });
            });
        }
        setItems(element, listHeight, items) {
            element.addDiv(container => {
                container.className = "programmer-widget-qiita-items-container";
                if (listHeight != null && listHeight != undefined) {
                    container.style.height = listHeight;
                }
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (i != 0) {
                        container.appendChild(document.createElement("hr"));
                    }
                    container.addDiv(panel => {
                        panel.className = "programmer-widget-qiita-items-panel";
                        panel.addDiv(div => {
                            div.addImg(img => {
                                img.className = "programmer-widget-qiita-items-image";
                                img.src = item.user.profile_image_url;
                            });
                        });
                        panel.addDiv(div => {
                            div.addP(p => {
                                p.className = "programmer-widget-qiita-items-head";
                                p.innerHTML = `<a href="http://qiita.com/${item.user.url_name}">${item.user.url_name}</a>が${item.created_at_in_words}前に投稿`;
                            });
                            div.addP(p => {
                                p.className = "programmer-widget-qiita-items-title";
                                p.addA(a => {
                                    a.href = item.url;
                                    a.text = item.title;
                                });
                            });
                            div.addUl(ul => {
                                ul.className = "programmer-widget-qiita-items-tags";
                                ul.addLi(li => {
                                    li.innerHTML = `<i class="fa fa-tags" aria-hidden="true"></i>`;
                                });
                                for (var j = 0; j < item.tags.length; j++) {
                                    var tag = item.tags[j];
                                    ul.addLi(li => {
                                        li.addA(a => {
                                            a.href = `http://qiita.com/tags/${tag.url_name}`;
                                            a.text = tag.name;
                                        });
                                    });
                                }
                            });
                        });
                        panel.addDiv(div => {
                            div.className = "programmer-widget-qiita-items-panel-last";
                            if (item.stock_count > 0) {
                                div.addP(p => {
                                    p.className = "programmer-widget-qiita-items-stock";
                                    p.innerHTML = `<i class="fa fa-folder-open-o" aria-hidden="true"></i> ${item.stock_count.toString()}`;
                                });
                            }
                            if (item.comment_count > 0) {
                                div.addP(p => {
                                    p.className = "programmer-widget-qiita-items-comment";
                                    p.innerHTML = `<i class="fa fa-comment-o" aria-hidden="true"></i> ${item.comment_count.toString()}`;
                                });
                            }
                        });
                    });
                }
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
        user(element) {
            this.set(element, false);
        }
        userWiteAnswer(element) {
            this.set(element, true);
        }
        set(element, containsAnswer) {
            return __awaiter(this, void 0, void 0, function* () {
                var user = element.getAttribute(ProgrammerWidget.userNameAttribute);
                var listHeight = element.getAttribute(ProgrammerWidget.listHeightAttribute);
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
                var answerUrl = `https://teratail.com/api/v1/users/${teratailUserResponse.user.display_name}/replies?limit=10`;
                var answerItems = yield this.getAsyncWithStorage(this.httpClient, answerUrl);
                var answer = answerItems != null && answerItems != undefined ? answerItems.meta.hit_num.toString() : "?";
                this.setList(element, teratailUserResponse, following, follower, answer);
                if (containsAnswer) {
                    var questionItems = new Array();
                    for (var i = 0; i < answerItems.replies.length && i < 10; i++) {
                        var questionUrl = `https://teratail.com/api/v1/questions/${answerItems.replies[i].question_id}`;
                        var questionItem = yield this.getAsyncWithStorage(this.httpClient, questionUrl);
                        if (questionItem == null || questionItem == undefined) {
                            break;
                        }
                        questionItems[i] = questionItem;
                    }
                    this.setItems(element, listHeight, teratailUserResponse, answerItems, questionItems);
                }
            });
        }
        setHead(element, teratailUserResponse) {
            element.addDiv(div => {
                div.className = "programmer-widget-head-container";
                div.addP(p => {
                    p.className = "programmer-widget-logo";
                    p.innerText = "Teratail";
                });
                div.addA(a => {
                    a.className = "programmer-widget-follow";
                    a.href = `https://teratail.com/users/${teratailUserResponse.user.display_name}`;
                    a.innerText = `View on Teratail`;
                });
            });
        }
        setContent(element, teratailUserResponse) {
            element.addH2(h2 => {
                h2.className = "programmer-widget-heading";
                h2.innerText = teratailUserResponse.user.display_name;
            });
            element.addDiv(div => {
                div.className = "programmer-widget-image-container";
                div.addImg(img => {
                    img.className = "programmer-widget-image";
                    img.src = teratailUserResponse.user.photo;
                });
            });
        }
        setRank(element, teratailUserResponse) {
            element.addUl(ul => {
                ul.className = "programmer-widget-paragraph-teratail-container";
                ul.addLi(li => {
                    li.className = "programmer-widget-paragraph-teratail-list1";
                    li.innerText = teratailUserResponse.user.score_ranking.total.rank.toString();
                });
                ul.addLi(li => {
                    li.className = "programmer-widget-paragraph-teratail-list2";
                    li.innerText = teratailUserResponse.user.score_ranking.weekly.rank.toString();
                });
            });
        }
        setList(element, teratailUserResponse, following, follower, answer) {
            element.addDiv(container => {
                container.className = "programmer-widget-list-container";
                container.addDiv(div => {
                    div.addDiv(divNumber => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA(a => {
                            a.href = `https://teratail.com/users/${teratailUserResponse.user.display_name}/connections`;
                            a.text = following;
                        });
                    });
                    div.addDiv(divTitle => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Following";
                    });
                });
                container.addDiv(div => {
                    div.addDiv(divNumber => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA(a => {
                            a.href = `https://teratail.com/users/${teratailUserResponse.user.display_name}/connections`;
                            a.text = follower;
                        });
                    });
                    div.addDiv(divTitle => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Followers";
                    });
                });
                container.addDiv(div => {
                    div.addDiv(divNumber => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA(a => {
                            a.href = `https://teratail.com/users/${teratailUserResponse.user.display_name}#reply`;
                            a.text = answer;
                        });
                    });
                    div.addDiv(divTitle => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Answer";
                    });
                });
                container.addDiv(div => {
                    div.addDiv(divNumber => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.addA(a => {
                            a.href = `https://teratail.com/users/${teratailUserResponse.user.display_name}#score`;
                            a.text = teratailUserResponse.user.score.toString();
                        });
                    });
                    div.addDiv(divTitle => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Score";
                    });
                });
            });
        }
        setItems(element, listHeight, userItem, answerItems, questionItems) {
            element.addDiv(container => {
                container.className = "programmer-widget-teratail-items-container";
                if (listHeight != null && listHeight != undefined) {
                    container.style.height = listHeight;
                }
                for (var i = 0; i < answerItems.replies.length && i < questionItems.length; i++) {
                    var answerItem = answerItems.replies[i];
                    var questionItem = questionItems[i];
                    if (i != 0) {
                        container.appendChild(document.createElement("hr"));
                    }
                    container.addDiv(panel => {
                        panel.className = "programmer-widget-teratail-items-panel";
                        panel.addDiv(div => {
                            div.addImg(img => {
                                img.className = "programmer-widget-teratail-items-image";
                                img.src = questionItem.question.user.photo;
                            });
                        });
                        panel.addDiv(div => {
                            div.addP(p => {
                                p.className = "programmer-widget-teratail-items-head";
                                var date = this.toString(new Date(new Date(answerItem.created.replace(" ", "T") + "Z").getTime() - ProgrammerWidget.hour * 9));
                                p.innerHTML = `<a href="https://teratail.com/users/${userItem.user.display_name}">${userItem.user.display_name}</a>が${date}に回答`;
                            });
                            div.addP(p => {
                                p.className = "programmer-widget-teratail-items-title";
                                p.addA(a => {
                                    a.href = `https://teratail.com/questions/${questionItem.question.id}`;
                                    a.text = questionItem.question.title;
                                });
                            });
                            div.addUl(ul => {
                                ul.className = "programmer-widget-teratail-items-tags";
                                ul.addLi(li => {
                                    li.innerHTML = `<i class="fa fa-tags" aria-hidden="true"></i>`;
                                });
                                for (var j = 0; j < questionItem.question.tags.length; j++) {
                                    var tag = questionItem.question.tags[j];
                                    ul.addLi(li => {
                                        li.addA(a => {
                                            a.href = `https://teratail.com/tags/${encodeURIComponent(tag)}`;
                                            a.text = tag;
                                        });
                                    });
                                }
                            });
                        });
                    });
                }
            });
        }
        toString(date) {
            var now = new Date();
            if (now.getTime() < date.getTime() + ProgrammerWidget.minute) {
                return "今";
            }
            if (now.getTime() < date.getTime() + ProgrammerWidget.hour) {
                var minutes = Math.floor((now.getTime() - date.getTime()) / ProgrammerWidget.minute);
                return `約${minutes}分前`;
            }
            if (now.getTime() < date.getTime() + ProgrammerWidget.day) {
                var hours = Math.floor((now.getTime() - date.getTime()) / ProgrammerWidget.hour);
                return `約${hours}時間前`;
            }
            if (now.getTime() < date.getTime() + ProgrammerWidget.day * 28) {
                var days = Math.floor((now.getTime() - date.getTime()) / ProgrammerWidget.day);
                return `約${days}日前`;
            }
            return date.toLocaleDateString();
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
        var qiita = new ProgrammerWidget.QiitaWidget();
        var qiitaElements = document.getElementsByClassName(ProgrammerWidget.qiitaClass);
        for (var i = 0; i < qiitaElements.length; i++) {
            var element = qiitaElements[i];
            qiita.user(element);
        }
        var qiitaWithItemsElements = document.getElementsByClassName(ProgrammerWidget.qiitaWithItemsClass);
        for (var i = 0; i < qiitaWithItemsElements.length; i++) {
            var element = qiitaWithItemsElements[i];
            qiita.userAndItems(element);
        }
    }
    {
        var teratail = new ProgrammerWidget.TeratailWidget();
        var teratailElements = document.getElementsByClassName(ProgrammerWidget.teratailClass);
        for (var i = 0; i < teratailElements.length; i++) {
            var element = teratailElements[i];
            teratail.user(element);
        }
        var teratailWithAnswerElements = document.getElementsByClassName(ProgrammerWidget.teratailWithAnswerClass);
        for (var i = 0; i < teratailWithAnswerElements.length; i++) {
            var element = teratailWithAnswerElements[i];
            teratail.userWiteAnswer(element);
        }
    }
    {
        var github = new ProgrammerWidget.GithubWidget();
        var githubElements = document.getElementsByClassName(ProgrammerWidget.githubClass);
        for (var i = 0; i < githubElements.length; i++) {
            var element = githubElements[i];
            github.user(element);
        }
        var githubWithActivityElements = document.getElementsByClassName(ProgrammerWidget.githubWithActivityClass);
        for (var i = 0; i < githubWithActivityElements.length; i++) {
            var element = githubWithActivityElements[i];
            github.userWithActivity(element);
        }
    }
});
//# sourceMappingURL=ProgrammerWidget.js.map