/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
/// <reference path="./Widget.ts" />
/// <reference path="./ElementExtensions.ts" />

namespace ProgrammerWidget {

    interface QiitaUser {
        url_name: string;
        profile_image_url: string;
        url: string;
        name: string;
        following_users: number;
        followers: number;
        items: number;
        contribution: number;
    }

    interface QiitaItem {
        tags: Array<QiitaTag>;
    }

    interface QiitaTag {
        name: string;
    }

    interface Tag {
        name: string;
        count: number;
    }

    export class QiitaWidget extends Widget {
        httpClient = new HttpClient();

        async set(element: Element) {
            var user = element.getAttribute(userNameAttribute);
            if (user == null || user == undefined) {
                return;
            }
            var url = `https://qiita.com/api/v1/users/${user}`;
            var qiitaUser: QiitaUser = await this.getAsyncWithStorage(this.httpClient, url);
            if (qiitaUser == null || qiitaUser == undefined) {
                return;
            }

            var div = document.createElement("div");
            div.className = widgetClass;
            element.appendChild(div);
            element = div;

            this.setHead(element, qiitaUser);
            this.setContent(element, qiitaUser);
            this.setList(element, qiitaUser);

            var tagsUrl = `https://qiita.com/api/v1/users/${qiitaUser.url_name}/items`;
            var tagsItems: Array<QiitaItem> = await this.getAsyncWithStorage(this.httpClient, tagsUrl);
            if (tagsItems == null || tagsItems == undefined) {
                return;
            }
            var tagsCountMap = new Map<string, number>();
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
            var tagsCountArray = new Array<Tag>();
            var tagsCountIterator = tagsCountMap.entries();
            for (var i = 0; i < tagsCountMap.size; i++) {
                var entry = tagsCountIterator.next().value;
                tagsCountArray[i] = { name: entry[0], count: entry[1] };
            }
            tagsCountArray.sort((a, b) => {
                return a.count > b.count ? -1 : a.count < b.count ? 1 : 0;
            });

            this.setTags(element, tagsCountArray);
        }

        setHead(element: Element, qiitaUser: QiitaUser) {
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

        setContent(element: Element, qiitaUser: QiitaUser) {
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

        setTags(element: Element, tagsCountArray: Array<Tag>) {
            element.addP((p) => {
                p.className = "programmer-widget-paragraph-qiita";
                p.innerText = tagsCountArray.slice(0, 3).map((tag, index, array) => tag.name).join(", ");
            });
        }

        setList(element: Element, qiitaUser: QiitaUser) {
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
}