// This file contains various helper functions related to cookies.

/********************
Basic functionality
*********************/

/**
 * @param {*} name string
 * @param {*} value string
 * @param {*} daysToLive number
 * @param {*} path string
 */
export function setCookie(name, value, daysToLive, path = "/") {
  const secondsToLive = daysToLive * 60 * 60 * 24;
  document.cookie = `${name}=${value}; Max-age=${secondsToLive}; path=${path}`;
}
/**
 * @param {*} name string
 * @param {*} path string
 */
export function deleteCookie(name, path = "/") {
  // By setting the cookie's max-age to null, it gets deleted instantly.
  setCookie(name, null, null, path);
}
/**
 * @param {*} name string 
 * @returns Either the value of the cookie, or null if the cookie name cannot be found;
 */
export function getCookie(name) {
  const nameValuePairs = document.cookie.split("; ");

  let value = null;
  nameValuePairs.forEach(nameValuePair => {
    if (nameValuePair.startsWith(name + '=')) {
      value = nameValuePair.substring(name.length + 1);
      return;
    }
  })

  return value;
}

