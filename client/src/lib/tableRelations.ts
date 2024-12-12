interface TableRelation {
  sourceTable: string;
  targetTable: string;
  sourceKey: string;
  targetKey: string;
  type: "one-to-one" | "one-to-many" | "many-to-many";
}

export const tableRelations: TableRelation[] = [
  {
    sourceTable: "visit_card",
    targetTable: "contact_relation",
    sourceKey: "contact_relation_id",
    targetKey: "id",
    type: "one-to-one"
  },
  {
    sourceTable: "lbc",
    targetTable: "lbc_relation",
    sourceKey: "lbc_relation_id",
    targetKey: "id",
    type: "one-to-one"
  }
];

export function findRelatedTable(tableName: string): TableRelation | undefined {
  return tableRelations.find(
    relation => relation.sourceTable === tableName || relation.targetTable === tableName
  );
}

export function getRelatedTableData(
  tableName: string,
  selectedData: Record<string, any>,
  allData: Record<string, any[]>
): Record<string, any> | null {
  const relation = findRelatedTable(tableName);
  if (!relation) return null;

  const isSource = relation.sourceTable === tableName;
  const relatedTableName = isSource ? relation.targetTable : relation.sourceTable;
  const sourceKey = isSource ? relation.sourceKey : relation.targetKey;
  const targetKey = isSource ? relation.targetKey : relation.sourceKey;

  const relatedData = allData[relatedTableName]?.find(
    item => item[targetKey] === selectedData[sourceKey]
  );

  return relatedData || null;
}
