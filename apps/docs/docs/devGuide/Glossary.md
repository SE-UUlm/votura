---
title: Glossary
description: A glossary of terms used in the votura project.
tags:
  - Glossary
hide_table_of_contents: false
# sidebar_position: 1
draft: false
toc_min_heading_level: 2
toc_max_heading_level: 3
---

Ballot paper (BP)
: A document that contains the options or candidates for which a voter can cast their vote.
A ballot paper is associated with exactly one specific election.
A ballot paper needs to have at least one ballot paper section but can also have multiple ballot paper sections.

Ballot paper section (BPS)
: A part of a ballot paper that contains a specific set of candidates.
May be used to divide a ballot paper in multiple parts, each with its own limit of how many votes may be cast in it.

Candidate
: A person or option that is running for election.
A voter may vote for one or more candidates per ballot paper section.
A candidate must be listed in at least one ballot paper section. They may be listed in multiple ballot paper sections.

Election
: A process in which voters cast their votes for candidates.
An election always results in exactly one single decision.
In the votura application, an election is created and managed by at least one user.
An election can have multiple ballot papers but needs at least one ballot paper.

User
: A person who uses the votura application for creating and managing elections.
The user needs to be registered in the system to access the application.

Vote
: The decision made by a voter in an election.
A vote is linked to exactly one election is cast by exactly one voter.

Voter
: A person who is eligible to vote in an election.
A voter does not need to be registered in the system to take part in the election.
The voter receives a voter token to access elections.
A voter is part of exactly one voter group and may vote on one or more ballot papers.
But only to one ballot paper per election, not to several ballot papers in the same election.
A voter is always linked to ballot papers and not to elections.

Voter group
: A group of voters that are all linked to the same ballot papers.
The purpose of grouping voters is to make generating larger numbers of voter tokens for voters with the same associated ballot papers easier.

Voter token
: A JSON Web Token sent to voters to give them access to one or multiple ballot papers of one or multiple elections.
