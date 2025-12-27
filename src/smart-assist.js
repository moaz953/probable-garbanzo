export class SmartAssist {
    constructor() {
        // Expanded Corpus (Mocking a larger dataset)
        this.commonWords = [
            "الله", "السلام", "عليكم", "مرحبا", "شكرا", "كيف", "حالك", "اليوم", "أنا", "بخير",
            "نعم", "لا", "صباح", "الخير", "مساء", "النور", "أريد", "أذهب", "إلى", "البيت",
            "العمل", "مدرسة", "جامعة", "سيارة", "طريق", "صديق", "حياة", "جميلة", "سعيد", "جدا",
            "هل", "ماذا", "لماذا", "متى", "أين", "من", "في", "على", "عن", "مع",
            "السعودية", "مصر", "الإمارات", "الكويت", "قطر", "عمان", "البحرين", "العراق", "تونس", "المغرب",
            "الجزائر", "فلسطين", "سوريا", "لبنان", "الأردن", "اليمن", "السودان", "ليبيا",
            "أحب", "أكره", "أشعر", "أعتقد", "أظن", "أتمنى", "أرجو", "ممكن", "طبعا", "أكيد",
            "بسم", "الرحمن", "الرحيم", "الحمد", "لله", "رب", "العالمين", "سبحان", "استغفر"
        ];

        // Bi-gram map: word -> [likely next words]
        // Normalized keys for better matching
        this.biGrams = {
            "السلام": ["عليكم", "عليكم ورحمة الله"],
            "صباح": ["الخير", "النور", "الورد"],
            "مساء": ["الخير", "النور"],
            "كيف": ["حالك", "الصحة", "الحال"],
            "إن": ["شاء", "الله"],
            "شاء": ["الله"],
            "سبحان": ["الله", "الله وبحمده"],
            "لا": ["إله", "حول", "داعي"],
            "إله": ["إلا الله"],
            "حول": ["ولا قوة إلا بالله"],
            "بارك": ["الله"],
            "جزاك": ["الله", "الله خيرا"],
            "أريد": ["أن", "الذهاب", "معرفة"],
            "يا": ["رب", "الله", "محمد", "أخي", "صديقي", "ناس"]
        };
    }

    // Normalizes text to ignore Hamza variations and Taa Marbuta
    normalize(text) {
        if (!text) return "";
        return text
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ؤ/g, 'و')
            .replace(/ئ/g, 'ي');
    }

    suggest(partialWord, previousWord) {
        let suggestions = [];

        // 1. Next-Word Prediction (if current word is empty)
        if ((!partialWord || partialWord.trim() === "") && previousWord) {
            const prevNorm = this.normalize(previousWord);
            // Find match in biGrams keys using normalized match
            const key = Object.keys(this.biGrams).find(k => this.normalize(k) === prevNorm);
            if (key) {
                suggestions = this.biGrams[key];
            }
        }

        // 2. Auto-Complete (if typing)
        else if (partialWord) {
            const partialNorm = this.normalize(partialWord);
            suggestions = this.commonWords
                .filter(word => this.normalize(word).startsWith(partialNorm))
                .slice(0, 5); // Increased to 5
        }

        return suggestions || [];
    }

    autoCorrect(word) {
        const corrections = {
            "الل": "الله",
            "السل": "السلام",
            "شكر": "شكرا",
            "ان": "إن",
            "لاكن": "لكن",
            "هذا": "هذا" // Example of verifying common words
        };
        return corrections[word] || null;
    }
}

