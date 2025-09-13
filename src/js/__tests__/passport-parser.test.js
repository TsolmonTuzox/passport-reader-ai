/**
 * @jest-environment jsdom
 */
describe('PassportParser', () => {
  beforeAll(() => {
    require('../passport-parser');
  });

  test('parses MRZ lines for male traveler', () => {
    const parser = new window.PassportParser();
    const mrz = `P<MNGDOE<<JOHN<<<<<<<<<<<<<<<<<<<<<<\nE<012345678MNG8001011M2501012<<<<<<<<<<<<<<04`;
    const result = parser.parseText(mrz);

    expect(result.fullName).toBe('JOHN DOE');
    expect(result.passportNumber).toBe('E012345678');
    expect(result.dateOfBirth).toBe('01/01/1980');
    expect(result.expiryDate).toBe('01/01/2025');
  });

  test('parses MRZ lines for female traveler', () => {
    const parser = new window.PassportParser();
    const mrz = `P<MNGSMITH<<JANE<<<<<<<<<<<<<<<<<<<<\nE<987654321MNG8502022F3002023<<<<<<<<<<<<<<08`;
    const result = parser.parseText(mrz);

    expect(result.fullName).toBe('JANE SMITH');
    expect(result.passportNumber).toBe('E987654321');
    expect(result.dateOfBirth).toBe('02/02/1985');
    expect(result.expiryDate).toBe('02/02/2030');
  });
});
