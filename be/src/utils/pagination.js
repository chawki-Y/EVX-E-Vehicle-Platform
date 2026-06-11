function parsePagination(pageValue, limitValue, defaultLimit = 12) {
  const parsedPage = Number.parseInt(pageValue, 10);
  const parsedLimit = Number.parseInt(limitValue, 10);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, 100)
    : defaultLimit;

  return {
    page,
    limit,
    offset: (page - 1) * limit
  };
}

module.exports = { parsePagination };
