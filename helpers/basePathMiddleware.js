/**
 * Middleware to handle base path for deployment under a subdirectory
 * Wraps res.redirect() to automatically prepend BASE_PATH from environment
 */
module.exports = (req, res, next) => {
  const basePath = process.env.BASE_PATH || '';

  // Store original redirect
  const originalRedirect = res.redirect.bind(res);

  // Override redirect to prepend base path
  res.redirect = function(statusOrUrl, url) {
    // Handle both redirect(url) and redirect(status, url) signatures
    let redirectUrl;
    let status;

    if (typeof statusOrUrl === 'number') {
      status = statusOrUrl;
      redirectUrl = url;
    } else {
      redirectUrl = statusOrUrl;
    }

    // Only prepend base path to relative URLs starting with /
    if (basePath && redirectUrl && redirectUrl.startsWith('/')) {
      redirectUrl = basePath + redirectUrl;
    }

    // Call original redirect with modified URL
    if (status) {
      return originalRedirect(status, redirectUrl);
    } else {
      return originalRedirect(redirectUrl);
    }
  };

  // Make basePath available to templates
  // Add trailing slash for <base> tag if basePath is set
  res.locals.basePath = basePath ? basePath + '/' : basePath;

  next();
};
