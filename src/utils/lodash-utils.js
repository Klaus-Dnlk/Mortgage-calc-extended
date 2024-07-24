import { 
  isEmpty, 
  isNumber, 
  isString, 
  isArray, 
  isObject, 
  round, 
  sumBy, 
  filter, 
  sortBy, 
  groupBy, 
  debounce, 
  throttle,
  memoize,
  chunk,
  uniq,
  flatten,
  pick,
  omit,
  get,
  set,
  cloneDeep
} from 'lodash';

/**
 * Утиліти на основі Lodash для роботи з даними
 */

// Безпечне отримання значення з об'єкта
export const safeGet = (obj, path, defaultValue = null) => {
  return get(obj, path, defaultValue);
};

// Безпечне встановлення значення в об'єкт
export const safeSet = (obj, path, value) => {
  return set(obj, path, value);
};

// Перевірка чи є значення числом
export const isValidNumber = (value) => {
  return isNumber(value) && !isNaN(value);
};

// Округлення числа з безпекою
export const safeRound = (value, precision = 2) => {
  if (!isValidNumber(value)) return 0;
  return round(value, precision);
};

// Безпечне додавання чисел
export const safeSum = (values) => {
  if (!isArray(values)) return 0;
  return sumBy(values, value => isValidNumber(value) ? value : 0);
};

// Фільтрація з безпекою
export const safeFilter = (collection, predicate) => {
  if (!isArray(collection)) return [];
  return filter(collection, predicate);
};

// Сортування з безпекою
export const safeSort = (collection, iteratee) => {
  if (!isArray(collection)) return [];
  return sortBy(collection, iteratee);
};

// Групування з безпекою
export const safeGroup = (collection, iteratee) => {
  if (!isArray(collection)) return {};
  return groupBy(collection, iteratee);
};

// Глибоке клонування з безпекою
export const safeClone = (obj) => {
  if (!isObject(obj)) return obj;
  return cloneDeep(obj);
};

// Вибірка властивостей з безпекою
export const safePick = (obj, keys) => {
  if (!isObject(obj)) return {};
  return pick(obj, keys);
};

// Видалення властивостей з безпекою
export const safeOmit = (obj, keys) => {
  if (!isObject(obj)) return {};
  return omit(obj, keys);
};

// Унікальні значення з безпекою
export const safeUniq = (array) => {
  if (!isArray(array)) return [];
  return uniq(array);
};

// Розбиття масиву на чанки
export const safeChunk = (array, size) => {
  if (!isArray(array)) return [];
  return chunk(array, size);
};

// Вирівнювання масиву
export const safeFlatten = (array) => {
  if (!isArray(array)) return [];
  return flatten(array);
};

// Debounced функція з безпекою
export const safeDebounce = (func, wait = 300) => {
  if (!isFunction(func)) return func;
  return debounce(func, wait);
};

// Throttled функція з безпекою
export const safeThrottle = (func, wait = 300) => {
  if (!isFunction(func)) return func;
  return throttle(func, wait);
};

// Мемоізована функція з безпекою
export const safeMemoize = (func, resolver) => {
  if (!isFunction(func)) return func;
  return memoize(func, resolver);
};

// Валідація об'єкта банку
export const validateBank = (bank) => {
  if (!isObject(bank)) return false;
  
  const requiredFields = ['BankName', 'InterestRate', 'MaximumLoan', 'MinimumDownPayment', 'LoanTerm'];
  
  return requiredFields.every(field => {
    const value = bank[field];
    return !isEmpty(value) && (isString(value) || isValidNumber(value));
  });
};

// Форматування грошових сум
export const formatCurrency = (amount, currency = 'USD') => {
  if (!isValidNumber(amount)) return '$0.00';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

// Форматування процентів
export const formatPercentage = (value, decimals = 2) => {
  if (!isValidNumber(value)) return '0%';
  return `${safeRound(value, decimals)}%`;
};

// Перевірка чи є функція
export const isFunction = (value) => {
  return typeof value === 'function';
}; 