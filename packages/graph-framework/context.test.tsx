import "@testing-library/jest-dom/vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFunctions, repo, type } from "./context.js";

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

describe("Library Tests", () => {
  // Define a sample schema
  const schema = {
    types: {
      Person: {
        name: type.Text,
        age: type.Number,
        badges: type.Relation({ types: ["Badge"], cardinality: "many" }),
      },
      User: {
        name: type.Text,
        email: type.Text,
      },
      Badge: {
        name: type.Text,
      },
      Event: {
        name: type.Text,
        participants: type.Relation({ types: ["Person"], cardinality: "many" }),
        author: type.Relation({
          types: ["User", "Person"],
          cardinality: "one",
        }),
      },
    },
  };

  // Create functions from the schema
  const {
    useCreateEntity,
    useDeleteEntity,
    useQuery,
    SpaceProvider,
    createDocumentId,
  } = createFunctions(schema);

  let repoResult = repo.create();
  let wrapper = ({ children }: { children: React.ReactNode }) => (
    <SpaceProvider id={repoResult.documentId}>{children}</SpaceProvider>
  );

  beforeEach(() => {
    repoResult = repo.create();
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <SpaceProvider id={repoResult.documentId}>{children}</SpaceProvider>
    );
  });

  it("should create a document ID", () => {
    expect([1]).toHaveLength(1);

    const { result: createResult } = renderHook(() => useCreateEntity(), {
      wrapper,
    });

    const { result: queryResult } = renderHook(
      () => useQuery({ types: ["Event"] }),
      { wrapper }
    );

    act(() => {
      createResult.current(["Event"], {
        name: "Conference",
        participants: [
          {
            name: "Alice",
            age: 30,
            badges: [{ name: "Speaker" }],
          },
          {
            name: "Bob",
            age: 25,
            badges: [{ name: "Attendee" }],
          },
        ],
        author: {
          name: "Charlie",
          email: "charlie@example.com",
        },
      });
    });

    const events = queryResult.current;
    expect(Object.keys(events)).toHaveLength(1);
  });

  it("should create and query entities with relations", () => {
    const { result: createResult } = renderHook(() => useCreateEntity(), {
      wrapper,
    });

    const { result: queryResult } = renderHook(
      () => useQuery({ types: ["Event"] }),
      { wrapper }
    );

    act(() => {
      createResult.current(["Event"], {
        name: "Conference",
        participants: [
          {
            name: "Alice",
            age: 30,
            badges: [{ name: "Speaker" }],
          },
          {
            name: "Bob",
            age: 25,
            badges: [{ name: "Attendee" }],
          },
        ],
        author: {
          name: "Charlie",
          email: "charlie@example.com",
        },
      });
    });

    // Wait for the hook to update
    const events = queryResult.current;
    expect(Object.keys(events)).toHaveLength(1);

    const event = Object.values(events)[0];
    expect(event.name).toBe("Conference");

    // Check participants
    expect(event.participants).toHaveLength(2);
    expect(event.participants[0].name).toBe("Alice");
    expect(event.participants[0].age).toBe(30);
    expect(event.participants[0].badges).toHaveLength(1);
    expect(event.participants[0].badges[0].name).toBe("Speaker");

    expect(event.participants[1].name).toBe("Bob");
    expect(event.participants[1].age).toBe(25);
    expect(event.participants[1].badges).toHaveLength(1);
    expect(event.participants[1].badges[0].name).toBe("Attendee");

    // Check author
    expect(event.author.name).toBe("Charlie");
    expect(event.author.email).toBe("charlie@example.com");
  });

  it("should create entities with nested relations and query them", () => {
    const { result: createResult } = renderHook(() => useCreateEntity(), {
      wrapper,
    });

    const { result: queryResult } = renderHook(
      () => useQuery({ types: ["Person"] }),
      { wrapper }
    );

    act(() => {
      createResult.current(["Person"], {
        name: "Dave",
        age: 40,
        badges: [{ name: "VIP" }, { name: "Contributor" }],
      });
    });

    // Wait for the hook to update
    const people = queryResult.current;
    expect(Object.keys(people)).toHaveLength(1);

    const person = Object.values(people)[0];
    expect(person.name).toBe("Dave");
    expect(person.age).toBe(40);
    expect(person.badges).toHaveLength(2);
    expect(person.badges[0].name).toBe("VIP");
    expect(person.badges[1].name).toBe("Contributor");
  });

  it("should delete an entity", () => {
    const { result: createResult } = renderHook(() => useCreateEntity(), {
      wrapper,
    });

    const { result: deleteResult } = renderHook(() => useDeleteEntity(), {
      wrapper,
    });

    const { result: queryResult } = renderHook(
      () => useQuery({ types: ["Badge"] }),
      { wrapper }
    );

    let badgeId: string | undefined;

    act(() => {
      createResult.current(["Badge"], { name: "Exclusive" });
    });

    act(() => {
      const badges = queryResult.current;
      expect(Object.keys(badges)).toHaveLength(1);
      badgeId = Object.keys(badges)[0];
    });

    act(() => {
      const success = deleteResult.current(badgeId!);
      expect(success).toBe(true);
    });

    act(() => {
      const badgesAfterDelete = queryResult.current;
      expect(Object.keys(badgesAfterDelete)).toHaveLength(0);
    });
  });

  // it("should handle circular relations gracefully", () => {
  //   const { result: createResult } = renderHook(() => useCreateEntity(), {
  //     wrapper,
  //   });

  //   const { result: queryResult } = renderHook(
  //     () => useQuery({ types: ["Person"] }),
  //     { wrapper }
  //   );

  //   let personAId: string | undefined;
  //   let personBId: string | undefined;

  //   act(() => {
  //     createResult.current(["Person"], {
  //       name: "Eve",
  //       age: 28,
  //       badges: [],
  //     });
  //   });

  //   act(() => {
  //     const people = queryResult.current;
  //     expect(Object.keys(people)).toHaveLength(1);
  //     personAId = Object.keys(people)[0];
  //   });

  //   act(() => {
  //     createResult.current(["Person"], {
  //       name: "Frank",
  //       age: 35,
  //       badges: [],
  //     });
  //   });

  //   act(() => {
  //     const people = queryResult.current;
  //     expect(Object.keys(people)).toHaveLength(2);
  //     personBId = Object.keys(people).find((id) => id !== personAId);
  //   });

  //   // Now, create a circular relation
  //   act(() => {
  //     createResult.current(["Person"], {
  //       name: "Eve",
  //       age: 28,
  //       badges: [],
  //       friend: personBId, // Assuming you have a 'friend' relation
  //     });
  //   });

  //   act(() => {
  //     const people = queryResult.current;
  //     const personA = people[personAId!];
  //     const personB = people[personBId!];

  //     // Check that circular relations are handled (this depends on your implementation)
  //     expect(personA.friend).toBeDefined();
  //     expect(personA.friend.name).toBe("Frank");
  //   });
  // });
});
