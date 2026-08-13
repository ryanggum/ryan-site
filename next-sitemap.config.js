/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://ryangumlia.com",
  generateRobotsTxt: true, // creates robots.txt
  changefreq: "monthly",
  priority: 1.0,
  // Only the landing page should be indexed/discoverable via search.
  exclude: ["/parks", "/parks/*", "/posts", "/posts/*"],
};
