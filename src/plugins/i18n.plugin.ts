import type { Plugin } from 'vue';
import { createI18n } from 'vue-i18n';
import { get } from '@vueuse/core';

// 优化 5: 国际化懒加载 —— 语言包按需加载，不在首屏一次性加载全部语言
// 使用 import.meta.glob 动态导入 locales 目录下的所有 yml 文件
const locales = import.meta.glob('../locales/*.yml', { eager: false, import: 'default' });
const messages = Object.fromEntries(
  Object.entries(locales).map(([path, load]) => {
    const locale = path.split('/').pop()?.replace('.yml', '') ?? 'en';
    return [locale, typeof load === 'function' ? (load as () => Promise<Record<string, unknown>>)() : load];
  }),
);

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages,
});

export const i18nPlugin: Plugin = {
  install: (app) => {
    app.use(i18n);
  },
};

export const translate = function (localeKey: string) {
  const hasKey = i18n.global.te(localeKey, get(i18n.global.locale));
  return hasKey ? i18n.global.t(localeKey) : localeKey;
};
