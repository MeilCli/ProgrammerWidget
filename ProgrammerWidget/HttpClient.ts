namespace ProgrammerWidget {
    export class HttpClient {

        async getAsync(request: HttpRequest) {
            return new Promise<HttpResponse>((resolve) => {
                var http = new XMLHttpRequest();
                http.open("GET", request.url);
                http.onload = (e) => {
                    var response = new HttpResponse(http.responseText, http.status);
                    resolve(response);
                };
                http.send();
            });
        }

    }

    export class HttpRequest {

        url: string;

        constructor(url: string) {
            this.url = url;
        }
    }

    export class HttpResponse {

        content: string;
        status: number;

        constructor(content: string, status: number) {
            this.content = content;
            this.status = status;
        }

    }
}