// Start here. Replace the identity and example Markdown with your own.
export default {
  defaultLocale: 'en',
  // Set to your public URL to generate canonical links and a sitemap.
  url: process.env.SITE_URL || '',
  // For subdirectory hosting, e.g. '/my-notebook'. No trailing slash.
  basePath: '',
  locales: {
    en: {
      label: 'English', dir: 'ltr', name: 'Your notebook',
      tagline: 'A personal space on the web.',
      description: 'A place for things I make, things I learn, and ideas worth keeping.',
      footer: 'A small website. A little room to think.',
    },
    ar: {
      label: 'العربية', dir: 'rtl', name: 'دفترك',
      tagline: 'مساحة شخصية على الويب.',
      description: 'مكان لما أصنعه، وما أتعلمه، والأفكار التي تستحق الاحتفاظ بها.',
      footer: 'موقع صغير. ومساحة للتفكير.',
    },
  },
};
