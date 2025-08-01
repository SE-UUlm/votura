import { z } from 'zod/v4';
import { toJsonSchemaParams } from '../parserParams.js';
import { selectableBallotPaperObject } from './ballotPaper.js';
import { selectableBallotPaperSectionObject } from './ballotPaperSection.js';
import { selectableCandidateObject } from './candidate.js';
import { selectableElectionObject } from './election.js';

export const selectableVotingElectionObject = z.object({
  ...selectableElectionObject.omit({ createdAt: true, modifiedAt: true }).shape,
  ballotPaper: selectableBallotPaperObject
    .omit({
      createdAt: true,
      modifiedAt: true,
      electionId: true,
    })
    .extend({
      ballotPaperSections: z
        .array(
          selectableBallotPaperSectionObject
            .omit({
              createdAt: true,
              modifiedAt: true,
              ballotPaperId: true,
              candidateIds: true,
            })
            .extend({
              candidates: z
                .array(
                  selectableCandidateObject.omit({
                    createdAt: true,
                    modifiedAt: true,
                    electionId: true,
                  }),
                )
                .min(1),
            }),
        )
        .min(1),
    }),
});

export type SelectableVotingElectionObject = typeof selectableVotingElectionObject;

export const selectableVotingElectionObjectSchema = z.toJSONSchema(
  selectableVotingElectionObject,
  toJsonSchemaParams,
);
