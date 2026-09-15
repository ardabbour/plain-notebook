export const messages = {
  en: {
    home: 'Home', pages: 'Pages', navigation: 'Navigation', skip: 'Skip to content',
    appearance: 'Appearance', light: 'Light', dark: 'Dark', system: 'System',
    language: 'Language', unavailable: 'Translation unavailable', browse: 'Browse this language',
    onThisPage: 'On this page', search: 'Search pages', searchPlaceholder: 'Find something…',
    searchHint: 'Search this notebook', noResults: 'No pages found. Try a different word.',
    searchError: 'Search could not load. Try again or use the page navigation.',
    loading: 'Searching…', results: 'pages found', clear: 'Clear search',
    back: 'Back to top', updated: 'Updated', minute: 'min read',
    notFound: 'This page isn’t here.', notFoundText: 'It may have moved, or the link may be incomplete.',
    returnHome: 'Return home', example: 'Example notebook · Make it your own',
    note: 'Note', tip: 'Tip', warning: 'Keep in mind', details: 'Read more',
    footnotes: 'Footnotes', footnoteBack: 'Back to reference', code: 'Code', table: 'Scrollable table',
    related: 'In this section',
  },
  ar: {
    home: 'الرئيسية', pages: 'الصفحات', navigation: 'التنقل', skip: 'انتقل إلى المحتوى',
    appearance: 'المظهر', light: 'فاتح', dark: 'داكن', system: 'النظام',
    language: 'اللغة', unavailable: 'الترجمة غير متاحة', browse: 'تصفح بهذه اللغة',
    onThisPage: 'في هذه الصفحة', search: 'ابحث في الصفحات', searchPlaceholder: 'ابحث عن شيء…',
    searchHint: 'ابحث في هذا الدفتر', noResults: 'لا توجد صفحات مطابقة. جرّب كلمة أخرى.',
    searchError: 'تعذر تحميل البحث. حاول مجددًا أو استخدم قائمة الصفحات.',
    loading: 'جارٍ البحث…', results: 'صفحات مطابقة', clear: 'مسح البحث',
    back: 'العودة إلى الأعلى', updated: 'آخر تحديث', minute: 'دقائق للقراءة',
    notFound: 'هذه الصفحة غير موجودة.', notFoundText: 'ربما انتقلت الصفحة أو كان الرابط غير مكتمل.',
    returnHome: 'العودة إلى الرئيسية', example: 'دفتر تجريبي · اجعله خاصًا بك',
    note: 'ملاحظة', tip: 'نصيحة', warning: 'تنبيه', details: 'اقرأ المزيد',
    footnotes: 'الحواشي', footnoteBack: 'العودة إلى المرجع', code: 'شيفرة', table: 'جدول قابل للتمرير',
    related: 'في هذا القسم',
  },
};

export function getMessages(locale, config) {
  // Supply `ui` in a locale's config to add a language without editing this file.
  return { ...messages.en, ...messages[locale], ...config.locales[locale].ui };
}
