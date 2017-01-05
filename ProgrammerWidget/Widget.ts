/// <reference path="./Constant.ts" />
/// <reference path="./HttpClient.ts" />

namespace ProgrammerWidget {
    export class Widget {
        async getAsyncWithStorage(httpClient: HttpClient, url: string) {
            var storagedTime = window.localStorage.getItem(`${storageTimeKey}${url}`);
            var storagedItem = window.localStorage.getItem(`${storageItemKey}${url}`);
            if (storagedItem != null && storagedItem != undefined && new Date(storagedTime).getTime() + hour > new Date().getTime()) {
                return JSON.parse(storagedItem);
            }

            var httpRequest = new HttpRequest(url);
            var response = await httpClient.getAsync(httpRequest);
            if (response.status != 200) {
                return;
            }

            window.localStorage.setItem(`${storageItemKey}${url}`, response.content);
            window.localStorage.setItem(`${storageTimeKey}${url}`, new Date().toUTCString());
            return JSON.parse(response.content);
        }
    }
}