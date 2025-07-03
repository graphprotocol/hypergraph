import type { SchemaBrowserTypesQuery } from './generated/graphql';

// data was queried on 2025-07-03
export const typesData: SchemaBrowserTypesQuery = {
  types: [
    {
      id: '42a0a761-8c82-459f-ad08-34bfeb437cde',
      name: 'Country',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              description: 'A general concept that can be used to group things of the same category together.',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
            },
          ],
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
        },
        {
          id: '1c5b7c0a-d187-425e-885c-2980d9db6b4b',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '1c5b7c0a-d187-425e-885c-2980d9db6b4b',
            name: 'Continent',
          },
        },
        {
          id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
            name: 'Related entities',
          },
        },
        {
          id: '0f1f1f2b-2383-4056-8a3a-b223be09506e',
          dataType: 'RELATION',
          entity: {
            id: '0f1f1f2b-2383-4056-8a3a-b223be09506e',
            name: 'States',
          },
          relationValueTypes: [
            {
              id: '3df12375-8de0-4f32-8e93-b0aee1d04324',
              name: 'State',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
            },
          ],
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
            },
          ],
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
        },
      ],
    },
    {
      id: '2c765cae-c1b6-4cc3-a65d-693d0a67eaeb',
      name: 'Interest',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: '5338cc28-9704-4e96-b547-7dfc58da6fc7',
      name: 'Renderable type',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '6d29d578-49bb-4959-baf7-2cc696b1671a',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '6d29d578-49bb-4959-baf7-2cc696b1671a',
            name: 'Data type',
          },
        },
      ],
    },
    {
      id: '06053fcf-6443-4dc6-80ca-8a3b173a6016',
      name: 'Root',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: '9ca6ab1f-3a11-4e49-bbaf-72e0c9a985cf',
      name: 'Skill',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
          dataType: 'RELATION',
          entity: {
            id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
            name: 'Roles',
          },
          relationValueTypes: [
            {
              id: 'e4e366e9-d555-4b68-92bf-7358e824afd2',
              name: 'Role',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
              ],
              description: 'A function a person or project can perform',
            },
          ],
        },
        {
          id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
            name: 'Related entities',
          },
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
      ],
    },
    {
      id: '37d2167f-b64a-4b68-be26-55b3608050e7',
      name: 'Academic field',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
      name: 'Person',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
            name: 'Avatar',
          },
        },
        {
          id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
          dataType: 'RELATION',
          entity: {
            id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
            name: 'Works at',
          },
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: 'e4e366e9-d555-4b68-92bf-7358e824afd2',
              name: 'Role',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
              ],
              description: 'A function a person or project can perform',
            },
          ],
          entity: {
            id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
            name: 'Roles',
          },
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
        },
        {
          id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
          ],
          entity: {
            id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
            name: 'Worked at',
          },
        },
        {
          id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
            name: 'X',
          },
        },
        {
          id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '9ca6ab1f-3a11-4e49-bbaf-72e0c9a985cf',
              name: 'Skill',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
          entity: {
            id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
            name: 'Skills',
          },
        },
      ],
    },
    {
      id: '167664f6-68f8-40e1-976b-20bd16ed8d47',
      name: 'Date & time',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: '531ac4c5-e409-46ad-9dd3-abcd2db955a0',
      name: 'Publisher',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
            name: 'Avatar',
          },
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
            name: 'Location',
          },
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
          dataType: 'RELATION',
          entity: {
            id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
            name: 'Related people',
          },
          relationValueTypes: [
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
          ],
        },
        {
          id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
          dataType: 'RELATION',
          entity: {
            id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
            name: 'Related projects',
          },
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: 'c9ed4b4b-7294-4eda-9a03-a7975cd1651e',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'c9ed4b4b-7294-4eda-9a03-a7975cd1651e',
            name: 'Owners',
          },
        },
        {
          id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
            name: 'X',
          },
        },
        {
          id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
            name: 'Website',
          },
        },
        {
          id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
            name: 'Related entities',
          },
        },
      ],
    },
    {
      id: '8275c359-4662-40fb-9aec-27177b520cd2',
      name: 'Activity',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
      ],
    },
    {
      id: '20a21dc2-7371-482f-a120-7b147f1dc319',
      name: 'View',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: 'c38c4198-10c2-4cf2-9dd5-8f194033fc31',
      name: 'Protocol',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
          dataType: 'RELATION',
          entity: {
            id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
            name: 'Roles',
          },
          relationValueTypes: [
            {
              id: 'e4e366e9-d555-4b68-92bf-7358e824afd2',
              name: 'Role',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
              ],
              description: 'A function a person or project can perform',
            },
          ],
        },
        {
          id: '617fd8a6-9215-468a-9868-7d9976bf3d85',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
          ],
          entity: {
            id: '617fd8a6-9215-468a-9868-7d9976bf3d85',
            name: 'Core devs',
          },
        },
        {
          id: '77f55135-eb75-4f53-8d79-b36913494313',
          dataType: 'RELATION',
          entity: {
            id: '77f55135-eb75-4f53-8d79-b36913494313',
            name: 'Native assets',
          },
          relationValueTypes: [
            {
              id: 'f8780a80-c238-4a2a-96cb-567d88b1aa63',
              name: 'Asset',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: 'Something that can be owned and can usually be transferred, bought and sold.',
            },
          ],
        },
      ],
    },
    {
      id: 'e550fe51-7e90-4b2c-8fff-df13408f5634',
      name: 'News story',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
          ],
          entity: {
            id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
            name: 'Related projects',
          },
        },
        {
          id: '2877c1c3-d2ad-493f-abe7-6e1bb16e1c37',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '2877c1c3-d2ad-493f-abe7-6e1bb16e1c37',
            name: 'Disclaimer',
          },
        },
        {
          id: 'e9fa6d66-d839-4045-88bb-5f7d7c675ce6',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              name: 'Project',
            },
          ],
          entity: {
            id: 'e9fa6d66-d839-4045-88bb-5f7d7c675ce6',
            name: 'Maintainers',
          },
        },
        {
          id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
          dataType: 'RELATION',
          entity: {
            id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
            name: 'Related people',
          },
          relationValueTypes: [
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
          ],
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
        },
        {
          id: '49c5d5e1-679a-4dbd-bfd3-3f618f227c94',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '49c5d5e1-679a-4dbd-bfd3-3f618f227c94',
            name: 'Sources',
          },
        },
        {
          id: '94e43fe8-faf2-4100-9eb8-87ab4f999723',
          dataType: 'TIME',
          relationValueTypes: [],
          entity: {
            id: '94e43fe8-faf2-4100-9eb8-87ab4f999723',
            name: 'Publish date',
          },
        },
        {
          id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
            name: 'Location',
          },
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
        },
        {
          id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
            name: 'Related entities',
          },
        },
      ],
    },
    {
      id: 'b8803a86-65de-412b-bb35-7e0c84adf473',
      name: 'Data block',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: '302ab815-c11f-4357-8e6c-71990a30c992',
      name: 'Improvement proposal',
      properties: [
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
        },
        {
          id: '355acff4-251d-4b94-8894-0db0364f285b',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '355acff4-251d-4b94-8894-0db0364f285b',
            name: 'Discussion link',
          },
        },
        {
          id: '94e43fe8-faf2-4100-9eb8-87ab4f999723',
          dataType: 'TIME',
          relationValueTypes: [],
          entity: {
            id: '94e43fe8-faf2-4100-9eb8-87ab4f999723',
            name: 'Publish date',
          },
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
        },
        {
          id: 'f54a8163-2f4c-44a8-a6a5-d7b97ec0370e',
          dataType: 'RELATION',
          entity: {
            id: 'f54a8163-2f4c-44a8-a6a5-d7b97ec0370e',
            name: 'Status',
          },
          relationValueTypes: [
            {
              id: '230f76cc-abb7-460c-9b56-eab43ec10172',
              name: 'Status',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: 'a945fa95-d15e-42bc-b70a-43d3933048dd',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'a945fa95-d15e-42bc-b70a-43d3933048dd',
            name: 'Network',
          },
        },
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '412ff593-e915-4012-a43d-4c27ec5c68b6',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '412ff593-e915-4012-a43d-4c27ec5c68b6',
            name: 'Web URL',
          },
        },
        {
          id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
            name: 'Avatar',
          },
        },
        {
          id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
          ],
          entity: {
            id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
            name: 'Related projects',
          },
        },
        {
          id: '40fa9ceb-889b-4f77-bf6e-f530c02b2556',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '40fa9ceb-889b-4f77-bf6e-f530c02b2556',
            name: 'Abstract',
          },
        },
      ],
    },
    {
      id: 'cb69723f-7456-471a-a8ad-3e93ddc3edfe',
      name: 'Account',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: 'a945fa95-d15e-42bc-b70a-43d3933048dd',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'a945fa95-d15e-42bc-b70a-43d3933048dd',
            name: 'Network',
          },
        },
        {
          id: '85cebdf1-d84f-4afd-993b-35f182096b59',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '85cebdf1-d84f-4afd-993b-35f182096b59',
            name: 'Address',
          },
        },
      ],
    },
    {
      id: '96f859ef-a1ca-4b22-9372-c86ad58b694b',
      name: 'Claim',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
          dataType: 'RELATION',
          entity: {
            id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
            name: 'Related people',
          },
          relationValueTypes: [
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
          ],
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
          dataType: 'RELATION',
          entity: {
            id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
            name: 'Related projects',
          },
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
            name: 'Location',
          },
        },
        {
          id: '1dc6a843-4588-4819-8e7a-6e672268f811',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '1dc6a843-4588-4819-8e7a-6e672268f811',
            name: 'Supporting arguments',
          },
        },
        {
          id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
            name: 'Related entities',
          },
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '4e6ec5d1-4292-498a-84e5-f607ca1a08ce',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '4e6ec5d1-4292-498a-84e5-f607ca1a08ce',
            name: 'Opposing arguments',
          },
        },
        {
          id: '49c5d5e1-679a-4dbd-bfd3-3f618f227c94',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '49c5d5e1-679a-4dbd-bfd3-3f618f227c94',
            name: 'Sources',
          },
        },
        {
          id: 'f9eeaf9d-9eb7-41b1-ac5d-257c6e82e526',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'f9eeaf9d-9eb7-41b1-ac5d-257c6e82e526',
            name: 'Quotes that support claims',
          },
        },
      ],
    },
    {
      id: '4b6d9fc1-fbfe-474c-861c-83398e1b50d9',
      name: 'Relation',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '9eea393f-17dd-4971-a62e-a603e8bfec20',
          dataType: 'RELATION',
          entity: {
            id: '9eea393f-17dd-4971-a62e-a603e8bfec20',
            name: 'Relation value types',
          },
          relationValueTypes: [
            {
              id: 'e7d737c5-3676-4c60-9fa1-6aa64a8c90ad',
              name: 'Type',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: 'cf37cd59-840c-4dac-a22b-9d9dde536ea7',
                  dataType: 'RELATION',
                  entity: {
                    id: 'cf37cd59-840c-4dac-a22b-9d9dde536ea7',
                    name: 'Template',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '01412f83-8189-4ab1-8365-65c7fd358cc1',
                  dataType: 'RELATION',
                  entity: {
                    id: '01412f83-8189-4ab1-8365-65c7fd358cc1',
                    name: 'Properties',
                  },
                },
              ],
              description: null,
            },
          ],
        },
      ],
    },
    {
      id: '783bc688-e65f-4e54-b67f-a5643d78345e',
      name: 'Place',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '83dd3291-2593-4cde-a510-2ddb71d688db',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: 'c188844a-7224-42ab-b476-2991c9c913f1',
              name: 'Region',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1c5b7c0a-d187-425e-885c-2980d9db6b4b',
                  dataType: 'RELATION',
                  entity: {
                    id: '1c5b7c0a-d187-425e-885c-2980d9db6b4b',
                    name: 'Continent',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
          entity: {
            id: '83dd3291-2593-4cde-a510-2ddb71d688db',
            name: 'Regions',
          },
        },
        {
          id: '72ba2a0f-729d-4847-925d-f3b09d46bb66',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '72ba2a0f-729d-4847-925d-f3b09d46bb66',
            name: 'Address',
          },
        },
      ],
    },
    {
      id: '603d1fe4-306a-4c6f-a0c3-d53dbf891352',
      name: 'Public figure',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
      ],
    },
    {
      id: '808a04ce-b21c-4d88-8ad1-2e240613e5ca',
      name: 'Property',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: 'ee26ef23-f7f1-4eb6-b742-3b0fa38c1fd8',
          dataType: 'RELATION',
          entity: {
            id: 'ee26ef23-f7f1-4eb6-b742-3b0fa38c1fd8',
            name: 'Value type',
          },
          relationValueTypes: [
            {
              id: 'a35e058b-52d1-48d2-b02d-773933d90b7e',
              name: 'Native type',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: 'd2c1a101-14e3-464a-8272-f4e75b0f1407',
          dataType: 'CHECKBOX',
          relationValueTypes: [],
          entity: {
            id: 'd2c1a101-14e3-464a-8272-f4e75b0f1407',
            name: 'Is type property',
          },
        },
      ],
    },
    {
      id: 'f8780a80-c238-4a2a-96cb-567d88b1aa63',
      name: 'Asset',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: 'f503bfd2-83d7-4e1a-9b30-294fff9d2d7e',
      name: 'Employment type',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
      name: 'Works at',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: 'c3445f6b-e2c0-4f25-b73a-5eb876c4f50c',
          dataType: 'TIME',
          relationValueTypes: [],
          entity: {
            id: 'c3445f6b-e2c0-4f25-b73a-5eb876c4f50c',
            name: 'End time',
          },
        },
        {
          id: '2d696bf0-510f-403e-985b-8cd1e73feb9b',
          dataType: 'TIME',
          relationValueTypes: [],
          entity: {
            id: '2d696bf0-510f-403e-985b-8cd1e73feb9b',
            name: 'Start time',
          },
        },
        {
          id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
          dataType: 'RELATION',
          entity: {
            id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
            name: 'Roles',
          },
          relationValueTypes: [
            {
              id: 'e4e366e9-d555-4b68-92bf-7358e824afd2',
              name: 'Role',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
              ],
              description: 'A function a person or project can perform',
            },
          ],
        },
      ],
    },
    {
      id: 'e4e366e9-d555-4b68-92bf-7358e824afd2',
      name: 'Role',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
          dataType: 'RELATION',
          entity: {
            id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
            name: 'Skills',
          },
          relationValueTypes: [
            {
              id: '9ca6ab1f-3a11-4e49-bbaf-72e0c9a985cf',
              name: 'Skill',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
            name: 'Related entities',
          },
        },
      ],
    },
    {
      id: 'c7a192a3-3909-4572-a848-a56b64dc4636',
      name: 'Nonprofit',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: 'a35e058b-52d1-48d2-b02d-773933d90b7e',
      name: 'Native type',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: '7f237bdd-d95f-4d3f-8686-f52a5dd29386',
      name: 'Policy',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
            name: 'Related entities',
          },
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
      ],
    },
    {
      id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
      name: 'Tag',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
      ],
    },
    {
      id: '9edb6fcc-e454-4aa5-8611-39d7f024c010',
      name: 'Text',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: '480e3fc2-67f3-4993-85fb-acdf4ddeaa6b',
      name: 'Page',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: '230f76cc-abb7-460c-9b56-eab43ec10172',
      name: 'Status',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: 'fb1551b2-1816-46eb-8919-c73253c32022',
      name: 'Value',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: '0f526048-26cf-40d6-8bab-967e5fb1a08a',
      name: 'Principle',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: 'bb9a85bd-6dc6-4efd-8232-e2782cb4b5f8',
      name: 'News event',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
          dataType: 'RELATION',
          entity: {
            id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
            name: 'Related projects',
          },
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
            name: 'Related entities',
          },
        },
        {
          id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
            name: 'Avatar',
          },
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '49c5d5e1-679a-4dbd-bfd3-3f618f227c94',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '49c5d5e1-679a-4dbd-bfd3-3f618f227c94',
            name: 'Sources',
          },
        },
        {
          id: '52665f3e-fb7d-48d5-8b6b-abb21b0d36db',
          dataType: 'TIME',
          relationValueTypes: [],
          entity: {
            id: '52665f3e-fb7d-48d5-8b6b-abb21b0d36db',
            name: 'Date',
          },
        },
        {
          id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
          dataType: 'RELATION',
          entity: {
            id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
            name: 'Related people',
          },
          relationValueTypes: [
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
          ],
        },
        {
          id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
            name: 'Location',
          },
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
      ],
    },
    {
      id: '1baae8e9-1870-41fb-8e2a-1eb1f84ba0d4',
      name: 'Lesson',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: 'f3d44614-86b7-4d25-83d8-9709c9d84f65',
      name: 'Post',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
            name: 'Related entities',
          },
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: '94e43fe8-faf2-4100-9eb8-87ab4f999723',
          dataType: 'TIME',
          relationValueTypes: [],
          entity: {
            id: '94e43fe8-faf2-4100-9eb8-87ab4f999723',
            name: 'Publish date',
          },
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '412ff593-e915-4012-a43d-4c27ec5c68b6',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '412ff593-e915-4012-a43d-4c27ec5c68b6',
            name: 'Web URL',
          },
        },
        {
          id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
            name: 'Avatar',
          },
        },
        {
          id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
          dataType: 'RELATION',
          entity: {
            id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
            name: 'Related people',
          },
          relationValueTypes: [
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
          ],
        },
        {
          id: '91a9e2f6-e51a-48f7-9976-61de8561b690',
          dataType: 'RELATION',
          entity: {
            id: '91a9e2f6-e51a-48f7-9976-61de8561b690',
            name: 'Authors',
          },
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
          ],
        },
        {
          id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
          dataType: 'RELATION',
          entity: {
            id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
            name: 'Related projects',
          },
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
          ],
        },
      ],
    },
    {
      id: 'c188844a-7224-42ab-b476-2991c9c913f1',
      name: 'Region',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '1c5b7c0a-d187-425e-885c-2980d9db6b4b',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '1c5b7c0a-d187-425e-885c-2980d9db6b4b',
            name: 'Continent',
          },
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
      ],
    },
    {
      id: '7aa4792e-eacd-4186-8272-fa7fc18298ac',
      name: 'Checkbox',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: 'ae724b56-8725-4a09-8d7e-a542bc587ebd',
      name: 'Course',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
          dataType: 'RELATION',
          entity: {
            id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
            name: 'Skills',
          },
          relationValueTypes: [
            {
              id: '9ca6ab1f-3a11-4e49-bbaf-72e0c9a985cf',
              name: 'Skill',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
          dataType: 'RELATION',
          entity: {
            id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
            name: 'Roles',
          },
          relationValueTypes: [
            {
              id: 'e4e366e9-d555-4b68-92bf-7358e824afd2',
              name: 'Role',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
              ],
              description: 'A function a person or project can perform',
            },
          ],
        },
        {
          id: '1e4e6986-aea4-481e-ba29-ab0677b6d514',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '1baae8e9-1870-41fb-8e2a-1eb1f84ba0d4',
              name: 'Lesson',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: 'An educational session focused on teaching specific knowledge or skills.',
            },
          ],
          entity: {
            id: '1e4e6986-aea4-481e-ba29-ab0677b6d514',
            name: 'Lessons',
          },
        },
        {
          id: '2b167901-66f8-40b6-b60e-de0ce01fe4ba',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '1845ee99-80c6-48a3-abc3-809de1753c63',
              name: 'Goal',
              description: 'A specific outcome that provides direction and motivates actions toward a desired result.',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: 'ef0edbba-6987-4057-b616-836483df2344',
                  dataType: 'RELATION',
                  entity: {
                    id: 'ef0edbba-6987-4057-b616-836483df2344',
                    name: 'Subgoals',
                  },
                },
                {
                  id: '7072d8d0-3136-4993-9ae5-dacae05e25f9',
                  dataType: 'RELATION',
                  entity: {
                    id: '7072d8d0-3136-4993-9ae5-dacae05e25f9',
                    name: 'Broader goals',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
              ],
            },
          ],
          entity: {
            id: '2b167901-66f8-40b6-b60e-de0ce01fe4ba',
            name: 'Goals',
          },
        },
        {
          id: '458fbc07-0dbf-4c92-8f57-16f3fdde7c32',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '458fbc07-0dbf-4c92-8f57-16f3fdde7c32',
            name: 'Topics',
          },
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
      ],
    },
    {
      id: 'caf1d890-855b-452b-97e2-5769daadeb1b',
      name: 'Fulltime',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: 'e7d737c5-3676-4c60-9fa1-6aa64a8c90ad',
      name: 'Type',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: 'cf37cd59-840c-4dac-a22b-9d9dde536ea7',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'cf37cd59-840c-4dac-a22b-9d9dde536ea7',
            name: 'Template',
          },
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '01412f83-8189-4ab1-8365-65c7fd358cc1',
          dataType: 'RELATION',
          entity: {
            id: '01412f83-8189-4ab1-8365-65c7fd358cc1',
            name: 'Properties',
          },
          relationValueTypes: [
            {
              id: '808a04ce-b21c-4d88-8ad1-2e240613e5ca',
              name: 'Property',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: 'ee26ef23-f7f1-4eb6-b742-3b0fa38c1fd8',
                  dataType: 'RELATION',
                  entity: {
                    id: 'ee26ef23-f7f1-4eb6-b742-3b0fa38c1fd8',
                    name: 'Value type',
                  },
                },
                {
                  id: 'd2c1a101-14e3-464a-8272-f4e75b0f1407',
                  dataType: 'CHECKBOX',
                  entity: {
                    id: 'd2c1a101-14e3-464a-8272-f4e75b0f1407',
                    name: 'Is type property',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: '1845ee99-80c6-48a3-abc3-809de1753c63',
      name: 'Goal',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: 'ef0edbba-6987-4057-b616-836483df2344',
          dataType: 'RELATION',
          entity: {
            id: 'ef0edbba-6987-4057-b616-836483df2344',
            name: 'Subgoals',
          },
          relationValueTypes: [
            {
              id: '1845ee99-80c6-48a3-abc3-809de1753c63',
              name: 'Goal',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: 'ef0edbba-6987-4057-b616-836483df2344',
                  dataType: 'RELATION',
                  entity: {
                    id: 'ef0edbba-6987-4057-b616-836483df2344',
                    name: 'Subgoals',
                  },
                },
                {
                  id: '7072d8d0-3136-4993-9ae5-dacae05e25f9',
                  dataType: 'RELATION',
                  entity: {
                    id: '7072d8d0-3136-4993-9ae5-dacae05e25f9',
                    name: 'Broader goals',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
              ],
              description: 'A specific outcome that provides direction and motivates actions toward a desired result.',
            },
          ],
        },
        {
          id: '7072d8d0-3136-4993-9ae5-dacae05e25f9',
          dataType: 'RELATION',
          entity: {
            id: '7072d8d0-3136-4993-9ae5-dacae05e25f9',
            name: 'Broader goals',
          },
          relationValueTypes: [
            {
              id: '1845ee99-80c6-48a3-abc3-809de1753c63',
              name: 'Goal',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: 'ef0edbba-6987-4057-b616-836483df2344',
                  dataType: 'RELATION',
                  entity: {
                    id: 'ef0edbba-6987-4057-b616-836483df2344',
                    name: 'Subgoals',
                  },
                },
                {
                  id: '7072d8d0-3136-4993-9ae5-dacae05e25f9',
                  dataType: 'RELATION',
                  entity: {
                    id: '7072d8d0-3136-4993-9ae5-dacae05e25f9',
                    name: 'Broader goals',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
              ],
              description: 'A specific outcome that provides direction and motivates actions toward a desired result.',
            },
          ],
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
            name: 'Related entities',
          },
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
      ],
    },
    {
      id: '49c5d5e1-679a-4dbd-bfd3-3f618f227c94',
      name: 'Sources',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '5e92c8a4-1714-4ee7-9a09-389ef4336aeb',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '5e92c8a4-1714-4ee7-9a09-389ef4336aeb',
            name: 'Source database identifier',
          },
        },
        {
          id: '198150d0-8f4e-410a-9329-9aab3ac3c1e3',
          dataType: 'RELATION',
          entity: {
            id: '198150d0-8f4e-410a-9329-9aab3ac3c1e3',
            name: 'Properties sourced',
          },
          relationValueTypes: [
            {
              id: '808a04ce-b21c-4d88-8ad1-2e240613e5ca',
              name: 'Property',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: 'ee26ef23-f7f1-4eb6-b742-3b0fa38c1fd8',
                  dataType: 'RELATION',
                  entity: {
                    id: 'ee26ef23-f7f1-4eb6-b742-3b0fa38c1fd8',
                    name: 'Value type',
                  },
                },
                {
                  id: 'd2c1a101-14e3-464a-8272-f4e75b0f1407',
                  dataType: 'CHECKBOX',
                  entity: {
                    id: 'd2c1a101-14e3-464a-8272-f4e75b0f1407',
                    name: 'Is type property',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: '9291e563-afbe-4709-8780-a52cbb0f4aa9',
      name: 'Currency',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: 'ace1e96c-9b83-47b4-bd33-1d302ec0a0f5',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'ace1e96c-9b83-47b4-bd33-1d302ec0a0f5',
            name: 'Symbol',
          },
        },
        {
          id: 'd9ada086-52e3-4b66-8893-0ccf2f9fd9ea',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'd9ada086-52e3-4b66-8893-0ccf2f9fd9ea',
            name: 'Sign',
          },
        },
      ],
    },
    {
      id: '9b597aae-c31c-46c8-8565-a370da0c2a65',
      name: 'Number',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
      name: 'Topic',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
          dataType: 'RELATION',
          entity: {
            id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
            name: 'Related projects',
          },
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
            name: 'Subtopics',
          },
        },
        {
          id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
          dataType: 'RELATION',
          entity: {
            id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
            name: 'Related people',
          },
          relationValueTypes: [
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
          ],
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
            name: 'Related entities',
          },
        },
        {
          id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
            name: 'Broader topics',
          },
        },
      ],
    },
    {
      id: 'a2a5ed0c-acef-46b1-835d-e457956ce915',
      name: 'Coinbase, NEAR, Others Form Alliance to Develop Open AI Services',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '91a9e2f6-e51a-48f7-9976-61de8561b690',
          dataType: 'RELATION',
          entity: {
            id: '91a9e2f6-e51a-48f7-9976-61de8561b690',
            name: 'Authors',
          },
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
          ],
        },
        {
          id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
          dataType: 'RELATION',
          entity: {
            id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
            name: 'Related people',
          },
          relationValueTypes: [
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
          ],
        },
        {
          id: '54aa3b25-c45d-4974-a937-6bb895aeaefe',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '54aa3b25-c45d-4974-a937-6bb895aeaefe',
            name: 'Web archive URL',
          },
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
          dataType: 'RELATION',
          entity: {
            id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
            name: 'Related projects',
          },
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
            name: 'Related entities',
          },
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
            name: 'Avatar',
          },
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '412ff593-e915-4012-a43d-4c27ec5c68b6',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '412ff593-e915-4012-a43d-4c27ec5c68b6',
            name: 'Web URL',
          },
        },
        {
          id: '94e43fe8-faf2-4100-9eb8-87ab4f999723',
          dataType: 'TIME',
          relationValueTypes: [],
          entity: {
            id: '94e43fe8-faf2-4100-9eb8-87ab4f999723',
            name: 'Publish date',
          },
        },
        {
          id: '0a62474e-3a3f-4c86-b507-6ea582439dd1',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '0a62474e-3a3f-4c86-b507-6ea582439dd1',
            name: 'Highlighted entities',
          },
        },
        {
          id: '9ec2b47e-4819-47c0-a99e-8ddb27a3ed8e',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
          ],
          entity: {
            id: '9ec2b47e-4819-47c0-a99e-8ddb27a3ed8e',
            name: 'Publisher',
          },
        },
      ],
    },
    {
      id: '872cb6f6-926d-4bb3-9d63-ccede27232b8',
      name: 'DAO',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
      name: 'Space',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: '4318a1d2-c441-455c-b765-44049c45e6cf',
      name: 'Question',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: '49c5d5e1-679a-4dbd-bfd3-3f618f227c94',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '49c5d5e1-679a-4dbd-bfd3-3f618f227c94',
            name: 'Sources',
          },
        },
        {
          id: '73609ae8-644c-4463-a50a-90a3ee585746',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '73609ae8-644c-4463-a50a-90a3ee585746',
            name: 'Answers',
          },
        },
      ],
    },
    {
      id: '76474f2f-0089-4e77-a041-0b39fb17d0bf',
      name: 'Text block',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: 'e3e363d1-dd29-4ccb-8e6f-f3b76d99bc33',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'e3e363d1-dd29-4ccb-8e6f-f3b76d99bc33',
            name: 'Markdown content',
          },
        },
      ],
    },
    {
      id: '5c6e72fb-8340-47c0-8281-8be159ecd495',
      name: 'Address',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '5648dbdc-c09d-4d27-a840-5c50d8355268',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '01b05333-941a-4b00-bc78-fac5a15b467d',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '6d8cd471-f7af-415f-9411-18b1ef106434',
                  dataType: 'RELATION',
                  entity: {
                    id: '6d8cd471-f7af-415f-9411-18b1ef106434',
                    name: 'Country',
                  },
                },
                {
                  id: '47b55f87-c5ca-4b2d-b1ac-32296fd0c650',
                  dataType: 'RELATION',
                  entity: {
                    id: '47b55f87-c5ca-4b2d-b1ac-32296fd0c650',
                    name: 'State',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'fa8fbad0-101c-4020-8d9b-dde11a381bdb',
                  dataType: 'RELATION',
                  entity: {
                    id: 'fa8fbad0-101c-4020-8d9b-dde11a381bdb',
                    name: 'County',
                  },
                },
              ],
              name: 'City',
              description: null,
            },
          ],
          entity: {
            id: '5648dbdc-c09d-4d27-a840-5c50d8355268',
            name: 'City',
          },
        },
        {
          id: '47b55f87-c5ca-4b2d-b1ac-32296fd0c650',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '47b55f87-c5ca-4b2d-b1ac-32296fd0c650',
            name: 'State',
          },
        },
        {
          id: '50371e54-a068-4bc7-886c-16bc7de15a3b',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '50371e54-a068-4bc7-886c-16bc7de15a3b',
            name: 'Address line 2',
          },
        },
        {
          id: '7cfc4990-e068-4b77-98aa-834137d02953',
          dataType: 'POINT',
          relationValueTypes: [],
          entity: {
            id: '7cfc4990-e068-4b77-98aa-834137d02953',
            name: 'Geo location',
          },
        },
        {
          id: '6d8cd471-f7af-415f-9411-18b1ef106434',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '6d8cd471-f7af-415f-9411-18b1ef106434',
            name: 'Country',
          },
        },
        {
          id: 'd378e881-3ed9-4a60-b552-43ce64dac439',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'd378e881-3ed9-4a60-b552-43ce64dac439',
            name: 'Address line 1',
          },
        },
        {
          id: 'a5de82d0-80d4-45aa-a76b-76baf2864dcc',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a5de82d0-80d4-45aa-a76b-76baf2864dcc',
            name: 'ZIP code',
          },
        },
      ],
    },
    {
      id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
      name: 'Project',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
            name: 'X',
          },
        },
        {
          id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
            name: 'Website',
          },
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
            name: 'Avatar',
          },
        },
      ],
    },
    {
      id: '9959eb50-b029-4a15-8557-b39318cbb91b',
      name: 'Academic field',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: '5ab7946f-82bc-4289-9d02-a5f13bd40935',
      name: 'Job',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: 'e3a96728-2b09-4af7-9af7-86ef1aa7837e',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'e3a96728-2b09-4af7-9af7-86ef1aa7837e',
            name: 'Project',
          },
        },
        {
          id: 'eb1141ae-ba35-43df-acdd-3329cccd8121',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'eb1141ae-ba35-43df-acdd-3329cccd8121',
            name: 'Person',
          },
        },
        {
          id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
          dataType: 'RELATION',
          entity: {
            id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
            name: 'Roles',
          },
          relationValueTypes: [
            {
              id: 'e4e366e9-d555-4b68-92bf-7358e824afd2',
              name: 'Role',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
              ],
              description: 'A function a person or project can perform',
            },
          ],
        },
      ],
    },
    {
      id: 'e059a29e-6f6b-437b-bc15-c7983d078c0d',
      name: 'Company',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '7f397325-170e-4e2a-8f9b-e7d3c8715ef6',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: 'd94df755-02ff-40c1-8169-ce0e65377ebe',
              name: 'Team',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: 'A small group of people working together with a shared goal and area of ownership.',
            },
          ],
          entity: {
            id: '7f397325-170e-4e2a-8f9b-e7d3c8715ef6',
            name: 'Teams',
          },
        },
        {
          id: 'a09625a4-b984-4876-8f0d-a28a65e47f85',
          dataType: 'RELATION',
          relationValueTypes: [
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
          ],
          entity: {
            id: 'a09625a4-b984-4876-8f0d-a28a65e47f85',
            name: 'Team members',
          },
        },
      ],
    },
    {
      id: 'e3817941-7409-4df1-b519-1f3f1a0721e8',
      name: 'Image block',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '8a743832-c094-4a62-b665-0c3cc2f9c7bc',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '8a743832-c094-4a62-b665-0c3cc2f9c7bc',
            name: 'Image URL',
          },
        },
      ],
    },
    {
      id: 'd94df755-02ff-40c1-8169-ce0e65377ebe',
      name: 'Team',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: 'fca08431-1aa1-40f2-8a4d-0743c2a59df7',
      name: 'Network',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: 'ba4e4146-0010-499d-a0a3-caaa7f579d0e',
      name: 'Image',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '8a743832-c094-4a62-b665-0c3cc2f9c7bc',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '8a743832-c094-4a62-b665-0c3cc2f9c7bc',
            name: 'Image URL',
          },
        },
      ],
    },
    {
      id: 'c167ef23-fb2a-4044-9ed9-45123ce7d2a9',
      name: 'Relation',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: 'c1f4cb6f-ece4-4c3c-a447-ab005b756972',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'c1f4cb6f-ece4-4c3c-a447-ab005b756972',
            name: 'To',
          },
        },
        {
          id: 'c43b537b-cff7-4271-8822-717fdf2c9c01',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'c43b537b-cff7-4271-8822-717fdf2c9c01',
            name: 'From',
          },
        },
        {
          id: 'ede47e69-30b0-4499-8ea4-aafbda449609',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'ede47e69-30b0-4499-8ea4-aafbda449609',
            name: 'Index',
          },
        },
        {
          id: '14611456-b466-4cab-920d-2245f59ce828',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '14611456-b466-4cab-920d-2245f59ce828',
            name: 'Relation type',
          },
        },
      ],
    },
    {
      id: '043a171c-6918-4dc3-a7db-b8471ca6fcc2',
      name: 'Quote',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '91a9e2f6-e51a-48f7-9976-61de8561b690',
          dataType: 'RELATION',
          entity: {
            id: '91a9e2f6-e51a-48f7-9976-61de8561b690',
            name: 'Authors',
          },
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
          ],
        },
        {
          id: '49c5d5e1-679a-4dbd-bfd3-3f618f227c94',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '49c5d5e1-679a-4dbd-bfd3-3f618f227c94',
            name: 'Sources',
          },
        },
        {
          id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
            name: 'Related entities',
          },
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
          dataType: 'RELATION',
          entity: {
            id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
            name: 'Related people',
          },
          relationValueTypes: [
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
          ],
        },
        {
          id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
          dataType: 'RELATION',
          entity: {
            id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
            name: 'Related projects',
          },
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
      ],
    },
    {
      id: '4d876b81-787e-41fc-ab5d-075d4da66a3f',
      name: 'Event',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: 'da8723a3-fcab-4199-b7fd-aeb99fc7ba39',
          dataType: 'RELATION',
          entity: {
            id: 'da8723a3-fcab-4199-b7fd-aeb99fc7ba39',
            name: 'Side events',
          },
          relationValueTypes: [
            {
              id: '4d876b81-787e-41fc-ab5d-075d4da66a3f',
              name: 'Event',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: 'da8723a3-fcab-4199-b7fd-aeb99fc7ba39',
                  dataType: 'RELATION',
                  entity: {
                    id: 'da8723a3-fcab-4199-b7fd-aeb99fc7ba39',
                    name: 'Side events',
                  },
                },
                {
                  id: 'f28bbb6b-f4e8-465d-9de7-a09085e224b9',
                  dataType: 'RELATION',
                  entity: {
                    id: 'f28bbb6b-f4e8-465d-9de7-a09085e224b9',
                    name: 'Venue',
                  },
                },
                {
                  id: 'c3445f6b-e2c0-4f25-b73a-5eb876c4f50c',
                  dataType: 'TIME',
                  entity: {
                    id: 'c3445f6b-e2c0-4f25-b73a-5eb876c4f50c',
                    name: 'End time',
                  },
                },
                {
                  id: 'c4c88260-ea3a-4498-a2f9-be340a19758e',
                  dataType: 'RELATION',
                  entity: {
                    id: 'c4c88260-ea3a-4498-a2f9-be340a19758e',
                    name: 'Countries',
                  },
                },
                {
                  id: '0d68798b-6bcc-4bbc-90e4-f76ecc1180a8',
                  dataType: 'RELATION',
                  entity: {
                    id: '0d68798b-6bcc-4bbc-90e4-f76ecc1180a8',
                    name: 'Speakers',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '2d696bf0-510f-403e-985b-8cd1e73feb9b',
                  dataType: 'TIME',
                  entity: {
                    id: '2d696bf0-510f-403e-985b-8cd1e73feb9b',
                    name: 'Start time',
                  },
                },
                {
                  id: 'da616b5a-e6f1-4e62-9b11-de7e081a26fa',
                  dataType: 'RELATION',
                  entity: {
                    id: 'da616b5a-e6f1-4e62-9b11-de7e081a26fa',
                    name: 'Organizers',
                  },
                },
                {
                  id: '2282fece-7494-40d6-bcdc-aad2355c40fb',
                  dataType: 'RELATION',
                  entity: {
                    id: '2282fece-7494-40d6-bcdc-aad2355c40fb',
                    name: 'Cities',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '94b54a11-85e3-4c52-867a-ad5c45380ebe',
                  dataType: 'RELATION',
                  entity: {
                    id: '94b54a11-85e3-4c52-867a-ad5c45380ebe',
                    name: 'Sponsors',
                  },
                },
                {
                  id: 'b94c4d15-6aba-4441-abde-f40f173f33b8',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b94c4d15-6aba-4441-abde-f40f173f33b8',
                    name: 'Parent event',
                  },
                },
                {
                  id: '72ba2a0f-729d-4847-925d-f3b09d46bb66',
                  dataType: 'RELATION',
                  entity: {
                    id: '72ba2a0f-729d-4847-925d-f3b09d46bb66',
                    name: 'Address',
                  },
                },
                {
                  id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
                  dataType: 'TEXT',
                  entity: {
                    id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
                    name: 'Location',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: 'f28bbb6b-f4e8-465d-9de7-a09085e224b9',
          dataType: 'RELATION',
          entity: {
            id: 'f28bbb6b-f4e8-465d-9de7-a09085e224b9',
            name: 'Venue',
          },
          relationValueTypes: [
            {
              id: '783bc688-e65f-4e54-b67f-a5643d78345e',
              name: 'Place',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '83dd3291-2593-4cde-a510-2ddb71d688db',
                  dataType: 'RELATION',
                  entity: {
                    id: '83dd3291-2593-4cde-a510-2ddb71d688db',
                    name: 'Regions',
                  },
                },
                {
                  id: '72ba2a0f-729d-4847-925d-f3b09d46bb66',
                  dataType: 'RELATION',
                  entity: {
                    id: '72ba2a0f-729d-4847-925d-f3b09d46bb66',
                    name: 'Address',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'c3445f6b-e2c0-4f25-b73a-5eb876c4f50c',
          dataType: 'TIME',
          relationValueTypes: [],
          entity: {
            id: 'c3445f6b-e2c0-4f25-b73a-5eb876c4f50c',
            name: 'End time',
          },
        },
        {
          id: 'c4c88260-ea3a-4498-a2f9-be340a19758e',
          dataType: 'RELATION',
          entity: {
            id: 'c4c88260-ea3a-4498-a2f9-be340a19758e',
            name: 'Countries',
          },
          relationValueTypes: [
            {
              id: '42a0a761-8c82-459f-ad08-34bfeb437cde',
              name: 'Country',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '1c5b7c0a-d187-425e-885c-2980d9db6b4b',
                  dataType: 'RELATION',
                  entity: {
                    id: '1c5b7c0a-d187-425e-885c-2980d9db6b4b',
                    name: 'Continent',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: '0f1f1f2b-2383-4056-8a3a-b223be09506e',
                  dataType: 'RELATION',
                  entity: {
                    id: '0f1f1f2b-2383-4056-8a3a-b223be09506e',
                    name: 'States',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
            },
          ],
        },
        {
          id: '0d68798b-6bcc-4bbc-90e4-f76ecc1180a8',
          dataType: 'RELATION',
          entity: {
            id: '0d68798b-6bcc-4bbc-90e4-f76ecc1180a8',
            name: 'Speakers',
          },
          relationValueTypes: [
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
          ],
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '2d696bf0-510f-403e-985b-8cd1e73feb9b',
          dataType: 'TIME',
          relationValueTypes: [],
          entity: {
            id: '2d696bf0-510f-403e-985b-8cd1e73feb9b',
            name: 'Start time',
          },
        },
        {
          id: 'da616b5a-e6f1-4e62-9b11-de7e081a26fa',
          dataType: 'RELATION',
          entity: {
            id: 'da616b5a-e6f1-4e62-9b11-de7e081a26fa',
            name: 'Organizers',
          },
          relationValueTypes: [
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '2282fece-7494-40d6-bcdc-aad2355c40fb',
          dataType: 'RELATION',
          entity: {
            id: '2282fece-7494-40d6-bcdc-aad2355c40fb',
            name: 'Cities',
          },
          relationValueTypes: [
            {
              id: '01b05333-941a-4b00-bc78-fac5a15b467d',
              name: 'City',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '6d8cd471-f7af-415f-9411-18b1ef106434',
                  dataType: 'RELATION',
                  entity: {
                    id: '6d8cd471-f7af-415f-9411-18b1ef106434',
                    name: 'Country',
                  },
                },
                {
                  id: '47b55f87-c5ca-4b2d-b1ac-32296fd0c650',
                  dataType: 'RELATION',
                  entity: {
                    id: '47b55f87-c5ca-4b2d-b1ac-32296fd0c650',
                    name: 'State',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'fa8fbad0-101c-4020-8d9b-dde11a381bdb',
                  dataType: 'RELATION',
                  entity: {
                    id: 'fa8fbad0-101c-4020-8d9b-dde11a381bdb',
                    name: 'County',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
            name: 'Website',
          },
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '94b54a11-85e3-4c52-867a-ad5c45380ebe',
          dataType: 'RELATION',
          entity: {
            id: '94b54a11-85e3-4c52-867a-ad5c45380ebe',
            name: 'Sponsors',
          },
          relationValueTypes: [
            {
              id: '484a18c5-030a-499c-b0f2-ef588ff16d50',
              name: 'Project',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
              ],
              description: null,
            },
            {
              id: '7ed45f2b-c48b-419e-8e46-64d5ff680b0d',
              name: 'Person',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                  dataType: 'RELATION',
                  entity: {
                    id: '1155beff-fad5-49b7-a2e0-da4777b8792c',
                    name: 'Avatar',
                  },
                },
                {
                  id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dac6e89e-76be-4f77-88e1-0f556ceb6869',
                    name: 'Works at',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                  dataType: 'RELATION',
                  entity: {
                    id: '3e1f6873-f4e8-480d-a4ce-447092a684fa',
                    name: 'Worked at',
                  },
                },
                {
                  id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                  dataType: 'TEXT',
                  entity: {
                    id: '0d625978-4b3c-4b57-a86f-de45c997c73c',
                    name: 'X',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'b94c4d15-6aba-4441-abde-f40f173f33b8',
          dataType: 'RELATION',
          entity: {
            id: 'b94c4d15-6aba-4441-abde-f40f173f33b8',
            name: 'Parent event',
          },
          relationValueTypes: [
            {
              id: '4d876b81-787e-41fc-ab5d-075d4da66a3f',
              name: 'Event',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: 'da8723a3-fcab-4199-b7fd-aeb99fc7ba39',
                  dataType: 'RELATION',
                  entity: {
                    id: 'da8723a3-fcab-4199-b7fd-aeb99fc7ba39',
                    name: 'Side events',
                  },
                },
                {
                  id: 'f28bbb6b-f4e8-465d-9de7-a09085e224b9',
                  dataType: 'RELATION',
                  entity: {
                    id: 'f28bbb6b-f4e8-465d-9de7-a09085e224b9',
                    name: 'Venue',
                  },
                },
                {
                  id: 'c3445f6b-e2c0-4f25-b73a-5eb876c4f50c',
                  dataType: 'TIME',
                  entity: {
                    id: 'c3445f6b-e2c0-4f25-b73a-5eb876c4f50c',
                    name: 'End time',
                  },
                },
                {
                  id: 'c4c88260-ea3a-4498-a2f9-be340a19758e',
                  dataType: 'RELATION',
                  entity: {
                    id: 'c4c88260-ea3a-4498-a2f9-be340a19758e',
                    name: 'Countries',
                  },
                },
                {
                  id: '0d68798b-6bcc-4bbc-90e4-f76ecc1180a8',
                  dataType: 'RELATION',
                  entity: {
                    id: '0d68798b-6bcc-4bbc-90e4-f76ecc1180a8',
                    name: 'Speakers',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '2d696bf0-510f-403e-985b-8cd1e73feb9b',
                  dataType: 'TIME',
                  entity: {
                    id: '2d696bf0-510f-403e-985b-8cd1e73feb9b',
                    name: 'Start time',
                  },
                },
                {
                  id: 'da616b5a-e6f1-4e62-9b11-de7e081a26fa',
                  dataType: 'RELATION',
                  entity: {
                    id: 'da616b5a-e6f1-4e62-9b11-de7e081a26fa',
                    name: 'Organizers',
                  },
                },
                {
                  id: '2282fece-7494-40d6-bcdc-aad2355c40fb',
                  dataType: 'RELATION',
                  entity: {
                    id: '2282fece-7494-40d6-bcdc-aad2355c40fb',
                    name: 'Cities',
                  },
                },
                {
                  id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                  dataType: 'TEXT',
                  entity: {
                    id: 'eed38e74-e679-46bf-8a42-ea3e4f8fb5fb',
                    name: 'Website',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '94b54a11-85e3-4c52-867a-ad5c45380ebe',
                  dataType: 'RELATION',
                  entity: {
                    id: '94b54a11-85e3-4c52-867a-ad5c45380ebe',
                    name: 'Sponsors',
                  },
                },
                {
                  id: 'b94c4d15-6aba-4441-abde-f40f173f33b8',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b94c4d15-6aba-4441-abde-f40f173f33b8',
                    name: 'Parent event',
                  },
                },
                {
                  id: '72ba2a0f-729d-4847-925d-f3b09d46bb66',
                  dataType: 'RELATION',
                  entity: {
                    id: '72ba2a0f-729d-4847-925d-f3b09d46bb66',
                    name: 'Address',
                  },
                },
                {
                  id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
                  dataType: 'TEXT',
                  entity: {
                    id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
                    name: 'Location',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '72ba2a0f-729d-4847-925d-f3b09d46bb66',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '72ba2a0f-729d-4847-925d-f3b09d46bb66',
            name: 'Address',
          },
        },
        {
          id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
            name: 'Location',
          },
        },
      ],
    },
    {
      id: '01b05333-941a-4b00-bc78-fac5a15b467d',
      name: 'City',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '6d8cd471-f7af-415f-9411-18b1ef106434',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '6d8cd471-f7af-415f-9411-18b1ef106434',
            name: 'Country',
          },
        },
        {
          id: '47b55f87-c5ca-4b2d-b1ac-32296fd0c650',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: '47b55f87-c5ca-4b2d-b1ac-32296fd0c650',
            name: 'State',
          },
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
            name: 'Related entities',
          },
        },
        {
          id: 'fa8fbad0-101c-4020-8d9b-dde11a381bdb',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'fa8fbad0-101c-4020-8d9b-dde11a381bdb',
            name: 'County',
          },
        },
      ],
    },
    {
      id: 'fc512a40-8b55-44dc-85b8-5aae88b51fae',
      name: 'Industry',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: 'c70397ac-4607-4d3a-9433-19cbc75197ad',
      name: 'Job opening',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '723821c6-11fd-45d1-9d91-2723b0e508b5',
          dataType: 'NUMBER',
          relationValueTypes: [],
          entity: {
            id: '723821c6-11fd-45d1-9d91-2723b0e508b5',
            name: 'Equity min',
          },
        },
        {
          id: '1ab8005a-edea-411d-a191-9b20b7e48a78',
          dataType: 'NUMBER',
          relationValueTypes: [],
          entity: {
            id: '1ab8005a-edea-411d-a191-9b20b7e48a78',
            name: 'Equity max',
          },
        },
        {
          id: '412ff593-e915-4012-a43d-4c27ec5c68b6',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '412ff593-e915-4012-a43d-4c27ec5c68b6',
            name: 'Web URL',
          },
        },
        {
          id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
          dataType: 'RELATION',
          entity: {
            id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
            name: 'Roles',
          },
          relationValueTypes: [
            {
              id: 'e4e366e9-d555-4b68-92bf-7358e824afd2',
              name: 'Role',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                  dataType: 'RELATION',
                  entity: {
                    id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
                    name: 'Skills',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
              ],
              description: 'A function a person or project can perform',
            },
          ],
        },
        {
          id: 'aac06dc0-2eb2-471b-bd0b-6adbaf5c478b',
          dataType: 'RELATION',
          entity: {
            id: 'aac06dc0-2eb2-471b-bd0b-6adbaf5c478b',
            name: 'Team',
          },
          relationValueTypes: [
            {
              id: 'd94df755-02ff-40c1-8169-ce0e65377ebe',
              name: 'Team',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: 'A small group of people working together with a shared goal and area of ownership.',
            },
          ],
        },
        {
          id: '5b722cd3-61d6-494e-8887-1310566437ba',
          dataType: 'RELATION',
          entity: {
            id: '5b722cd3-61d6-494e-8887-1310566437ba',
            name: 'Related spaces',
          },
          relationValueTypes: [
            {
              id: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
              name: 'Space',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '78ec09b9-f56f-4898-8db8-6c7f153774f3',
          dataType: 'NUMBER',
          relationValueTypes: [],
          entity: {
            id: '78ec09b9-f56f-4898-8db8-6c7f153774f3',
            name: 'Salary max',
          },
        },
        {
          id: '53a98633-a2db-40be-9f16-1a4c9da37970',
          dataType: 'RELATION',
          entity: {
            id: '53a98633-a2db-40be-9f16-1a4c9da37970',
            name: 'Employment type',
          },
          relationValueTypes: [
            {
              id: 'f503bfd2-83d7-4e1a-9b30-294fff9d2d7e',
              name: 'Employment type',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: '64695ccd-c5ea-4185-87f8-7e335dc1b66b',
          dataType: 'NUMBER',
          relationValueTypes: [],
          entity: {
            id: '64695ccd-c5ea-4185-87f8-7e335dc1b66b',
            name: 'Salary min',
          },
        },
        {
          id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '95d77002-1faf-4f7c-b7de-b21a7d48cda0',
            name: 'Location',
          },
        },
        {
          id: 'e3a96728-2b09-4af7-9af7-86ef1aa7837e',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'e3a96728-2b09-4af7-9af7-86ef1aa7837e',
            name: 'Project',
          },
        },
        {
          id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
          dataType: 'RELATION',
          entity: {
            id: 'a38732e3-3a3d-47f9-a459-fb369c287709',
            name: 'Skills',
          },
          relationValueTypes: [
            {
              id: '9ca6ab1f-3a11-4e49-bbaf-72e0c9a985cf',
              name: 'Skill',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                  dataType: 'RELATION',
                  entity: {
                    id: '8fcfe5ef-3d91-47bd-8322-3830a998d26b',
                    name: 'Roles',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
      ],
    },
    {
      id: 'df250d17-e364-413d-9779-2ddaae841e34',
      name: 'Point',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
      ],
    },
    {
      id: '3317d044-a700-4a9d-bbaf-4c16ade42f76',
      name: 'Continent',
      properties: [
        {
          id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
            name: 'Name',
          },
        },
        {
          id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
          dataType: 'TEXT',
          relationValueTypes: [],
          entity: {
            id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
            name: 'Description',
          },
        },
        {
          id: '806d52bc-27e9-4c91-93c0-57978b093351',
          dataType: 'RELATION',
          entity: {
            id: '806d52bc-27e9-4c91-93c0-57978b093351',
            name: 'Related topics',
          },
          relationValueTypes: [
            {
              id: '5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2',
              name: 'Topic',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
                {
                  id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                  dataType: 'RELATION',
                  entity: {
                    id: '6e3503fa-b974-460e-a3db-ab8af9a41427',
                    name: 'Related projects',
                  },
                },
                {
                  id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                  dataType: 'RELATION',
                  entity: {
                    id: '39e40cad-b23d-4f63-ab2f-aea1596436c7',
                    name: 'Subtopics',
                  },
                },
                {
                  id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                  dataType: 'RELATION',
                  entity: {
                    id: '5df8e432-9cc5-4f03-8f85-4ac82e157ada',
                    name: 'Related people',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '5b722cd3-61d6-494e-8887-1310566437ba',
                  dataType: 'RELATION',
                  entity: {
                    id: '5b722cd3-61d6-494e-8887-1310566437ba',
                    name: 'Related spaces',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                  dataType: 'RELATION',
                  entity: {
                    id: 'b35bd6d3-9fb6-4f3a-8aea-f5a9b91b5ef6',
                    name: 'Broader topics',
                  },
                },
              ],
              description: 'A general concept that can be used to group things of the same category together.',
            },
          ],
        },
        {
          id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
          dataType: 'RELATION',
          relationValueTypes: [],
          entity: {
            id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
            name: 'Related entities',
          },
        },
        {
          id: '25709034-1ba5-406f-94e4-d4af90042fba',
          dataType: 'RELATION',
          entity: {
            id: '25709034-1ba5-406f-94e4-d4af90042fba',
            name: 'Tags',
          },
          relationValueTypes: [
            {
              id: 'e0fcc66c-9e86-43f4-8080-2469d8a1a93a',
              name: 'Tag',
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
              description: null,
            },
          ],
        },
        {
          id: 'c4c88260-ea3a-4498-a2f9-be340a19758e',
          dataType: 'RELATION',
          entity: {
            id: 'c4c88260-ea3a-4498-a2f9-be340a19758e',
            name: 'Countries',
          },
          relationValueTypes: [
            {
              id: '42a0a761-8c82-459f-ad08-34bfeb437cde',
              name: 'Country',
              description: null,
              properties: [
                {
                  id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                  dataType: 'TEXT',
                  entity: {
                    id: 'a126ca53-0c8e-48d5-b888-82c734c38935',
                    name: 'Name',
                  },
                },
                {
                  id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                  dataType: 'TEXT',
                  entity: {
                    id: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
                    name: 'Description',
                  },
                },
                {
                  id: '806d52bc-27e9-4c91-93c0-57978b093351',
                  dataType: 'RELATION',
                  entity: {
                    id: '806d52bc-27e9-4c91-93c0-57978b093351',
                    name: 'Related topics',
                  },
                },
                {
                  id: '1c5b7c0a-d187-425e-885c-2980d9db6b4b',
                  dataType: 'RELATION',
                  entity: {
                    id: '1c5b7c0a-d187-425e-885c-2980d9db6b4b',
                    name: 'Continent',
                  },
                },
                {
                  id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                  dataType: 'RELATION',
                  entity: {
                    id: 'dfa6aebe-1ca9-4bf2-9fac-cc4cc7afb24c',
                    name: 'Related entities',
                  },
                },
                {
                  id: '0f1f1f2b-2383-4056-8a3a-b223be09506e',
                  dataType: 'RELATION',
                  entity: {
                    id: '0f1f1f2b-2383-4056-8a3a-b223be09506e',
                    name: 'States',
                  },
                },
                {
                  id: '25709034-1ba5-406f-94e4-d4af90042fba',
                  dataType: 'RELATION',
                  entity: {
                    id: '25709034-1ba5-406f-94e4-d4af90042fba',
                    name: 'Tags',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
