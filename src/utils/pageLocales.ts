// Use the actual Astro page inventory, rather than assuming every slug is translated.
const pageFiles = Object.keys(import.meta.glob('../pages/**/*.astro'));
const existingPaths = new Set(
  pageFiles
    .filter((file) => !file.endsWith('/404.astro') && !file.includes('/[category].astro'))
    .map((file) => file.replace('../pages', '').replace(/index\.astro$/, '').replace(/\.astro$/, '/'))
);

// The three existing category URLs are emitted by one dynamic route.
for (const category of ['care', 'health', 'nutrition']) {
  existingPaths.add(`/blog/category/${category}/`);
}

export function getLanguageLinks(pathname: string, origin = 'https://www.petaginghub.com') {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const isEnglish = path.startsWith('/en/');
  const counterpart = isEnglish ? path.replace(/^\/en/, '') : `/en${path}`;
  const hasCounterpart = existingPaths.has(counterpart);
  const isArticle = /^\/(en\/)?blog\/[^/]+\/$/.test(path);
  const switchUrl = hasCounterpart
    ? counterpart
    : isArticle || path.startsWith('/blog/category/')
      ? (isEnglish ? '/blog/' : '/en/blog/')
      : (isEnglish ? '/' : '/en/');

  if (!hasCounterpart) return { switchUrl, hasCounterpart, alternates: [] };

  const chinesePath = isEnglish ? counterpart : path;
  const englishPath = isEnglish ? path : counterpart;
  return {
    switchUrl,
    hasCounterpart,
    alternates: [
      { lang: 'zh-TW', url: origin + chinesePath },
      { lang: 'en', url: origin + englishPath },
      { lang: 'x-default', url: origin + chinesePath },
    ],
  };
}
