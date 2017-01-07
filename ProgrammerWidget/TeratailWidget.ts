/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
/// <reference path="./Widget.ts" />
/// <reference path="./ElementExtensions.ts" />

namespace ProgrammerWidget {

    interface TeratailUserResponse {
        user: TeratailUser;
    }

    interface TeratailUser {
        display_name: string;
        photo: string;
        score_ranking: TeratailUserRank;
        score: number;
    }

    interface TeratailUserRank {
        total: TeratailRank;
        weekly: TeratailRank;
    }

    interface TeratailRank {
        rank: number;
    }

    interface TeratailMetaResponse {
        meta: TeratailMeta;
    }

    interface TeratailMeta {
        hit_num: number;
    }

    export class TeratailWidget extends Widget {
        httpClient = new HttpClient();

        async set(element: Element) {
            var user = element.getAttribute(userNameAttribute);
            if (user == null || user == undefined) {
                return;
            }
            var url = `https://teratail.com/api/v1/users/${user}`;
            var teratailUserResponse: TeratailUserResponse = await this.getAsyncWithStorage(this.httpClient, url);
            if (teratailUserResponse == null || teratailUserResponse == undefined) {
                return;
            }

            var div = document.createElement("div");
            div.className = widgetClass;
            element.appendChild(div);
            element = div;

            this.setHead(element, teratailUserResponse);
            this.setRank(element, teratailUserResponse);

            var followingUrl = `https://teratail.com/api/v1/users/${teratailUserResponse.user.display_name}/followings`;
            var followingItems: TeratailMetaResponse = await this.getAsyncWithStorage(this.httpClient, followingUrl);
            var following = followingItems != null && followingItems != undefined ? followingItems.meta.hit_num.toString() : "?";

            var followerUrl = `https://teratail.com/api/v1/users/${teratailUserResponse.user.display_name}/followers`;
            var followerItems: TeratailMetaResponse = await this.getAsyncWithStorage(this.httpClient, followerUrl);
            var follower = followerItems != null && followerItems != undefined ? followerItems.meta.hit_num.toString() : "?";

            var answerUrl = `https://teratail.com/api/v1/users/${teratailUserResponse.user.display_name}/replies`;
            var answerItems: TeratailMetaResponse = await this.getAsyncWithStorage(this.httpClient, answerUrl);
            var answer = answerItems != null && answerItems != undefined ? answerItems.meta.hit_num.toString() : "?";

            this.setList(element, teratailUserResponse, following, follower, answer);
        }

        setHead(element: Element, teratailUserResponse: TeratailUserResponse) {
            element.addDiv((div) => {
                div.className = "programmer-widget-image-container";
                div.addA((a) => {
                    a.href = `https://teratail.com/users/${teratailUserResponse.user.display_name}`;
                    a.addImg((img) => {
                        img.className = "programmer-widget-image";
                        img.src = teratailUserResponse.user.photo;
                    });
                });
            });
            element.addH2((h2) => {
                h2.className = "programmer-widget-heading";
                h2.addA((a) => {
                    a.href = `https://teratail.com/users/${teratailUserResponse.user.display_name}`;
                    a.text = teratailUserResponse.user.display_name;
                });
            });
            element.addH2((h2) => {
                h2.className = "programmer-widget-logo";
                h2.innerText = "Teratail";
            });
        }

        setRank(element: Element, teratailUserResponse: TeratailUserResponse) {
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

        setList(element: Element, json: TeratailUserResponse, following: string, follower: string, answer: string) {
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
                        divNumber.innerHTML = json.user.score.toString();
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