/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
/// <reference path="./Widget.ts" />
/// <reference path="./ElementExtensions.ts" />

namespace ProgrammerWidget {

    interface GithubUser {
        login: string;
        html_url: string;
        avatar_url: string;
        name: string;
        following: number;
        followers: number;
        public_repos: number;
        public_gists: number;
    }

    interface GithubRepository {
        full_name: string;
    }

    interface Lang {
        name: string;
        size: number;
    }

    export class GithubWidget extends Widget {
        httpClient = new HttpClient();

        async set(element: Element) {
            var user = element.getAttribute(userNameAttribute);
            if (user == null || user == undefined) {
                return;
            }
            var url = `https://api.github.com/users/${user}`;
            var githubUser: GithubUser = await this.getAsyncWithStorage(this.httpClient, url);
            if (githubUser == null || githubUser == undefined) {
                return;
            }

            var div = document.createElement("div");
            div.className = widgetClass;
            element.appendChild(div);
            element = div;

            this.setHead(element, githubUser);
            this.setList(element, githubUser);

            var repoUrl = `https://api.github.com/users/${githubUser.login}/repos?sort=updated&direction=desc`;
            var repoItems: Array<GithubRepository> = await this.getAsyncWithStorage(this.httpClient, repoUrl);
            if (repoItems == null || repoItems == undefined) {
                return;
            }
            var langSizeMap = new Map<string, number>();
            for (var i = 0; i < repoItems.length && i < 10; i++) {
                var langUrl = `https://api.github.com/repos/${repoItems[i].full_name}/languages`;
                var langItems = await this.getAsyncWithStorage(this.httpClient, langUrl);
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
            var langSizeArray = new Array<Lang>();
            var langSizeIterator = langSizeMap.entries();
            for (var i = 0; i < langSizeMap.size; i++) {
                var entry = langSizeIterator.next().value;
                langSizeArray[i] = { name: entry[0], size: entry[1] };
            }
            langSizeArray.sort((a, b) => {
                return a.size > b.size ? -1 : a.size < b.size ? 1 : 0;
            });

            this.setLang(element, langSizeArray);
        }

        setHead(element: Element, githubUser: GithubUser) {
            element.addDiv((div) => {
                div.className = "programmer-widget-image-container";
                div.addA((a) => {
                    a.href = githubUser.html_url;
                    a.addImg((img) => {
                        img.className = "programmer-widget-image";
                        img.src = githubUser.avatar_url;
                    });
                });
            });
            element.addH2((h2) => {
                h2.className = "programmer-widget-heading";
                h2.addA((a) => {
                    a.href = githubUser.html_url;
                    a.text = githubUser.name;
                });
            });
            element.addH2((h2) => {
                h2.className = "programmer-widget-logo";
                h2.innerText = "Github";
            });
        }

        setLang(element: Element, langSizeArray: Array<Lang>) {
            element.addP((p) => {
                p.className = "programmer-widget-paragraph-github";
                p.innerText = langSizeArray.slice(0, 3).map((lang, index, array) => lang.name).join(", ");
            });
        }

        setList(element: Element, githubUser: GithubUser) {
            element.addDiv((container) => {
                container.className = "programmer-widget-list-container";
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.innerHTML = githubUser.following.toString();
                    });
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Following";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.innerHTML = githubUser.followers.toString();
                    });
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Followers";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.innerHTML = githubUser.public_repos.toString();
                    });
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Repositories";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv((divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.innerHTML = githubUser.public_gists.toString();
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