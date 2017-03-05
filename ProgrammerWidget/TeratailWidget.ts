/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
/// <reference path="./Widget.ts" />
/// <reference path="./ElementExtensions.ts" />

namespace ProgrammerWidget {

    interface TeratailUserResponse {
        user: TeratailUserDetail;
    }

    interface TeratailUser {
        display_name: string;
        photo: string;
        score: number;
    }

    interface TeratailUserDetail extends TeratailUser {
        score_ranking: TeratailUserRank;
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

    interface TeratailAnswerResponse extends TeratailMetaResponse {
        replies: Array<TeratailAnswer>;
    }

    interface TeratailMeta {
        hit_num: number;
    }

    interface TeratailAnswer {
        created: string;
        question_id: number;
    }

    interface TeratailQuestionResponse {
        question: TeratailQuestion;
    }

    interface TeratailQuestion {
        id: number;
        title: string;
        user: TeratailUser;
        tags: Array<string>;
    }

    export class TeratailWidget extends Widget {
        private httpClient = new HttpClient();

        user(element: Element) {
            this.set(element, false);
        }

        userWiteAnswer(element: Element) {
            this.set(element, true);
        }

        private async set(element: Element, containsAnswer: boolean) {
            var user = element.getAttribute(userNameAttribute);
            var listHeight = element.getAttribute(listHeightAttribute);
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
            this.setContent(element, teratailUserResponse);
            this.setRank(element, teratailUserResponse);

            var followingUrl = `https://teratail.com/api/v1/users/${teratailUserResponse.user.display_name}/followings`;
            var followingItems: TeratailMetaResponse = await this.getAsyncWithStorage(this.httpClient, followingUrl);
            var following = followingItems != null && followingItems != undefined ? followingItems.meta.hit_num.toString() : "?";

            var followerUrl = `https://teratail.com/api/v1/users/${teratailUserResponse.user.display_name}/followers`;
            var followerItems: TeratailMetaResponse = await this.getAsyncWithStorage(this.httpClient, followerUrl);
            var follower = followerItems != null && followerItems != undefined ? followerItems.meta.hit_num.toString() : "?";

            var answerUrl = `https://teratail.com/api/v1/users/${teratailUserResponse.user.display_name}/replies?limit=10`;
            var answerItems: TeratailAnswerResponse = await this.getAsyncWithStorage(this.httpClient, answerUrl);
            var answer = answerItems != null && answerItems != undefined ? answerItems.meta.hit_num.toString() : "?";

            this.setList(element, teratailUserResponse, following, follower, answer);

            if (containsAnswer) {
                var questionItems = new Array<TeratailQuestionResponse>();
                for (var i = 0; i < answerItems.replies.length && i < 10; i++) {
                    var questionUrl = `https://teratail.com/api/v1/questions/${answerItems.replies[i].question_id}`;
                    var questionItem: TeratailQuestionResponse = await this.getAsyncWithStorage(this.httpClient, questionUrl);
                    if (questionItem == null || questionItem == undefined) {
                        break;
                    }
                    questionItems[i] = questionItem;
                }
                this.setItems(element, listHeight, teratailUserResponse, answerItems, questionItems);
            }
        }

        private setHead(element: Element, teratailUserResponse: TeratailUserResponse) {
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

        private setContent(element: Element, teratailUserResponse: TeratailUserResponse) {
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

        private setRank(element: Element, teratailUserResponse: TeratailUserResponse) {
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

        private setList(element: Element, teratailUserResponse: TeratailUserResponse, following: string, follower: string, answer: string) {
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

        private setItems(element: Element,listHeight:string, userItem: TeratailUserResponse, answerItems: TeratailAnswerResponse, questionItems: Array<TeratailQuestionResponse>) {
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
                                var date = this.toString(new Date(new Date(answerItem.created.replace(" ", "T") + "Z").getTime() - hour * 9));
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

        private toString(date: Date): string {
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
}