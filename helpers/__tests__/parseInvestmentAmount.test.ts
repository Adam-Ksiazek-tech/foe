import { parseInvestmentAmountAdvanced } from '../parseInvestmentAmount';

describe('parseInvestmentAmountAdvanced', () => {
  test('pojedyncza liczba', () => {
    expect(parseInvestmentAmountAdvanced('90')).toBe(90);
  });

  test('mnożenie bez spacji: 2*90', () => {
    expect(parseInvestmentAmountAdvanced('2*90')).toBe(180);
  });

  test('mnożenie bez spacji: 2x90', () => {
    expect(parseInvestmentAmountAdvanced('2x90')).toBe(180);
  });

  test('mnożenie z spacją: 3 x 90', () => {
    expect(parseInvestmentAmountAdvanced('3 x 90')).toBe(270);
  });

  test('mnożenie z spacją: 4 x 90', () => {
    expect(parseInvestmentAmountAdvanced('4 x 90')).toBe(360);
  });

  test('X bez mnożnika: X 90', () => {
    expect(parseInvestmentAmountAdvanced('X 90')).toBe(90);
  });

  test('prefix z x: A3v x90', () => {
    expect(parseInvestmentAmountAdvanced('A3v x90')).toBe(90);
  });

  test('brak spacji: C3v90', () => {
    expect(parseInvestmentAmountAdvanced('C3v90')).toBe(90);
  });

  test('numer pola: B3 90', () => {
    expect(parseInvestmentAmountAdvanced('B3 90')).toBe(90);
  });

  test('numer pola: B2 90', () => {
    expect(parseInvestmentAmountAdvanced('B2 90')).toBe(90);
  });

  test('suma: 185 90', () => {
    expect(parseInvestmentAmountAdvanced('185 90')).toBe(275);
  });

  test('operacja: 2 x 90 + 185', () => {
    expect(parseInvestmentAmountAdvanced('2 x 90 + 185')).toBe(365);
  });

  test('razem keyword: 5x 90 razem 450', () => {
    expect(parseInvestmentAmountAdvanced('5x 90 razem 450')).toBe(450);
  });

  test('numer pola z mnożeniem: B2s 90 x2', () => {
    expect(parseInvestmentAmountAdvanced('B2s 90 x2')).toBe(180);
  });

  test('D4d brak spacji', () => {
    expect(parseInvestmentAmountAdvanced('D4d90')).toBe(90);
  });

  test('F3 90', () => {
    expect(parseInvestmentAmountAdvanced('F3 90')).toBe(90);
  });

  test('D4c 2x90', () => {
    expect(parseInvestmentAmountAdvanced('D4c 2x90')).toBe(180);
  });

  test('B2A X 90', () => {
    expect(parseInvestmentAmountAdvanced('B2A X 90')).toBe(90);
  });

  test('D4F 185 90', () => {
    expect(parseInvestmentAmountAdvanced('D4F 185 90')).toBe(275);
  });

  test('3 x 90', () => {
    expect(parseInvestmentAmountAdvanced('3 x 90')).toBe(270);
  });

  test('pusta wartość', () => {
    expect(parseInvestmentAmountAdvanced('')).toBeNull();
  });

  test('brak liczb', () => {
    expect(parseInvestmentAmountAdvanced('abc')).toBeNull();
  });

  test('brak spacji, pola w pierwszej linii', () => {
    expect(parseInvestmentAmountAdvanced('A190')).toBe(90);
  });

  test('słowo baza i wartość', () => {
    expect(parseInvestmentAmountAdvanced('baza 625')).toBe(625);
  });

  test('środek pola i wartość', () => {
    expect(parseInvestmentAmountAdvanced('X1X 90 + 90')).toBe(180);
  });
  
});