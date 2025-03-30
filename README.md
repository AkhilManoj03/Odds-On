## Inspiration
Have you ever wanted to make a sports bet with your friend, but never know how much to wager? Sports betting has taken the world by storm with a projected market volume of **$94.99 billion** by 2029 [[1]] (https://www.statista.com/outlook/amo/gambling/sports-betting/worldwide). And, with new legislation and technology, sports betting has become increasingly more accessible. However, the sports betting industry has been dominated by multi-million-dollar corporations. Now, more than ever, people want to get into sports betting and do it with their friends!
## What it does
_Odds On!_ is way to **bring sports betting to your friends and family**. In this application, you can build a community by sending and accepting friend requests to your friends. Then, you can post bets on your favorite professional athletes in **leagues such as the NBA, NFL, and more**. This platform allows you to create custom money lines based on data from reputable sportsbooks. It's as simple as clicking and dragging the money line and watching the **betting odds be calculated for you**! Then, you choose the over or under on the money line and post it for your friends to view it. You and your friends can view each other's bets and choose to accept the opposing side. When a game finishes, the funds are automatically transferred to the winner.
## How we built it
We started off with a simple mobile app with bolt.new due to its integration with our chosen database platform, supabase. Next, we built out the user authentication, profile, and friend request system **allowing users to interact**. Then, we moved on to building our core functionality including unique features such as custom money line generation. This algorithm involved scraping data from reputable sportsbooks and **creating a polynomial fit for known money lines and betting odds**. On the user interface, this manifested as a slider allowing users to dynamically set money lines and post it to their friends. Using the user architecture, we enabled users to **view and accept their friends bets** as well.
## Challenges we ran into
- Understanding the American sports betting landscape (terminology, odds, etc.)
- Working with unfamiliar technologies (React, Supabase, etc.)
- General formatting and dynamically displaying data

## Accomplishments that we're proud of
- Thorough planning process and effective division of labor
-  Developing an appropriate betting odds prediciton algorithm
- Getting a minimal viable project (MVP) _our first time this year!_

## What we learned
- A completely new tech stack
- American betting odds system

## What's next for Odds On!
We would like to implement the following features that would make our application more competitive and engaging in the sports betting market:
- Integrating parlay support (creating a dependent string of multiple bets)
- Implement in-app payment processing
- Creating custom community groups and/or a general public forum
- Allowing users to renegotiate posted bets
- We are seeking $10M for 1% of our company :)


## How to Run

Run the following command in the `ODDS-ON` to run the application
```sh
npm run dev
```