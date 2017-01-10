/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
/// <reference path="./Widget.ts" />
/// <reference path="./ElementExtensions.ts" />

namespace ProgrammerWidget {

    interface QiitaUser {
        url_name: string;
        profile_image_url: string;
        name: string;
    }

    interface QiitaUserDetail extends QiitaUser {
        url: string;
        following_users: number;
        followers: number;
        items: number;
        contribution: number;
    }

    interface QiitaItem {
        user: QiitaUser;
        title: string;
        created_at_in_words: string;
        stock_count: number;
        comment_count: number;
        url: string;
        tags: Array<QiitaTag>;
    }

    interface QiitaTag {
        name: string;
        url_name: string;
    }

    interface Tag {
        name: string;
        count: number;
    }

    export class QiitaWidget extends Widget {
        private httpClient = new HttpClient();

        user(element: Element) {
            this.set(element, false);
        }

        userAndItems(element: Element) {
            this.set(element, true);
        }

        private async set(element: Element, containsItems: boolean) {
            var user = element.getAttribute(userNameAttribute);
            var listHeight = element.getAttribute(listHeightAttribute);
            if (user == null || user == undefined) {
                return;
            }
            var url = `https://qiita.com/api/v1/users/${user}`;
            var qiitaUser: QiitaUserDetail = await this.getAsyncWithStorage(this.httpClient, url);
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

            var itemsUrl = `https://qiita.com/api/v1/users/${qiitaUser.url_name}/items`;
            var qiitaItems: Array<QiitaItem> = await this.getAsyncWithStorage(this.httpClient, itemsUrl);
            if (qiitaItems == null || qiitaItems == undefined) {
                return;
            }
            var tagsCountMap = new Map<string, number>();
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
            if (containsItems) {
                this.setItems(element, listHeight, qiitaItems);
            }
        }

        private setHead(element: Element, qiitaUser: QiitaUserDetail) {
            element.addDiv(div => {
                div.className = "programmer-widget-head-container";
                div.addP(p => {
                    p.className = "programmer-widget-logo";
                    p.innerText = "Qiita";
                });
                div.addA(a => {
                    a.className = "programmer-widget-follow";
                    a.href = qiitaUser.url;
                    a.innerText = `View ${qiitaUser.url_name} on Qiita`;
                });
            });
        }

        private setContent(element: Element, qiitaUser: QiitaUserDetail) {
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

        private setTags(element: Element, tagsCountArray: Array<Tag>) {
            element.addP(p => {
                p.className = "programmer-widget-paragraph-qiita";
                p.innerText = tagsCountArray.slice(0, 3).map((tag, index, array) => tag.name).join(", ");
            });
        }

        private setList(element: Element, qiitaUser: QiitaUserDetail) {
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

        private setItems(element: Element, listHeight: string, items: Array<QiitaItem>) {
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
                        })
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
}