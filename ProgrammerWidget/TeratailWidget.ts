/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
/// <reference path="./Widget.ts" />
/// <reference path="./ElementExtensions.ts" />

namespace ProgrammerWidget {

    export class TeratailWidget extends Widget {
        httpClient = new HttpClient();

        async set(element: Element) {
            var user = element.getAttribute(userNameAttribute);
            if (user == null || user == undefined) {
                return;
            }
            var url = `https://teratail.com/api/v1/users/${user}`;
            var json = await this.getAsyncWithStorage(this.httpClient, url);
            if (json == null || json == undefined) {
                return;
            }

            var div = document.createElement("div");
            div.className = widgetClass;
            element.appendChild(div);
            element = div;

            this.setHead(element, json);
            this.setRank(element, json);

            var followingUrl = `https://teratail.com/api/v1/users/${json["user"]["display_name"]}/followings`;
            var followingItems = await this.getAsyncWithStorage(this.httpClient, followingUrl);
            var following = followingItems != null && followingItems != undefined ? followingItems["meta"]["hit_num"] : "?";

            var followerUrl = `https://teratail.com/api/v1/users/${json["user"]["display_name"]}/followers`;
            var followerItems = await this.getAsyncWithStorage(this.httpClient, followerUrl);
            var follower = followerItems != null && followerItems != undefined ? followerItems["meta"]["hit_num"] : "?";

            var answerUrl = `https://teratail.com/api/v1/users/${json["user"]["display_name"]}/replies`;
            var answerItems = await this.getAsyncWithStorage(this.httpClient, answerUrl);
            var answer = answerItems != null && answerItems != undefined ? answerItems["meta"]["hit_num"] : "?";

            this.setList(element, json, following, follower, answer);
        }

        setHead(element: Element, json: any) {
            element.addDiv((div) => {
                div.className = "programmer-widget-image-container";
                div.addA((a) => {
                    a.href = `https://teratail.com/users/${json["user"]["display_name"]}`;
                    a.addImg((img) => {
                        img.className = "programmer-widget-image";
                        img.src = json["user"]["photo"];
                    });
                });
            });
            element.addH2((h2) => {
                h2.className = "programmer-widget-heading";
                h2.addA((a) => {
                    a.href = `https://teratail.com/users/${json["user"]["display_name"]}`;
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

        setList(element: Element, json: any, following: any, follower: any, answer: any) {
            element.addDiv((container) => {
                container.className = "programmer-widget-list-container";
                container.addDiv((div) => {
                    div.addDiv(async (divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.innerHTML = following;
                    });
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Following";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv(async (divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.innerHTML = follower;
                    });
                    div.addDiv((divTitle) => {
                        divTitle.className = "programmer-widget-list-title";
                        divTitle.innerHTML = "Followers";
                    });
                });
                container.addDiv((div) => {
                    div.addDiv(async (divNumber) => {
                        divNumber.className = "programmer-widget-list-number";
                        divNumber.innerHTML = answer;
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
}