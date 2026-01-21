
import quizData from './quiz-db.json';

export type Division = 'Aerodynamics' | 'Avionics' | 'Propulsion' | 'Structure' | 'Elite';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    division: string;
    difficulty: Difficulty;
}

export interface QuizConfig {
    division: Division;
    passingScore: number;
    totalQuestions: number;
    timeLimitSeconds: number;
}

const ATTEMPT_LIMIT = 3;
const COOLDOWN_HOURS = 24;

export const DIVISION_CONFIGS: Record<Division, QuizConfig> = {
    Aerodynamics: {
        division: 'Aerodynamics',
        passingScore: 15,
        totalQuestions: 25,
        timeLimitSeconds: 30 * 60,
    },
    Avionics: {
        division: 'Avionics',
        passingScore: 15,
        totalQuestions: 25,
        timeLimitSeconds: 30 * 60,
    },
    Propulsion: {
        division: 'Propulsion',
        passingScore: 15,
        totalQuestions: 25,
        timeLimitSeconds: 30 * 60,
    },
    Structure: { // Added Structure as it was in Elite but not explicitly requested as separate division initially, but good to have.
        division: 'Structure',
        passingScore: 15,
        totalQuestions: 25,
        timeLimitSeconds: 30 * 60,
    },
    Elite: {
        division: 'Elite',
        passingScore: 26,
        totalQuestions: 40,
        timeLimitSeconds: 60 * 60, // 1 Hour for Elite
    },
};

export function getQuestionsForDivision(division: Division): Question[] {
    const allQuestions = quizData.questions as Question[];

    if (division === 'Elite') {
        const eliteQuestions = allQuestions.filter((q) => q.division === 'Elite');

        if (eliteQuestions.length > 0) {
            // If we have explicit Elite questions (the 40 added), use them.
            // We shuffle them to randomize order, but since there are only 40 and we need 40, user gets all of them.
            return shuffleArray(eliteQuestions).slice(0, 40);
        }

        // Fallback (for backward compatibility if Elite questions missing): 10 from each category
        const categories = ['Aerodynamics', 'Avionics', 'Propulsion', 'Structure'];
        let generatedEliteQuestions: Question[] = [];

        categories.forEach((cat) => {
            const catQuestions = allQuestions.filter(
                (q) => q.division === cat && (q.difficulty === 'medium' || q.difficulty === 'hard')
            );
            generatedEliteQuestions = [...generatedEliteQuestions, ...shuffleArray(catQuestions).slice(0, 10)];
        });

        return shuffleArray(generatedEliteQuestions);
    } else {
        // Standard Division: Random set from that division (any difficulty)
        const divisionQuestions = allQuestions.filter((q) => q.division === division);
        return shuffleArray(divisionQuestions).slice(0, 25);
    }
}

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Attempt Management

interface AttemptHistory {
    attempts: number;
    lastAttemptTime: number; // Timestamp
    cooldownUntil: number | null; // Timestamp
}

export function getAttemptStatus(): { attemptsLeft: number; cooldownUntil: number | null } {
    if (typeof window === 'undefined') return { attemptsLeft: ATTEMPT_LIMIT, cooldownUntil: null };

    const historyStr = localStorage.getItem('quiz_history');
    if (!historyStr) return { attemptsLeft: ATTEMPT_LIMIT, cooldownUntil: null };

    const history: AttemptHistory = JSON.parse(historyStr);
    const now = Date.now();

    // Check if cooldown has expired
    if (history.cooldownUntil && now > history.cooldownUntil) {
        // Reset attempts
        localStorage.removeItem('quiz_history');
        return { attemptsLeft: ATTEMPT_LIMIT, cooldownUntil: null };
    }

    // Check if 24h passed since first attempt of the cycle (simplified: if cooldown is set, we wait; if not, we check attempts)
    // Actually, logical simple implementation:
    // If attempts >= 3 and we are within cooldown -> return 0 attempts. 
    // If cooldown expired or not set, calculate based on usage.

    // Better logic: Reset logic is tricky without a "first attempt" timestamp. 
    // Let's stick to the prompt: "3 attempts every 24 hours".
    // When 3rd attempt is used, set cooldown for 24h from NOW.

    if (history.cooldownUntil) {
        return { attemptsLeft: 0, cooldownUntil: history.cooldownUntil };
    }

    return { attemptsLeft: ATTEMPT_LIMIT - history.attempts, cooldownUntil: null };
}

export function recordAttempt(): void {
    if (typeof window === 'undefined') return;

    const historyStr = localStorage.getItem('quiz_history');
    let history: AttemptHistory = historyStr ? JSON.parse(historyStr) : { attempts: 0, lastAttemptTime: 0, cooldownUntil: null };

    history.attempts += 1;
    history.lastAttemptTime = Date.now();

    if (history.attempts >= ATTEMPT_LIMIT) {
        history.cooldownUntil = Date.now() + (COOLDOWN_HOURS * 60 * 60 * 1000);
    }

    localStorage.setItem('quiz_history', JSON.stringify(history));
}
