/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
/// <reference path="./Widget.ts" />
/// <reference path="./ElementExtensions.ts" />

namespace ProgrammerWidget {

    export class GithubWidget extends Widget {
        httpClient = new HttpClient();

        async set(element: Element) {
            var user = element.getAttribute(userNameAttribute);
            if (user == null || user == undefined) {
                return;
            }
            var url = "https://api.github.com/users/" + user;
            var json = await this.getAsyncWithStorage(this.httpClient, url);
            if (json == null || json == undefined) {
                return;
            }

            var div = document.createElement("div");
            div.className = widgetClass;
            element.appendChild(div);
            element = div;

            this.setHead(element, json);
            this.setList(element, json);

            var repoUrl = "https://api.github.com/users/" + json["login"] + "/repos?sort=updated&direction=desc";
            var repoItems = await this.getAsyncWithStorage(this.httpClient, repoUrl);
            if (repoItems == null || repoItems == undefined) {
                return;
            }
            var langCountMap = new Map<string, number>();
            for (var i = 0; i < repoItems.length && i < 10; i++) {
                var langUrl = "https://api.github.com/repos/" + repoItems[i]["full_name"] + "/languages";
                var langItems = await this.getAsyncWithStorage(this.httpClient, langUrl);
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
        }

        setHead(element: Element, json: any) {
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

        setLang(element: Element, langCountArray: any) {
            element.addP(async (p) => {
                p.className = "programmer-widget-paragraph-github";
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
}