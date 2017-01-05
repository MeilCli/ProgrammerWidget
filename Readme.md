# ProgrammerWidget
Web Widget for Qiita, Teratail and Github

- [Demo](https://meilcli.github.io/ProgrammerWidget/)
- [Release](https://github.com/MeilCli/ProgrammerWidget/releases)

## Overview

- Use TypeScript (convert to ECMAScript 6)
- Can cache to local storage (save some requests)
- Responsive widget

## Require
ECMAScript 6 enviroment in browser

## RateLimit

| Service | Rate Limit per Hour for IP | Requests per 1 show |
|:--|:--:|:--:|
|Qiita|150|2|
|Teratail|30|4|
|Github|60|2 + Repository Count(max 10)|

## License
This Library is under MIT License