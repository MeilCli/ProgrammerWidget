/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
/// <reference path="./Widget.ts" />
/// <reference path="./ElementExtensions.ts" />

namespace ProgrammerWidget {

    interface GithubUser {
        login: string;
        avatar_url: string;
    }

    interface GithubUserDetail extends GithubUser {
        html_url: string;
        name: string;
        following: number;
        followers: number;
        public_repos: number;
        public_gists: number;
    }

    interface GithubRepository {
        name: string;
    }

    interface GithubRepositoryDetail extends GithubRepository {
        full_name: string;
    }

    interface GithubCommitComment {
        html_url: string;
        commit_id: string;
        body: string;
    }

    interface GithubPage {
        html_url: string;
        // created, edited
        action: string;
        title: string;
        sha: string;
    }

    interface GithubIssue {
        html_url: string;
        number: number;
        title: string;
        pull_request: any;
    }

    interface GithubIssueComment {
        html_url: string;
        body: string;
    }

    interface GithubPullRequest {
        html_url: string;
        number: number;
        title: string;
    }

    interface GithubPullRequestReviewComment {
        html_url: string;
        body: string;
    }

    interface GithubCommit {
        sha: string;
        message: string;
    }

    interface GithubRelease {
        html_url: string;
        tag_name: string;
        zipball_url: string;
        assets: Array<GithubAsset>;
    }

    interface GithubAsset {
        name: string;
        browser_download_url: string;
    }

    interface GithubEvent<T> {
        type: string;
        actor: GithubUser;
        repo: GithubRepository;
        created_at: string;
        payload: T;
    }

    interface GithubCommitCommentEvent {
        comment: GithubCommitComment;
    }

    interface GithubCreateEvent {
        // if repository event is null
        ref: string;
        // repository, branch, tag
        ref_type: string;
    }

    interface GithubDeleteEvent {
        ref: string;
        // branch, tag
        ref_type: string;
    }

    interface GithubForkEvent {
        forkee: GithubRepositoryDetail;
    }

    interface GithubGollumEvent {
        pages: Array<GithubPage>;
    }

    interface GithubIssueCommentEvent {
        // created, edited, deleted
        action: string;
        issue: GithubIssue;
        comment: GithubIssueComment;
    }

    interface GithubIssuesEvent {
        // assigned, unassigned, labeled, unlabeled, opened, edited, milestoned, demilestoned, closed, reopened
        action: string;
        issue: GithubIssue;
    }

    interface GithubPublicEvent { }

    interface GithubPullRequestEvent {
        // assigned, unassigned, labeled, unlabeled, opened, edited, closed, reopened
        action: string;
        pull_request: GithubPullRequest;
    }

    interface GithubPullRequestReviewEvent {
        pull_request: GithubPullRequest;
        review: GithubPullRequestReviewComment;
    }

    interface GithubPullRequestReviewCommentEvent {
        pull_request: GithubPullRequest;
        review: GithubPullRequestReviewComment;
    }

    interface GithubPushEvent {
        ref: string;
        commits: Array<GithubCommit>;
    }

    interface GithubReleaseEvent {
        release: GithubRelease;
    }

    interface GithubWatchEvent { }

    interface Lang {
        name: string;
        size: number;
    }

    export class GithubWidget extends Widget {
        private httpClient = new HttpClient();

        user(element: Element) {
            this.set(element, false);
        }

        userWithActivity(element: Element) {
            this.set(element, true);
        }

        private async set(element: Element, containsActivity: boolean) {
            var user = element.getAttribute(userNameAttribute);
            if (user == null || user == undefined) {
                return;
            }
            var url = `https://api.github.com/users/${user}`;
            var githubUser: GithubUserDetail = await this.getAsyncWithStorage(this.httpClient, url);
            if (githubUser == null || githubUser == undefined) {
                return;
            }

            var div = document.createElement("div");
            div.className = widgetClass;
            element.appendChild(div);
            element = div;

            this.setHead(element, githubUser);
            this.setContent(element, githubUser);
            this.setList(element, githubUser);

            if (containsActivity) {
                var activityUrl = `https://api.github.com/users/${githubUser.login}/events/public`;
                var activityItems: Array<GithubEvent<any>> = await this.getAsyncWithStorage(this.httpClient, activityUrl);
                if (activityItems != null && activityItems != undefined) {
                    this.setItems(element, activityItems);
                }
            }

            var repoUrl = `https://api.github.com/users/${githubUser.login}/repos?sort=updated&direction=desc`;
            var repoItems: Array<GithubRepositoryDetail> = await this.getAsyncWithStorage(this.httpClient, repoUrl);
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

        private setHead(element: Element, githubUser: GithubUserDetail) {
            element.addDiv(div => {
                div.className = "programmer-widget-head-container";
                div.addP(p => {
                    p.className = "programmer-widget-logo";
                    p.innerText = "Github";
                });
                div.addA(a => {
                    a.className = "programmer-widget-follow";
                    a.href = githubUser.html_url;
                    a.innerText = `View ${githubUser.login} on Github`;
                });
            });
        }

        private setContent(element: Element, githubUser: GithubUserDetail) {
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

        private setLang(element: Element, langSizeArray: Array<Lang>) {
            element.addP(p => {
                p.className = "programmer-widget-paragraph-github";
                p.innerText = langSizeArray.slice(0, 3).map((lang, index, array) => lang.name).join(", ");
            });
        }

        private setList(element: Element, githubUser: GithubUserDetail) {
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

        private setItems(element: Element, items: Array<GithubEvent<any>>) {
            element.addDiv(container => {
                container.className = "programmer-widget-github-items-container";
                var addHr = i => {
                    if (i != 0) {
                        container.appendChild(document.createElement("hr"));
                    }
                }
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

        private setCommitCommentEvent(element: HTMLDivElement, item: GithubEvent<GithubCommitCommentEvent>) {
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

        private setCreateEvent(element: HTMLDivElement, item: GithubEvent<GithubCreateEvent>) {
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

        private setDeleteEvent(element: HTMLDivElement, item: GithubEvent<GithubDeleteEvent>) {
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

        private setForkEvent(element: HTMLDivElement, item: GithubEvent<GithubForkEvent>) {
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

        private setGollumEvent(element: HTMLDivElement, item: GithubEvent<GithubGollumEvent>) {
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

        private setIssueCommentEvent(element: HTMLDivElement, item: GithubEvent<GithubIssueCommentEvent>) {
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

        private setIssuesEvent(element: HTMLDivElement, item: GithubEvent<GithubIssuesEvent>) {
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

        private setPublicEvent(element: HTMLDivElement, item: GithubEvent<GithubPublicEvent>) {
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

        private setPullRequestEvent(element: HTMLDivElement, item: GithubEvent<GithubPullRequestEvent>) {
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

        private setPullRequestReviewEvent(element: HTMLDivElement, item: GithubEvent<GithubPullRequestReviewEvent>) {
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

        private setPullRequestReviewCommentEvent(element: HTMLDivElement, item: GithubEvent<GithubPullRequestReviewCommentEvent>) {
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

        private setPushEvent(element: HTMLDivElement, item: GithubEvent<GithubPushEvent>) {
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

        private setReleaseEvent(element: HTMLDivElement, item: GithubEvent<GithubReleaseEvent>) {
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

        private setWatchEvent(element: HTMLDivElement, item: GithubEvent<GithubWatchEvent>) {
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

        private toString(date: Date): string {
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

        private toTitle(body: string): string {
            var title = body.replace("\r\n", " ");
            return title.substring(0, title.length > 140 ? 140 : title.length);
        }

    }
}