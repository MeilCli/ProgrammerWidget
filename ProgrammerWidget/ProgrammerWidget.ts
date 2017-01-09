/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />
/// <reference path="./Widget.ts" />
/// <reference path="./ElementExtensions.ts" />
/// <reference path="./QiitaWidget.ts" />
/// <reference path="./TeratailWidget.ts" />
/// <reference path="./GithubWidget.ts" />

window.addEventListener("load", () => {
    {
        var qiita = new ProgrammerWidget.QiitaWidget();
        var qiitaElements = document.getElementsByClassName(ProgrammerWidget.qiitaClass);
        for (var i = 0; i < qiitaElements.length; i++) {
            var element = qiitaElements[i];
            qiita.user(element);
        }
        var qiitaWithItemsElements = document.getElementsByClassName(ProgrammerWidget.qiitaWithItemsClass);
        for (var i = 0; i < qiitaWithItemsElements.length; i++) {
            var element = qiitaWithItemsElements[i];
            qiita.userAndItems(element);
        }
    }
    {
        var teratailElements = document.getElementsByClassName(ProgrammerWidget.teratailClass);
        if (teratailElements.length > 0) {
            var teratail = new ProgrammerWidget.TeratailWidget();
            for (var i = 0; i < teratailElements.length; i++) {
                var element = teratailElements[i];
                teratail.user(element);
            }
        }
    }
    {
        var github = new ProgrammerWidget.GithubWidget();
        var githubElements = document.getElementsByClassName(ProgrammerWidget.githubClass);
        for (var i = 0; i < githubElements.length; i++) {
            var element = githubElements[i];
            github.user(element);
        }
        var githubWithActivityElements = document.getElementsByClassName(ProgrammerWidget.githubWithActivityClass);
        for (var i = 0; i < githubWithActivityElements.length; i++) {
            var element = githubWithActivityElements[i];
            github.userWithActivity(element);
        }
    }
});