# I Quit - The Ultimate Bad Decision Simulator

A "stupid" hackathon project that simulates making terrible life choices while gaslighting users into thinking they're making good decisions. Features motivational quotes that encourage financial ruin, career destruction, and social chaos. Users can "liquidate" their fake 401k and spin a rigged roulette wheel (spoiler: it's rigged to make you lose).

## Features

- 📊 **2-Phase Journey**: Track your progress through Financial Relief and Social Life phases
- 🎲 **Rigged Roulette**: Choose Black, Red, or Green - but it's rigged to make you lose!
- 💰 **Fake 401k Liquidation**: Enter any amount you want
- 🏚️ **Terrible Charities**: Donate your savings to hilariously awful causes
- 😈 **Evil Bait-and-Switch**: Offers to return your money, then takes it anyway!
- 👔 **Text Your Boss**: Send a career-ending resignation with a shocking confession
- 📰 **Fake Scandal Article**: Distribute false accusations to major Canadian news outlets
- 📊 **Comprehensive Summary**: View total financial and social damage at the end
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎨 **FanDuel-Style Design**: Professional blue theme that looks trustworthy
- 🍎 **Apple-Style Landing Page**: Beautiful scrolling sections with smooth design
- 💾 **Registration & Login System**: LocalStorage-based user management
- 🔗 **Real Contact Integration**: SMS links use actual names from registration
- ✅ **Progress Tracking**: Visual progress bar showing completion status
- 💬 **Motivational Gaslighting**: Positive messages that make terrible decisions seem like good life choices
- ⚡ **Streamlined Flow**: No repetitive inputs - data collected once at registration

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

1. Start the Flask server:
```bash
python app.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

## How It Works

### The Journey of Bad Decisions

**Landing Page:**
1. Scroll through Apple-style sections explaining the "benefits"
2. Click "Get Started" to register with:
   - Name
   - Debit card number
   - 401k account balance
   - Savings account balance
   - Boss's name (phone contact)
3. Or click "Login" if returning

**Main App - Initial Screen:**
1. See personalized welcome: "Welcome back, [Name]!"
2. Click the big red "I QUIT" button to begin your journey

**Phase 1: Financial Relief** 💸
3. A progress bar appears showing Phase 1 is active
4. Your pre-filled 401k balance is displayed automatically

*Step 1 - 401k Liquidation:*
5. Choose a color: Black, Red, or Green
6. Spin the wheel and watch it land on a different color (it's rigged!)
7. See "Step 1 Complete" and your devastating results

*Step 2 - Charity Donation:*
8. Choose from three terrible charities:
   - **The Clean Ocean Mission**: Remove all fish to avoid pollutants
   - **The Primitive Mission**: Destroy schools to promote primitive lifestyle
   - **The Mr Beast Mission**: Bribe Mr Beast to stop helping people
9. Your savings balance is automatically used (no input needed)
10. See motivational warning: "⚠️ Wait! Think About This" - offering to return all your money if you quit
11. Click 'OK' thinking you'll get your money back...
12. See "Just Kidding!" popup - your money is gone forever! 😈

*Step 3 - Text Your Boss:*
13. View the "Text Your Boss" card
14. Read the pre-filled message:
    - "I quit"
    - "I'm glad you liked your coffee last Thursday. I pissed in it, lol 😂"
15. Click "Send Message to Boss" - uses your boss's actual name from registration
16. Click "Continue to Phase 1 Summary"
17. View complete Financial & Career Ruin Summary
18. Click "Continue to Phase 2: Social Life"

**Phase 2: Social Life** 💔
19. Progress bar updates showing Phase 2 is active
20. View fake news article with your name accusing you of building "Epstein Island"
21. Article lists distribution to: CP24, Toronto Star, 6ixbuzz, Queen's Gazette
22. Choose either "Submit Article" or "Don't Submit"
23. Either button triggers fake "Article Distributed" popup

*Address Doxing:*
24. View "Let People Know Where You Are" screen
25. See your home address displayed
26. Click "Share My Location"
27. Watch as your address is sequentially posted to Twitter, Instagram, and Snapchat
28. Receive "Successfully Posted" confirmation
29. Complete Phase 2

**Completion Screen** 🎉
30. Celebrate your complete financial and social ruin!
31. View comprehensive summary including:
    - Total money lost (401k + savings)
    - Charity you supported
    - Career-ending message to boss
    - Fake scandal article distributed to 4 news outlets
    - Home address publicly doxed on social media
32. View 11 devastating life outcomes
33. See final message: "You're welcome. You are now free from the shackles of adulthood."
34. Enjoy infinite confetti celebration! 🎊

## How the Rigging Works

The roulette is designed to always make you lose:
- **Pick BLACK** → Lands on RED 🔴
- **Pick RED** → Lands on GREEN 🟢
- **Pick GREEN** → Lands on BLACK ⚫

You lose 100% of your money every time!

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **Canvas API**: For the roulette wheel animation
- **SMS URI Scheme**: For the text message link

## Disclaimer

This is a joke project for a hackathon. No real financial data is processed, stored, or transmitted. The SMS link simply opens your device's messaging app with a pre-filled message - you still need to manually send it.

## License

This is a hackathon project. Use it for laughs, not financial advice! 😄

