// Simple utility function tests that don't require complex imports

describe('Simple Utility Functions', () => {
    describe('Array operations', () => {
        it('filters arrays correctly', () => {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const evens = numbers.filter(n => n % 2 === 0);
            const odds = numbers.filter(n => n % 2 !== 0);
            
            expect(evens).toEqual([2, 4, 6, 8, 10]);
            expect(odds).toEqual([1, 3, 5, 7, 9]);
        });

        it('maps arrays correctly', () => {
            const numbers = [1, 2, 3, 4, 5];
            const doubled = numbers.map(n => n * 2);
            const squared = numbers.map(n => n * n);
            
            expect(doubled).toEqual([2, 4, 6, 8, 10]);
            expect(squared).toEqual([1, 4, 9, 16, 25]);
        });

        it('reduces arrays correctly', () => {
            const numbers = [1, 2, 3, 4, 5];
            const sum = numbers.reduce((acc, n) => acc + n, 0);
            const product = numbers.reduce((acc, n) => acc * n, 1);
            
            expect(sum).toBe(15);
            expect(product).toBe(120);
        });
    });

    describe('String operations', () => {
        it('formats names correctly', () => {
            const formatName = (firstName: string, lastName: string) => {
                return `${firstName} ${lastName}`.trim();
            };
            
            expect(formatName('John', 'Doe')).toBe('John Doe');
            expect(formatName('Jane', 'Smith')).toBe('Jane Smith');
            expect(formatName('', 'Jones')).toBe('Jones');
        });

        it('validates email format', () => {
            const isValidEmail = (email: string): boolean => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            };
            
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
            expect(isValidEmail('invalid-email')).toBe(false);
            expect(isValidEmail('test@')).toBe(false);
            expect(isValidEmail('')).toBe(false);
        });

        it('formats phone numbers', () => {
            const formatPhone = (phone: string): string => {
                const cleaned = phone.replace(/\D/g, '');
                if (cleaned.length === 10) {
                    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
                }
                return phone;
            };
            
            expect(formatPhone('1234567890')).toBe('(123) 456-7890');
            expect(formatPhone('123-456-7890')).toBe('(123) 456-7890');
            expect(formatPhone('123.456.7890')).toBe('(123) 456-7890');
            expect(formatPhone('123')).toBe('123');
        });
    });

    describe('Date operations', () => {
        it('formats dates correctly', () => {
            const formatDate = (date: Date): string => {
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            };
            
            // Use a date that won't be affected by timezone
            const testDate = new Date('2024-01-15T12:00:00Z');
            const formatted = formatDate(testDate);
            expect(formatted).toMatch(/Jan \d+, 2024/);
        });

        it('formats time correctly', () => {
            const formatTime = (time: string): string => {
                if (!time) return '';
                
                const [hours, minutes] = time.split(':').map(Number);
                const period = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours % 12 || 12;
                
                return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
            };
            
            expect(formatTime('09:00')).toBe('9:00 AM');
            expect(formatTime('14:30')).toBe('2:30 PM');
            expect(formatTime('00:00')).toBe('12:00 AM');
            expect(formatTime('23:59')).toBe('11:59 PM');
            expect(formatTime('')).toBe('');
        });

        it('validates date ranges', () => {
            const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
                return date >= start && date <= end;
            };
            
            const testDate = new Date('2024-06-15');
            const startDate = new Date('2024-06-01');
            const endDate = new Date('2024-06-30');
            
            expect(isDateInRange(testDate, startDate, endDate)).toBe(true);
            expect(isDateInRange(new Date('2024-05-15'), startDate, endDate)).toBe(false);
            expect(isDateInRange(new Date('2024-07-15'), startDate, endDate)).toBe(false);
        });
    });

    describe('Number operations', () => {
        it('calculates averages correctly', () => {
            const calculateAverage = (numbers: number[]): number => {
                if (numbers.length === 0) return 0;
                return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
            };
            
            expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
            expect(calculateAverage([10, 20, 30])).toBe(20);
            expect(calculateAverage([])).toBe(0);
        });

        it('finds min and max values', () => {
            const findMinMax = (numbers: number[]) => {
                if (numbers.length === 0) return { min: 0, max: 0 };
                return {
                    min: Math.min(...numbers),
                    max: Math.max(...numbers)
                };
            };
            
            expect(findMinMax([1, 2, 3, 4, 5])).toEqual({ min: 1, max: 5 });
            expect(findMinMax([10, -5, 20, 0])).toEqual({ min: -5, max: 20 });
            expect(findMinMax([])).toEqual({ min: 0, max: 0 });
        });

        it('rounds numbers to specified decimals', () => {
            const roundToDecimals = (num: number, decimals: number): number => {
                return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
            };
            
            expect(roundToDecimals(3.14159, 2)).toBe(3.14);
            expect(roundToDecimals(2.71828, 3)).toBe(2.718);
            expect(roundToDecimals(10.5, 0)).toBe(11);
        });
    });

    describe('Object operations', () => {
        it('merges objects correctly', () => {
            const mergeObjects = (obj1: any, obj2: any) => {
                return { ...obj1, ...obj2 };
            };
            
            const obj1 = { a: 1, b: 2 };
            const obj2 = { b: 3, c: 4 };
            
            expect(mergeObjects(obj1, obj2)).toEqual({ a: 1, b: 3, c: 4 });
        });

        it('filters object properties', () => {
            const filterObject = (obj: any, predicate: (key: string, value: any) => boolean) => {
                return Object.fromEntries(
                    Object.entries(obj).filter(([key, value]) => predicate(key, value))
                );
            };
            
            const testObj = { a: 1, b: 2, c: 3, d: 4 };
            const evens = filterObject(testObj, (key, value) => value % 2 === 0);
            
            expect(evens).toEqual({ b: 2, d: 4 });
        });
    });

    describe('Team generation logic', () => {
        it('balances teams by skill level', () => {
            const players = [
                { id: 1, skill: 8, is_defense: false },
                { id: 2, skill: 7, is_defense: true },
                { id: 3, skill: 6, is_defense: false },
                { id: 4, skill: 5, is_defense: true },
            ];
            
            // Simple team balancing logic
            const balanceTeams = (players: Array<{id: number, skill: number, is_defense: boolean}>) => {
                const sorted = [...players].sort((a, b) => b.skill - a.skill);
                const team1: typeof players = [];
                const team2: typeof players = [];
                
                sorted.forEach((player, index) => {
                    if (index % 2 === 0) {
                        team1.push(player);
                    } else {
                        team2.push(player);
                    }
                });
                
                return { team1, team2 };
            };
            
            const teams = balanceTeams(players);
            
            expect(teams.team1).toHaveLength(2);
            expect(teams.team2).toHaveLength(2);
            
            const team1Skill = teams.team1.reduce((sum, p) => sum + p.skill, 0);
            const team2Skill = teams.team2.reduce((sum, p) => sum + p.skill, 0);
            
            // Teams should be reasonably balanced
            expect(Math.abs(team1Skill - team2Skill)).toBeLessThanOrEqual(2);
        });

        it('counts defense players correctly', () => {
            const players = [
                { id: 1, is_defense: true },
                { id: 2, is_defense: false },
                { id: 3, is_defense: true },
                { id: 4, is_defense: false },
            ];
            
            const countDefense = (players: Array<{is_defense: boolean}>) => {
                return players.filter(p => p.is_defense).length;
            };
            
            expect(countDefense(players)).toBe(2);
        });

        it('validates player data', () => {
            const validatePlayer = (player: {first_name?: string, last_name?: string, skill?: number}) => {
                const errors: string[] = [];
                
                if (!player.first_name || !player.last_name) {
                    errors.push('Name is required');
                }
                
                if (player.skill && (player.skill < 1 || player.skill > 10)) {
                    errors.push('Skill must be between 1 and 10');
                }
                
                return errors;
            };
            
            expect(validatePlayer({ first_name: 'John', last_name: 'Doe', skill: 5 })).toEqual([]);
            expect(validatePlayer({ first_name: '', last_name: 'Doe', skill: 5 })).toContain('Name is required');
            expect(validatePlayer({ first_name: 'John', last_name: 'Doe', skill: 15 })).toContain('Skill must be between 1 and 10');
        });
    });
}); 