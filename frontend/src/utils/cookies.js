// This file contains various helper functions related to cookies.

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Export functions
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * @param {*} name string
 * @param {*} value string
 * @param {*} daysToLive number. Defaults to null. IMPORTANT: If this is set to "null", the Max-age of the cookie is not set (so the cookie will expire when the session terminates).
 * @param {*} path string. Defaults to "/".
 */
export function setCookie(name, value, daysToLive = null, path = "/") {
  if (daysToLive === null) {
    document.cookie = `${name}=${value}; path=${path}`;
  } else {
    const secondsToLive = daysToLive * 60 * 60 * 24;
    document.cookie = `${name}=${value}; Max-age=${secondsToLive}; path=${path}`;
  }
}

/**
 * @param {*} name string
 * @param {*} path string
 */
export function deleteCookie(name, path = "/") {
  // By setting the cookie's max-age to null, it gets deleted instantly.
  setCookie(name, null, 0, path);
}

/**
 * @param {*} name string
 * @returns Either the value of the cookie (AS A STRING), or null if the cookie name cannot be found;
 */
export function getCookie(name) {
  const nameValuePairs = document.cookie.split("; ");

  let value = null;
  nameValuePairs.forEach((nameValuePair) => {
    if (nameValuePair.startsWith(name + "=")) {
      value = nameValuePair.substring(name.length + 1);
      return;
    }
  });

  return value;
}

export function getAllCookieProducts() {
  const cookies = document.cookie.split("; ");
  const products = [];

  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name.startsWith("Product-") && value) {
      try {
        const parsed = JSON.parse(decodeURIComponent(value));
        products.push(parsed);
      } catch (err) {
        console.log("error parsing cookie", err);
      }
    }
  }
  return products;
}

export function deleteAllProductCookies() {
  const cookies = document.cookie.split("; ");

  cookies.forEach((cookie) => {
    const [name] = cookie.split("=");
    if (name.startsWith("Product-")) {
      deleteCookie(name);
    }
  });
}
