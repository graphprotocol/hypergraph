import { expect, it } from "vitest";
import { applyEvent } from "./apply-event.js";
import { createSpace } from "./create-space.js";
import { deleteSpace } from "./delete-space.js";

it("should delete a space", () => {
  const author = {
    signaturePublicKey: "signature",
    encryptionPublicKey: "encryption",
  };
  const spaceEvent = createSpace({ author });
  const state = applyEvent({ event: spaceEvent });
  const spaceEvent2 = deleteSpace({ author, id: state.id });
  const state2 = applyEvent({ state, event: spaceEvent2 });
  expect(state2).toEqual({
    id: state.id,
    members: {},
    invitations: {},
    removedMembers: {
      [author.signaturePublicKey]: {
        signaturePublicKey: author.signaturePublicKey,
        encryptionPublicKey: author.encryptionPublicKey,
        role: "admin",
      },
    },
    transactionHash: "",
  });
});
