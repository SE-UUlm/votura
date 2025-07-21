/\*\*

- Create voter group
- Body: {
- name": string,
- description": string,
- numberOfVoters": number,
- ballotPapers: uuid[]
- }
- -> Checks:
- - Authentication
- - Do ballot papers in body exist?
- - Do the ballot papers belong to the user?
  - Are the ballot papers from distinct elections?
- - Are the elections of the ballot papers not frozen?
-
- Get all voter groups for the user
- -> Checks:
- - Authentication
-
- Update a specific voter group
- Body: {
- name": string,
- description": string,
- numberOfVoters": number,
- ballotPapers: uuid[]
- }
- Parameters: {
- groupId: uuid
- }
- -> Checks:
- - Authentication
- - Does the voter group exist?
- - Does the voter group belong to the user?
- - Are the elections linked to the voter group not frozen?
- - Do ballot papers in body exist?
- - Do the ballot papers belong to the user?
  - Are the ballot papers from distinct elections?
- - Are the elections of the ballot papers not frozen?
-
- Get a specific voter group
- Parameters: {
- groupId: uuid
- }
- -> Checks:
- - Authentication
- - Does the voter group exist?
- - Does the voter group belong to the user?
-
- Delete a specific voter group
- Parameters: {
- groupId: uuid
- }
- -> Checks:
- - Authentication
- - Does the voter group exist?
- - Does the voter group belong to the user?
- - Are the elections of the linked ballot papers not frozen?
-
-
- Check groups:
- Param checks:
- - Does the voter group exist?
- - Does the voter group belong to the user?
- Body checks:
- - Do ballot papers in body exist?
- - Do the ballot papers belong to the user?
- - Are the ballot papers from distinct elections?
- Other:
- Are the elections of the ballot papers not frozen? -> parameter needs to be a list of ballot papers to check
-      - Wrap in a body check middleware (create and update)
-      - wrap in a parameter check middleware (delete)
  \*/

Put body checks in controllers

Improve checkBallotPapersElectionNotFrozen, checkBallotPapersFromDifferentElections, checkBallotPapersBelongToUser
User Kysely types (look up how to deal with Generated type)
Move handling of errors to validateInsertableVoterGroup and rename file to voterGroupChecks -> validation returns InsertableVoterGroup | null (null means to return the response)
