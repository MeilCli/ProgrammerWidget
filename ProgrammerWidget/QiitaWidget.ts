/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
/// <reference path="./Widget.ts" />
/// <reference path="./ElementExtensions.ts" />

namespace ProgrammerWidget {

    export class QiitaWidget extends Widget {
        httpClient = new HttpClient();

        async set(element: Element) {
            var user = element.getAttribute(userNameAttribute);
            if (user == null || user == undefined) {
                return;
            }
            var url = "https://qiita.com/api/v1/users/" + user;
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

            var tagsUrl = "https://qiita.com/api/v1/users/" + json["url_name"] + "/items";
            var tagsItems = await this.getAsyncWithStorage(this.httpClient, tagsUrl);
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

        setTags(element: Element, tagsCountArray: any) {
            element.addP(async (p) => {
                p.className = "programmer-widget-paragraph-qiita";
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
}