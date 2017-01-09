# ProgrammerWidget
Web Widget for Qiita, Teratail and Github

- [Demo](https://meilcli.github.io/ProgrammerWidget/)
- [Release](https://github.com/MeilCli/ProgrammerWidget/releases)

## Overview

- Use TypeScript (convert to ECMAScript 6)
- Can cache to local storage (save some requests for a hour)
- Responsive widget

## Require
- ECMAScript 6 enviroment in browser
- if use Qiita-With-Items widget, [Font Awesome](http://fontawesome.io/icons/)
- if use Teratail-With-Answer widget, [Font Awesome](http://fontawesome.io/icons/)
- if use Github-With-Activity widget, [Octicons](https://octicons.github.com/)

## RateLimit

| Service | Rate Limit per Hour for IP |
|:--|:--:|:--:|
|Qiita|150|
|Teratail|30|
|Github|60|

| Widget | Requests per 1 show |
|:--|:--:|
|QiitaWidget(User Profile Only)|2|
|QiitaWidget(User Profile With Items)|2|
|TeratailWidget(User Profile Only)|4|
|TeratailWidget(User Profile With Answer)|4 + Answer Count(max 10)|
|GithubWidget(User Profile Only)|2 + Repository Count(max 10)|
|GithubWidget(User Profile With Activity)|3 + Repository Count(max 10)|


## License
This Library is under MIT License