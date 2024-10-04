import { Schema as S } from "@effect/schema";

type Attribute = {
  id: string;
  name: string;
  type: any;
};

const Birthday = {
  id: "idexample1",
  name: "Birthday",
  type: S.String,
};

const Age = {
  id: "idexample2",
  name: "Age",
  type: S.String,
};

const schema = {
  entity: {
    user: [Birthday, Age],
  },
};

const createEntityType = (attributes: Attribute[]) => {
  const entity = attributes.map((attribute) =>
    S.Struct({ [attribute.name]: attribute.type })
  );
  return S.Union(...entity);
};

const UserEntity = createEntityType(schema.entity.user);

type UserEntityType = S.Schema.Type<typeof UserEntity>;
