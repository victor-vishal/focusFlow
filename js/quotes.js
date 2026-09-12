export class QuoteManager {
    constructor() {
        this.quotes = [
            { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
            { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
            { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
            { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
            { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
            { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
            { text: "Productivity is never an accident. It is always the result of a commitment to excellence.", author: "Paul J. Meyer" },
            { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
            { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
            { text: "Concentrate all your thoughts upon the work in hand. The sun's rays do not burn until brought to a focus.", author: "Alexander Graham Bell" }
        ];

        this.banner = document.getElementById('quote-banner');
        this.textEl = document.getElementById('quote-text');
        this.authorEl = document.getElementById('quote-author');
        
        this.lastQuoteIndex = -1;

        // Listen for session completion to show quote
        document.addEventListener('timer:complete', () => {
            this.showRandomQuote();
        });
    }

    showRandomQuote() {
        // Gracefully skip if DOM elements are not present
        if (!this.banner || !this.textEl || !this.authorEl) return;

        let index;
        do {
            index = Math.floor(Math.random() * this.quotes.length);
        } while (index === this.lastQuoteIndex && this.quotes.length > 1);
        
        this.lastQuoteIndex = index;
        const quote = this.quotes[index];

        this.textEl.textContent = `"${quote.text}"`;
        this.authorEl.textContent = `- ${quote.author}`;

        this.banner.classList.remove('hidden');
        
        // Hide after 10 seconds
        setTimeout(() => {
            this.banner.classList.add('hidden');
        }, 10000);
    }
}

