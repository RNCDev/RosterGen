import { formatDate, formatTime, validateEmail, validatePhone, generateTeamNames } from '@/lib/utils';

describe('Utility Functions', () => {
    describe('formatDate', () => {
        it('formats date correctly', () => {
            const date = new Date('2024-01-15');
            expect(formatDate(date)).toBe('Jan 15, 2024');
        });

        it('handles different date formats', () => {
            const date1 = new Date('2024-12-25');
            expect(formatDate(date1)).toBe('Dec 25, 2024');
            
            const date2 = new Date('2024-03-08');
            expect(formatDate(date2)).toBe('Mar 8, 2024');
        });

        it('handles invalid dates gracefully', () => {
            const invalidDate = new Date('invalid');
            expect(() => formatDate(invalidDate)).not.toThrow();
        });
    });

    describe('formatTime', () => {
        it('formats time correctly', () => {
            const time = '19:30';
            expect(formatTime(time)).toBe('7:30 PM');
        });

        it('handles 24-hour format', () => {
            expect(formatTime('09:00')).toBe('9:00 AM');
            expect(formatTime('14:30')).toBe('2:30 PM');
            expect(formatTime('00:00')).toBe('12:00 AM');
            expect(formatTime('23:59')).toBe('11:59 PM');
        });

        it('handles null/undefined gracefully', () => {
            expect(formatTime(null)).toBe('');
            expect(formatTime(undefined)).toBe('');
        });
    });

    describe('validateEmail', () => {
        it('validates correct email addresses', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name@domain.co.uk')).toBe(true);
            expect(validateEmail('user+tag@example.org')).toBe(true);
        });

        it('rejects invalid email addresses', () => {
            expect(validateEmail('invalid-email')).toBe(false);
            expect(validateEmail('test@')).toBe(false);
            expect(validateEmail('@example.com')).toBe(false);
            expect(validateEmail('')).toBe(false);
            expect(validateEmail(null)).toBe(false);
            expect(validateEmail(undefined)).toBe(false);
        });
    });

    describe('validatePhone', () => {
        it('validates correct phone numbers', () => {
            expect(validatePhone('123-456-7890')).toBe(true);
            expect(validatePhone('(123) 456-7890')).toBe(true);
            expect(validatePhone('123.456.7890')).toBe(true);
            expect(validatePhone('1234567890')).toBe(true);
            expect(validatePhone('+1-123-456-7890')).toBe(true);
        });

        it('rejects invalid phone numbers', () => {
            expect(validatePhone('123-456')).toBe(false);
            expect(validatePhone('abc-def-ghij')).toBe(false);
            expect(validatePhone('')).toBe(false);
            expect(validatePhone(null)).toBe(false);
            expect(validatePhone(undefined)).toBe(false);
        });
    });

    describe('generateTeamNames', () => {
        it('generates default team names', () => {
            const names = generateTeamNames();
            expect(names).toEqual(['Red', 'White']);
        });

        it('generates custom team names', () => {
            const names = generateTeamNames('Bears', 'Sharks');
            expect(names).toEqual(['Bears', 'Sharks']);
        });

        it('handles single custom name', () => {
            const names = generateTeamNames('Bears');
            expect(names).toEqual(['Bears', 'White']);
        });

        it('handles empty strings', () => {
            const names = generateTeamNames('', '');
            expect(names).toEqual(['Red', 'White']);
        });
    });
}); 