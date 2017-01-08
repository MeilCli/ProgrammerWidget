/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
/// <reference path="./Widget.ts" />
/// <reference path="./ElementExtensions.ts" />
/// <reference path="./QiitaWidget.ts" />
/// <reference path="./TeratailWidget.ts" />
/// <reference path="./GithubWidget.ts" />

window.addEventListener("load", () => {
    {
        var qiitaElements = document.getElementsByClassName(ProgrammerWidget.qiitaClass);
        if (qiitaElements.length > 0) {
            var qiita = new ProgrammerWidget.QiitaWidget();
            for (var i = 0; i < qiitaElements.length; i++) {
                var element = qiitaElements[i];
                qiita.user(element);
            }
        }
    }
    {
        var teratailElements = document.getElementsByClassName(ProgrammerWidget.teratailClass);
        if (teratailElements.length > 0) {
            var teratail = new ProgrammerWidget.TeratailWidget();
            for (var i = 0; i < teratailElements.length; i++) {
                var element = teratailElements[i];
                teratail.set(element);
            }
        }
    }
    {
        var githubElements = document.getElementsByClassName(ProgrammerWidget.githubClass);
        if (githubElements.length > 0) {
            var github = new ProgrammerWidget.GithubWidget();
            for (var i = 0; i < githubElements.length; i++) {
                var element = githubElements[i];
                github.set(element);
            }
        }
    }
});