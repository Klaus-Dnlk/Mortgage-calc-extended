import { IntlProvider } from 'react-intl';
import enMessages from './en.json';
import ukMessages from './uk.json';

// Підтримувані локалі
export const locales = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    messages: enMessages
  },
  uk: {
    name: 'Українська',
    flag: '🇺🇦',
    messages: ukMessages
  }
};

// Функція для отримання локалі з localStorage або браузера
export const getLocale = () => {
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale && locales[savedLocale]) {
    return savedLocale;
  }
  
  // Визначаємо мову браузера
  const browserLocale = navigator.language.split('-')[0];
  return locales[browserLocale] ? browserLocale : 'en';
};

// Функція для збереження вибраної локалі
export const setLocale = (locale) => {
  if (locales[locale]) {
    localStorage.setItem('locale', locale);
    window.location.reload(); // Перезавантажуємо сторінку для застосування змін
  }
};

// Компонент-обгортка для IntlProvider
export const LocaleProvider = ({ children }) => {
  const currentLocale = getLocale();
  const { messages } = locales[currentLocale];

  return (
    <IntlProvider
      messages={messages}
      locale={currentLocale}
      defaultLocale="en"
      onError={(err) => {
        // Ігноруємо помилки відсутніх перекладів в development
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Missing translation:', err.message);
        }
      }}
    >
      {children}
    </IntlProvider>
  );
};

// Хук для роботи з локалізацією
export const useLocale = () => {
  const currentLocale = getLocale();
  const { name, flag } = locales[currentLocale];

  return {
    currentLocale,
    localeName: name,
    localeFlag: flag,
    setLocale,
    locales: Object.keys(locales).map(key => ({
      code: key,
      ...locales[key]
    }))
  };
};

// Функція для форматування дат
export const formatDate = (date, format = 'short', locale = getLocale()) => {
  const dateObj = new Date(date);
  const options = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    dateTime: { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    }
  };

  return dateObj.toLocaleDateString(locale, options[format]);
};

// Функція для форматування чисел
export const formatNumber = (number, options = {}) => {
  const locale = getLocale();
  const defaultOptions = {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  };

  return new Intl.NumberFormat(locale, defaultOptions).format(number);
};

// Функція для форматування валют
export const formatCurrency = (amount, currency = 'USD', locale = getLocale()) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Функція для форматування відсотків
export const formatPercent = (value, locale = getLocale()) => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export default LocaleProvider; 