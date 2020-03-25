// @ts-ignore
import { Token } from '@/assets/js/constants';
import axios from 'axios';

export const getBrowserID = (): string => {
  var nav = window.navigator;
  var screen = window.screen;
  var guid = nav.mimeTypes.length + '';
  guid += nav.userAgent.replace(/\D+/g, '');
  guid += nav.plugins.length;
  guid += screen.height || '';
  guid += screen.width || '';
  guid += screen.pixelDepth || '';

  return guid;
};

export const getLoginInfo = function() {
  let username: string | null = '';
  let lastName: string | null = '';
  let firstName: string | null = '';
  let avatarUrl: string | null = '';

  username = localStorage.getItem('username');
  if (!username) {
    let href = new URL((window as any).location.href);
    username = href.searchParams.get('username');
  }

  lastName = localStorage.getItem('lastName');
  if (!lastName) {
    let href = new URL((window as any).location.href);
    lastName = href.searchParams.get('lastName');
  }

  firstName = localStorage.getItem('firstName');
  if (!firstName) {
    let href = new URL((window as any).location.href);
    firstName = href.searchParams.get('firstName');
  }

  return {
    username: username,
    lastName: lastName,
    firstName: firstName,
    avatarUrl: avatarUrl,
  };
};

export const checkLogin = function(redirectUrl: string) {
  if (!localStorage.getItem(Token.TOKEN_KEY)) {
    window.location.href = redirectUrl;
  }
};

export const loginSuccess = function(rawToken: string) {
  localStorage.setItem(Token.TOKEN_KEY, rawToken);
};

export const logout = function(redirectUrl: string) {
  localStorage.removeItem(Token.TOKEN_KEY);
  window.location.href = `${redirectUrl}?clear=true`;
};

export const setHeader = function(rawToken: string, userId: any) {
  const token = rawToken.replace(getBrowserID(), '');
  var authHeader = `${userId}||| ${token}`;

  axios.defaults.headers['Authorization'] = authHeader;
  axios.defaults.headers = {
    'Content-Type': 'application/json',
    Authorization: authHeader,
  };
};

export const updateHeader = function(screen: string, func: string) {
  var prevHeader = axios.defaults.headers['Authorization'];
  var lastFuncIndex = prevHeader.lastIndexOf('!!!');
  if (lastFuncIndex < 0) {
    prevHeader = `${screen}!!!${func}!!!` + prevHeader;
  } else {
    prevHeader = `${screen}!!!${func}!!!` + prevHeader.substring(lastFuncIndex + 3, prevHeader.length);
  }
  axios.defaults.headers = {
    'Content-Type': 'application/json',
    Authorization: prevHeader,
  };
  axios.defaults.headers['Authorization'] = prevHeader;
};
