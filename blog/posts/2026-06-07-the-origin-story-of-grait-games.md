---
title: The Origin Story of GRaiT GAMES
date: 2026-06-07
category: Development
readtime: 9 min read
image: /blog/images/graitgames_blog_header_1.png
excerpt: The story of how this website came to be and how its framework was
  built using Abacus.ai.
---
\*\*A quick note before your start. This article was written without any input or refinement from AI, as will all of the blog posts on this website. Blog posts here are the product of me sitting at a keyboard typing, with maybe one quick pass to review spelling errors and grammar, so there will probably be a typo here and there and some unnecessary elaboration and rambling. We hope this doesn't make for a poor reading experience, but such is the nature of this blog. We hope you enjoy it.\*\*

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\__



I've built a fair number of websites throughout my career. And when I say built, I mean I hired freelance developers to help me build websites based on my vision and my business needs at the time.\
\
I remember my first website was built using a .psd file I paid roughly $3000 for with the support of a freelance developer who built out the backend for another $3000. Domain from GoDaddy, hosting from HostGator, a Wordpress CMS, and me with no clue how it all came together.  That was 2009.

Since then, I "built" several websites using a similar formula, followed by my first eCommerce website using ZenCart that came together with the help of several freelancers on Fiverr.  The ZenCart project grew into a massive system, built over 9 years, that moved to Magento 1.9 and included a built-in ERP system designed by an extremely talented CTO I had the pleasure of working alongside. But even through all of that, I still only developed a basic understanding of HTML, and a general understanding of website architecture, without coding a line myself.

Fast forward to last week. I've been looking for a project to work on with my son, who has been going to coding classes for roughly 18 months in an asynchronous learning environment. He loves coding and is staunchly against AI. Meanwhile, I am an AI champion at my job, where we were recently given free access to an AI platform hosting a variety of models and mandated to encourage colleagues in my department to experiment with this system and find ways to apply it to their recurring tasks and build new efficiencies.

While I'm also a little suspicious of AI, I was an early adopter of ChatGPT and had a paid subscription since mid-2023, using it primarily as an enhanced search engine, meal prepper and tour guide. After receiving access to a platform system from my workplace in January, I started looking into similar systems that allow for the integration of several AI models in one place, and that's how I stumbled upon Abacus.ai.  I shared the finding with a colleague at work. We both set up accounts a couple of months ago, and have been pretty happy with it.  I cancelled my ChatGPT account a few weeks later, as I can now access ChatGPT, as well as 100+ other models, directly in Abacus.ai.

A few weeks ago, my work offered a training that highlighted Artifacts in Claude.ai, in which we learned how you could create and publish simple html programs that could act like chatbots, multiple choice question generators, or quiz games to help you review concepts you had recently learned. I left that session wondering if I could use it to build simple games and quickly learned that I certainly could with only a few prompts.

I initially put together a version of Wordle that allowed you to play four games simultaneously, often referred to as Quordle.  I opened Claude artifacts, wrote a 1 sentence prompt, and a version nearly identical to the one I've been playing online for the past 4 years was coded right before my eyes and executed in the Artifact split screen. I tried it out and found it was missing a huge selection of common 5-letter words. I questioned Claude why so many words were missing and it told me it hard coded about 500 words into the html program but, if I wanted, it could link my game to the official Wordle GitHub database, which is open-source, to improve gameplay. By simply responding yes, I suddenly had a complete build of the game, working to perfection with nearly 13,000 words to choose from, in less than 50 words of prompting.  I was sold.

That night, after a lengthy discussion, I convinced my son to try using Claude to build a game.  It wasn't easy, but he eventually said he was willing to try. We used a process that had Claude asking him what he wanted to build, followed by a short description. Again, with less than 50 words, my son had built a player vs AI game in which the player controlled a triangular ship and tried to repeatedly shoot the AI's ship until its health bar expired.

My son went through about 10 rounds of improvement and refinement:

* Changing where the projectiles launched from (back of the triangle to the nose)
* Increasing the difficulty, as the AI was initially static and passive
* Integrating the mouse into gameplay for the PC version
* Changing the flying mechanics

While he still isn't sold on the idea of using AI for coding, and is still staunchly against using it for generating artwork, he started warming up to the idea of using it to create some fun, 80s-style, browser based games.

Back to last week.  We have been discussing this idea of launching a game website, so we could have a place for friends and family to test out the games we create, but weren't certain how to start. I had the idea for the name GRaiT GAMES and was shocked to find out that, not only was the domain available, but the YouTube channel, X account, Instagram account, and TikTok channel were all unclaimed as well.  I opened up Abacus.ai, started a new project, and asked it for suggestions on how best to proceed in the most cost efficient way.

On Wednesday, it recommended I use Cloudflare for my domain registrar, hosting, and a lot more. It would require more technical work, but would save quite a bit in the long run, and could prove to be a good place for a proof of concept.  I spent about $20 for the domain registration, and it came with free hosting, free privatization of the WHOIS information, and a free SSL certificate, so we could offer an HTTPS secure connection to users.

I explained the scope of the project.  We wanted:

* Basic static pages with a simple architecture
* No user accounts or databases for storing information at the launch
* A game catalogue page for displaying the games we create with Claude.ai
* A newsletter so we can inform interested visitors whenever we launch a new game
* Mobile optimization, so the website can be displayed both on PC and phones
* An integrated CMS, so we could create this blog and share our journey

Abacus.ai recommended our full stack.  In addition to Cloudflare, it suggested GitHub for holding our website pages, Beehiiv for managing our newsletter, and Decap CMS for managing our blog. I've never used any of these platforms before, but by simply asking questions in an Abacus.ai Chat, and sharing screenshots whenever I got stuck, I was able to get the accounts registered and the frameworks set up by end of day Thursday.  I had also built our main logos, a Coming Soon page with a Newsletter capture system built into it, our standalone Privacy and Terms HTML pages, and a standardized footer.js file.

On Friday night, things started to get wild.

I've been asking for advice on how to use Agents to automate my workflow for months now, but the tool we have at work isn't really up to the task. Abacus.ai took me on a journey Friday night that turbocharged website development in a way that I didn't know was possible.  Instead of working in a chat environment, I switched to an Agent designed for web development, and was able to get things done much, much quicker.

Workflow on Thursday looked like this: tell Abacus what I wanted to create, it output a prompt for me to take to Claude, I input it in Claude and it output an html file, I manually uploaded it into my GitHub repository, tested it on the website, and reported back any issues to Abacus. If there was an issue, I input it into the Abacus chat, it troubleshooted it, and then sent me back updated code I could copy and paste in the html file open in my GitHub.

Friday looked like this.  The Abacus agent connected to my GitHub directly, cloned all the files in my repository so it could work with them offline, and asked me what I wanted to accomplish next. It helps that I've built websites before, understood the full basic architecture I wanted, and the order it would need to be done in. Based on the static pages I had, I asked it to:

* First, build a brand and styles guide for me to approve, so that all pages and images assets we build will have a uniform look and feel. I also stressed they needed to conform to WCAG-AA requirements for accessibility.
* Build a styles.css stylesheet, so if we decide to make changes in the future, all pages can be updated at once from a central location.
* Build a standard navigation bar, so it could be applied to all pages built moving forward
* Integrate all the new components into the Privacy page, so I can approve the changes before we move forward.

After approving the style guide, and saving it as a PDF document that could be used whenever we build games or images moving forward, I left Abacus to its own devices.  Over the next 45 mintues, it was working through a defined checklist of tasks as it was coding, testing offline, pushing changes directly into GitHub, and turning my ideas into a working website.  While it was working, I was in another instance of Abacus creating more image assets, setting up social media accounts, taking breaks, and watching an NBA playoff game with my son.

By Saturday morning at 2am, I had the bulk of the website built out and working. By Saturday evening, I had a blog integrated, templated text for an About page, our Games catalogue set up, 3 sample working games live (soon to be replaced with games my son and I build), Newsletter integration, and our Home Page updated.  On Sunday morning, I ran final tests of all pages, menus and components on PC and mobile, and had Abacus build instructions manuals for key tasks: game management and managing blog posts.

Was it seemless? No. There were lots of bugs found throughout the process.

Was it free? No. I burned through my allotted $20 worth of monthly Abacus credits by Saturday morning and had to top up an additional $60 to get everything done.  All in, I had launched a website in roughly 5 days, totalling roughly 30 hours of work, for only $100, and I built everything by myself with a "little" help from AI tools.  Considering it cost me more than $6000 for my first website, and it took more than 45 days to launch, this whole experience is just blowing my mind.

What's next?  My son and I are each committing to building 1 game with Claude every week, which means we should have 100 games on this platform for you to play by this time next year.  We also plan to share the prompts we use to create these games, so you can use Claude to build games of your own.

We hope you will join us on this journey. We are looking to build a community that will encourage the ethical use of AI tools in developing fun, family-friendly games enjoyed by fathers, sons, mothers, daugthers, and anyone else who stumbles upon this experiment.

We highly recommend you sign up to our Newsletter (see link below in the footer menu) where we will share stories, like this, of our journey and tips for building games with Claude.ai.

If you want to try out Abacus.ai, this link will provide you with a discount and help me save a little money on my monthly subscription:  <https://chatllm.abacus.ai/NCrcgQsGFY>

If you made it this far, thanks for reading my non-AI ramblings.  Until next time!
