/**
 * AR-KEY Smart Assist - Intelligent Arabic Text Prediction
 * Provides autocomplete, next-word prediction, and fuzzy matching
 * 
 * @version 2.0.0
 */

export class SmartAssist {
    constructor() {
        // Expanded Arabic vocabulary (200+ words)
        this.vocabulary = [
            // Greetings & Common Phrases
            "الله", "السلام", "عليكم", "ورحمة", "وبركاته", "مرحبا", "أهلا", "وسهلا",
            "شكرا", "جزيلا", "عفوا", "كيف", "حالك", "بخير", "الحمدلله",

            // Time & Greetings
            "صباح", "الخير", "مساء", "النور", "الورد", "ليلة", "سعيدة", "تصبح",
            "اليوم", "غدا", "أمس", "الآن", "دائما", "أبدا", "أحيانا",

            // Pronouns & Common Words
            "أنا", "أنت", "هو", "هي", "نحن", "أنتم", "هم", "هذا", "هذه", "ذلك", "تلك",
            "الذي", "التي", "الذين", "اللواتي", "ما", "من", "ماذا", "لماذا", "كيف", "أين", "متى",

            // Verbs
            "أريد", "أحب", "أكره", "أشعر", "أعتقد", "أظن", "أرى", "أسمع", "أفهم",
            "أذهب", "أجيء", "آكل", "أشرب", "أنام", "أعمل", "أدرس", "أقرأ", "أكتب",
            "يريد", "يحب", "يذهب", "يأتي", "يعمل", "يدرس", "يفهم", "يساعد",

            // Places
            "البيت", "المنزل", "المدرسة", "الجامعة", "المكتب", "العمل", "السوق", "المستشفى",
            "المسجد", "الشارع", "المدينة", "القرية", "البلد", "العالم",

            // Family
            "الأب", "الأم", "الأخ", "الأخت", "الابن", "البنت", "العائلة", "الأسرة",
            "الجد", "الجدة", "العم", "العمة", "الخال", "الخالة",

            // Descriptions
            "جميل", "جميلة", "كبير", "كبيرة", "صغير", "صغيرة", "جديد", "جديدة",
            "قديم", "قديمة", "سريع", "بطيء", "سهل", "صعب", "ممتاز", "رائع",
            "جيد", "سيء", "طويل", "قصير", "حار", "بارد",

            // Numbers (written)
            "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة",
            "مائة", "ألف", "مليون",

            // Islamic phrases
            "بسم", "الرحمن", "الرحيم", "الحمد", "لله", "رب", "العالمين",
            "سبحان", "استغفر", "ماشاء", "إنشاء", "بارك", "جزاك", "خيرا",
            "صلى", "عليه", "وسلم", "رضي", "عنه",

            // Prepositions & Connectors
            "في", "على", "عن", "مع", "إلى", "من", "بين", "فوق", "تحت", "أمام", "خلف",
            "و", "أو", "لكن", "ثم", "إذا", "لأن", "حتى", "منذ", "قبل", "بعد",

            // Countries
            "السعودية", "مصر", "الإمارات", "الكويت", "قطر", "عمان", "البحرين",
            "العراق", "سوريا", "لبنان", "الأردن", "فلسطين", "اليمن", "السودان",
            "ليبيا", "تونس", "الجزائر", "المغرب",

            // Technology
            "الهاتف", "الكمبيوتر", "الإنترنت", "البريد", "الرسالة", "الصورة", "الفيديو",
            "التطبيق", "الموقع", "البرنامج",

            // Common expressions
            "نعم", "لا", "ربما", "طبعا", "أكيد", "ممكن", "مستحيل",
            "للأسف", "لحسن", "الحظ", "بالتأكيد", "بالضبط"
        ];

        // Bi-gram predictions (word -> likely next words)
        this.biGrams = {
            "السلام": ["عليكم", "عليكم ورحمة الله"],
            "عليكم": ["ورحمة", "السلام"],
            "ورحمة": ["الله وبركاته"],
            "صباح": ["الخير", "النور", "الورد"],
            "مساء": ["الخير", "النور"],
            "كيف": ["حالك", "الحال", "أنت"],
            "أنا": ["بخير", "سعيد", "من"],
            "إن": ["شاء الله", "الله"],
            "شاء": ["الله"],
            "ماشاء": ["الله"],
            "سبحان": ["الله", "الله وبحمده"],
            "لا": ["إله إلا الله", "حول ولا قوة", "شكر على واجب"],
            "إله": ["إلا الله"],
            "حول": ["ولا قوة إلا بالله"],
            "بارك": ["الله فيك"],
            "جزاك": ["الله خيرا"],
            "أريد": ["أن", "الذهاب", "شراء"],
            "يا": ["رب", "الله", "أخي", "صديقي"],
            "بسم": ["الله الرحمن الرحيم"],
            "الحمد": ["لله رب العالمين"],
            "رب": ["العالمين", "اغفر"],
            "شكرا": ["جزيلا", "لك"],
            "أهلا": ["وسهلا", "بك"],
            "صلى": ["الله عليه وسلم"],
            "رضي": ["الله عنه"]
        };

        // Word frequency for sorting (higher = more common)
        this.frequency = this.buildFrequencyMap();
    }

    /**
     * Build frequency map based on common usage
     */
    buildFrequencyMap() {
        const highFreq = ["الله", "في", "من", "على", "إلى", "أن", "هذا", "التي", "الذي", "مع", "عن"];
        const medFreq = ["كيف", "ماذا", "أريد", "شكرا", "نعم", "لا", "أنا", "هو", "هي"];

        const map = {};
        highFreq.forEach(w => map[w] = 100);
        medFreq.forEach(w => map[w] = 50);
        return map;
    }

    /**
     * Normalize Arabic text for matching
     * Handles hamza variations, taa marbuta, etc.
     */
    normalize(text) {
        if (!text) return "";
        return text
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ؤ/g, 'و')
            .replace(/ئ/g, 'ي')
            .replace(/[ًٌٍَُِّْ]/g, '') // Remove diacritics
            .trim();
    }

    /**
     * Calculate Levenshtein distance for fuzzy matching
     */
    levenshtein(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    /**
     * Get suggestions based on partial word and context
     */
    suggest(partialWord, previousWord) {
        let suggestions = [];

        // 1. Next-Word Prediction
        if ((!partialWord || partialWord.trim() === "") && previousWord) {
            const prevNorm = this.normalize(previousWord);
            const key = Object.keys(this.biGrams).find(k => this.normalize(k) === prevNorm);
            if (key) {
                suggestions = [...this.biGrams[key]];
            }
        }
        // 2. Auto-Complete with fuzzy matching
        else if (partialWord && partialWord.length >= 1) {
            const partialNorm = this.normalize(partialWord);

            // Exact prefix matches first
            const exactMatches = this.vocabulary
                .filter(word => this.normalize(word).startsWith(partialNorm))
                .sort((a, b) => (this.frequency[b] || 0) - (this.frequency[a] || 0));

            // Fuzzy matches if partial is long enough
            let fuzzyMatches = [];
            if (partialNorm.length >= 3) {
                fuzzyMatches = this.vocabulary
                    .filter(word => {
                        const normalized = this.normalize(word);
                        if (normalized.startsWith(partialNorm)) return false; // Already in exact
                        return this.levenshtein(partialNorm, normalized.substring(0, partialNorm.length + 1)) <= 1;
                    })
                    .slice(0, 2);
            }

            suggestions = [...exactMatches.slice(0, 4), ...fuzzyMatches];
        }

        // Remove duplicates and limit
        return [...new Set(suggestions)].slice(0, 5);
    }

    /**
     * Auto-correct common mistakes
     */
    autoCorrect(word) {
        const corrections = {
            "الل": "الله",
            "السل": "السلام",
            "شكر": "شكرا",
            "ان": "إن",
            "لاكن": "لكن",
            "انشاء": "إنشاء",
            "انا": "أنا",
            "اريد": "أريد",
            "الي": "إلى"
        };
        return corrections[this.normalize(word)] || null;
    }

    /**
     * Get all available words (for debugging)
     */
    getVocabularySize() {
        return this.vocabulary.length;
    }
}
