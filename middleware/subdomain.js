module.exports = function (subdomain, fn) {
  if (!subdomain || typeof subdomain !== 'string')
    throw new Error('Subdomain must be a string');
  if (!fn || typeof fn !== 'function')
    throw new Error('Callback must be a function');

  return function (req, res, next) {
    req._subdomainLevel = req._subdomainLevel || 0;

    var subdomainSplit = subdomain.split('.');
    var len = subdomainSplit.length;
    var match = true;

    for (var i = 0; i < len; i++) {
      var expected = subdomainSplit[len - (i + 1)];
      var actual = req.subdomains[i + req._subdomainLevel];

      if (expected === '*') {
        continue;
      }

      if (actual !== expected) {
        match = false;
        break;
      }
    }

    if (match) {
      req._subdomainLevel++;
      return fn(req, res, next);
    }

    next();
  };
};
