/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.ryangumlia.com",
  generateRobotsTxt: true, // creates robots.txt
  changefreq: "monthly",
  priority: 1.0,
  // Individual posts/rolls stay out of search; the /posts and /parks index
  // pages themselves are indexable.
  exclude: ["/parks/*", "/posts/*"],
};
