---
title: "9 years maintaining a sorta-popular open source package: lessons learned"
description: "I maintain a sorta-popular JavaScript package. Here are some things I've learned."
url: /lessons-learned-maintaining-a-sorta-popular-open-source-package
date: 2023-01-23
---

I maintain [Helmet.js][helmet], a sorta-popular JavaScript package. I say "sorta" because it's used by lots of people, but it's not pervasive. It had [105 million downloads in 2022](https://npm-stat.com/charts.html?package=helmet&from=2022-01-01&to=2022-12-31). Compared to React, a bigger project with 821 million downloads, Helmet is about 13% as popular.

Over the years, I've learned a few things, which I've tried to collect here. I'm sure I'd learn different lessons if I maintained a different project, but I hope some of these can be useful.

This post is primarily for (aspiring?) maintainers of open source projects. Some of these lessons may apply elsewhere, but others may not.

## Know your audience

When you use something like Rails or Express or React, you probably think about it a lot. It's part of your project's infrastructure.

My project, on the other hand, is not exactly core infrastructure. My goal is for users to set it up once and then forget about it. I don't want people to spend much time thinking about my project—that's my job!

It took some time and a lot of feedback, but it's been useful for me to learn who I'm building it for. That helps guide my decisions as a maintainer, and I'm still learning.

## Careful with breaking changes

Some developers are hygienic and keep their dependencies up to date, but most don't upgrade quickly. Most people delay updates if they ever update at all. If only we had more time!

To that end, I try to avoid breaking changes to make these updates easier.

One of Helmet's major versions had a lot of breaking changes. The migration would be more work, I knew, but developers would only have to do it once. I even wrote a guide to help people! I saw a lot more issues and questions after I did that, despite my best efforts. And I now regret it.

I think about one of the worst examples of this in our industry: the rollout of Python 3. The difference between Python 2 and Python 3 was too great, I reckon, and many people still use Python 2. I made the same mistake on a smaller scale.

Now, I try to avoid making breaking changes. Helmet's [most recent major version had a few breaking changes](https://github.com/helmetjs/helmet/blob/20fae0d8225783fd53449a782cf92901ec201ea6/CHANGELOG.md#600---2022-08-26) which I tried to keep very small. When I have grander visions, I try to roll them out over many versions and many months.

## Document your way to features

Sometimes, I've been asked to add a feature that I don't think really fits into the library. But it's still a useful idea.

For example, some users wanted to be able to conditionally use Helmet. I thought this was a useful feature, but I didn't think it should've been done in my code. But it was such a common feature request...what should I do?

I found that I could [document some example code that accomplished the goal](https://github.com/helmetjs/helmet/wiki/Conditionally-using-middleware), rather than actually adding it to the library. This helps people accomplish their goals without increasing Helmet's surface area.

I don't always think this is a useful solution, but it's worked for me in a few cases.

## Follow the tag on StackOverflow

This is a smaller tip.

A lot of programmers use Stack Overflow today. (I wish there were a popular nonprofit alternative I could recommended.)

I subscribed to [the tag for my project](https://stackoverflow.com/questions/tagged/helmet.js), so I get an email any time anyone asks a question about it. In addition to (hopefully) being useful answering questions, it's a good way to see what people struggle with.

## Micro-optimizations can matter

Over the years, I've added many little optimizations to the project's file size. These little optimizations, which deserve a full blog post, have cut the package size in half.

Without these optimizations, the package would be about 20 kilobytes larger. That doesn't sound like much, but it adds up when your project has millions of downloads. That saved about 2 terabytes of bandwidth in 2022, which I think is worth doing.

(I even [proposed adding some of these optimizations to core npm](https://github.com/npm/rfcs/pull/595), but was ultimately convinced this wasn't worth it.)

## I still have lots to learn

I've been maintaining Helmet for 9 years. I've learned a lot about maintaining it in that time, and I hope this has been helpful...but I've still got a long way to go.

Thanks to [everyone who has contributed to Helmet over the years][contributors]!

[helmet]: https://helmetjs.github.io/
[contributors]: https://helmetjs.github.io/contributors/
