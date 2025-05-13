# Hypergraph Docs Scope

1. What does Hypergraph do, and who is it for? 
    1. Pablo
        1. Hypergraph is a full-stack application framework. It allows developers to build applications where users collaborate around public and private data/information/content. When building with Hypergraph, developers only need to write client-side software - the framework takes care of the infrastructure, including privacy (E2EE) by default and storing public content in an interoperable, interconnected Knowledge Graph.
            
            Hypergraph is for developers that want to build consumer applications, and that care about one or some of the following:
            
            1. Not having to host any infrastructure
            2. Having real-time sync of private data across users and user devices
            3. Ensuring user privacy is preserved
            4. Storing data in public knowledge graphs
            5. Building network effects in synergy with other applications, by making them interoperable
            
            This makes Hypergraph particularly suitable for devs working on multiplayer/social/collaborative applications.
            
    2. Nik: 
2. What problems does this Hypergraph solve?
    1. Pablo:
        1. As mentioned above, Hypergraph solves:
            1. Real-time sync of private data across users and devices
            2. Ensuring privacy while doing so, by applying E2EE everywhere
            3. Publishing data to public knowledge graphs
            4. Using information from public knowledge graphs
            5. All the infrastructure for the above, allowing to build an app writing only client-side software
            6. User authentication and access control for data
            7. (Once we have sufficient apps and users already on the knowledge graph) Building network effects by reusing the existing data, users and content from other apps on the knowledge graph
    2. Nik
3. How do I get started quickly? (Quickstart or Hello World)
    1. Pablo:
        1. We don’t have this yet… right now it sort of relies on cloning the repo and copying/modifying the example app. I think it would be good to have a tutorial where you start from Chris’ TypeSync app, this generates the scaffolding for you, and then you modify it and run it
    2. Nik:
4. What assumptions are we making about developers who are introduced to Hypergraph?
    1. Pablo:
        1. Probably that they can write React apps (maybe with AI help?) and TypeScript.
    2. Nik:
5. What are the core concepts devs need to understand that are new?
    1. Pablo:
        1. Using the sync server / CRDTs instead of a database for private data. For this they create a schema with the types/models for their app. Users probably don’t need to understand the details about how it works, but know how to store and read private entities and how to define the schema.
        2. Knowledge Graphs for public data instead of a DB - this is abstracted away by a “mappings” file, and ideally automated by the TypeSync app. Devs would just need to know that data has to be “published” to live in the public graph, and that they can reuse existing data from there.
        3. “Spaces” as the core grouping of users and information. Spaces are both a) a group of people and b) a topic of information/content. Users are invited to spaces to collaborate on both private and public data. Devs can use the underlying concept of a space to build different groups of users (e.g. company, organization, club, community) and also to organize different aspects of the application’s content (e.g. a space for information about each city, a space for information about different kinds of food, etc…)
    2. Nik:
6. What are the core concepts that we assume people already know? E.g. a “Framework” or “Inboxes” are known concepts.
    1. Pablo:
        1. Framework and inboxes are indeed assumed to be known, but there might be particularities of how we implemented Inboxes that could be worth talking about in docs, e.g. the fact that inboxes can either be for an account or for a space
    2. Nik:
7. What do you think will be confusing for new developers using this Hypergraph?
    1. Pablo:
        1. For users that are used to the typical ways of building apps (backend server with a SQL DB, API that is consumed by a frontend) it may take a while to wrap their heads around the fact that there’s “no backend” and “no database” in apps built with Hypergraph. It might be useful to make the analogy that the knowledge graph API and sync server infra replace the “backend” and then the knowledge graph itself and sync server storage replace the “database”.
        2. Knowing what types / data on the knowledge graph to reuse vs start from scratch could also be tricky - TypeSync is meant to help with this challenge (and also to encourage as much reuse as possible)
    2. Nik:
8. How do I integrate this into my app or system?
    1. Pablo:
        1. Right now it’s more geared towards new apps or systems… I think for an existing app it could be integrated to add collaboration features, e.g. for apps that are more web3-specific / interacting with smart contracts, it could make sense to describe Hypergraph as adding a “user content / collaboration layer” while keeping the blockchain as the “incentives” layer. Another alternative is if you want to add “privacy features” to an app, you could integrate Hypergraph to solve the end to end encryption.
    2. Nik:
9. What are common errors and how do I fix them?
    1. Pablo:
        1. We don’t know yet…
    2. Nik:
10. How is data handled — are there any security or privacy concerns?
    1. Pablo:
        1. Private data is stored encrypted on the sync servers. Only users that are members of a space can decrypt the data of that space, so the sync server does not have access to private data.
        2. Public data is stored on the knowledge graph (IPFS+blockchain). It is public so anyone can read it, but writing is protected by the access control / governance smart contract for each space.
        3. (This is WIP) End users will sign up through a “Geo Connect” app, and will be able to give each app permissions to access specific spaces (public or private). Each app will get a set of keys that allow signing/encrypting private data and also publishing public data in those specific spaces. Ideally these keys should never leave the user’s client/browser.
    2. Nik:
11. Where can I find more examples, references, or support?
    1. Pablo:
        1. We don’t have any yet
    2. Nik:
12. Key smart contract addresses?
    1. Pablo
        1. Users are not expected to interact directly with the smart contracts… each space has its own contract though, maybe Byron can point to relevant addresses
    2. Nik:
13. How can feedback be shared?
    1. Pablo
        1. Good question, maybe we could set up a feedback form?
    2. Nik:

# Hypergraph Docs Development

1. @Marcus Rein would like to use Docusaurus for these docs (It’s Markdown-first, lightweight, and dev-friendly.)
    1. Example [websites](https://docusaurus.io/showcase?tags=favorite) using Docusaurus
2. Should we deploy via GitHub Pages with a custom domain like [docs.ourproject.dev](http://docs.ourproject.dev) or should we use another hosting service?
3. Do we want versioning support now or keep it simple at first?
4. Can we organize the current .md files into sidebar sections by topic (e.g. Identity, Sync, Invites)? Most important topics?
5. Should we auto-deploy on merge to main using GitHub Actions?

