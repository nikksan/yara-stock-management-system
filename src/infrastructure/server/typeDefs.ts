export default `#graphql
  type Size {
    width: Float!
    height: Float!
    length: Float!
  }

  type Warehouse {
    id: String!
    name: String!
    size: Size!
  }

  type Query {
    getWarehouses: [Warehouse]
  }

  input SizeInput {
    width: Float!
    height: Float!
    length: Float!
  }

  type Mutation {
    createWarehouse(name: String!, size: SizeInput!): String
    deleteWarehouse(warehouseId: ID!): Void
    exportProductFromWarehouse(productId: ID!, warehouseId: ID!, quantity: Int!): Void
    importProductToWarehouse(productId: ID!, warehouseId: ID!, quantity: Int!, date: DateTime): Void

    createProduct(name: String!, size: SizeInput!, isHazardous: Boolean!): String
    updateProduct(productId: ID!, name: String, size: SizeInput, isHazardous: Boolean): Void
    deleteProduct(productId: ID!): Void
  }
`;
