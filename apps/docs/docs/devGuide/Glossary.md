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

Ballot paper
: A document that contains the options or candidates for which a voter can cast their vote.
A ballot paper is associated with exactly one specific election.
A ballot paper needs to have at least one ballot paper section but can also have multiple ballot paper sections.

Ballot paper section
: A part of a ballot paper that contains a specific set of candidates.

Candidate
: A person or option that is running for election.
The voter can select one or more candidates from the ballot paper section.
A candidate is linked to at least one ballot paper section but can also be linked to multiple ballot paper sections.

Election
: A process in which voters cast their votes for candidates.
An election is always associated with exactly one single decision.
In the votura application, an election is created and managed by at least one user.
An election can have multiple ballot papers but needs at least one ballot paper.

User
: A person who uses the votura application for creating and managing elections.
The user needs to be registered in the system to access the application.

Vote
: The decision made by a voter in an election.
A vote is linked to exactly one election and one voter.

Voter
: A person who is eligible to vote in an election.
A voter does not need to be registered in the system to take part in the election.
The voter receives an access code to access the election.
A voter is linked to exactly one voter group and to one or more ballot papers.
But only to one ballot paper per election, not to several ballot papers in the same election.
A voter is always linked to ballot papers and not to elections.

Voter group
: A group of voters that are all linked to the same ballot papers.
