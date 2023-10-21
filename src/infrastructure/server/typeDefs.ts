export default `#graphql
  type Size {
    width: Float!
    height: Float!
    length: Float!
  }

  type InventoryItemProduct {
    id: ID!
    size: Size!
    isHazardous: Boolean!
  }

  type InventoryItem {
    product: InventoryItemProduct!
    quantity: Int!
    importedAt: DateTime!
  }

  type Warehouse {
    id: String!
    name: String!
    size: Size!
    inventory: [InventoryItem!]!
  }

  type Product {
    id: ID!
    name: String!
    size: Size!
    isHazardous: Boolean!
  }

  type PaginatedProducts {
    total: Int!
    items: [Product!]!
  }

  type SpaceStats {
    currentUsedUpSpace: Float!
    totalUsedUpSpace: Float!
    totalSpace: Float!
    freeSpace: Float!
  }

  type EventProductData {
    id: String!
    name: String!
    size: Size!
    isHazardous: Boolean!
  }

  type EventWarehouseData {
    id: String!
    name: String!
  }

  type EventData {
    product: EventProductData!
    warehouse: EventWarehouseData!,
    importedAt: DateTime
    quantity: Int!,
  }

  type Event {
    id: String!
    type: String!
    data: EventData!
    createdAt: DateTime!
  }

  type Query {
    listWarehouses: [Warehouse!]!
    getWarehouseStats(warehouseId: ID!): SpaceStats!

    listProducts(page: Int!, limit: Int!): PaginatedProducts!

    getHistoricImportsAndExports(warehouseIds: [ID!], date: Date): [Event!]!
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
