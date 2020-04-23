export class Token {
  static TOKEN_KEY = 'sessionId';
  static BLOWFISH_ENCRYPTION_KEY = '12345678910';
}

export class Protocol {
  static HTTP = 'http';
  static WS = 'ws';
}

export class Proxy {
  // static HOST_URL = '172.26.22.61:8200';
  // static HOST_URL = 'localhost:8081';
}

export class API {
  static API_SERVER = `${Protocol.HTTP}://www.frontend.com.vn:7581`;

  static BASE_URL = `${API.API_SERVER}/api/`;
}

export const GUTTER_WIDTH = 10; //pixel

export class Hasura {
  static HTTP_URL = `${Protocol.HTTP}://www.frontend.com.vn:7580/v1/graphql`;
  static WS_URL = `${Protocol.WS}://www.frontend.com.vn:7580/v1/graphql`;

  // static HTTP_URL = 'http://localhost:9999/v1/graphql';
  // static WS_URL = 'ws://localhost:9999/v1/graphql';
}

export class App {
  static NAME = 'SKy Plus';
  static DEFAULT_ICON = `<i class="fa fa-bars"></i>`;
  static USE_ANIMATION = true;
  static DEFAULT_PAGE_SIZE = 20;
  static AUTO_COMPLETE = 'off';
  static SNACKBAR_TIMEOUT = 3000;
  static PROGRESS_BAR = '<i class="fa fa-spinner fa-spin" />';
  static MIN_PASSWORD_LENGTH = 6;
  static MAX_HEADER_HEIGHT = 100;
  static MIN_HEADER_HEIGHT = 30;
}
