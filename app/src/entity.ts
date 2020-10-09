class EntityB {}

function Rule(config: any) {
  return (target: any) => {};
}

@Rule({
  ossUrls: ['./entity.oss']
})
export class Entity {
  aString: string;
  aNumber: number;
  aBoolean: boolean;
  aDate: Date;
  aCustomClass: EntityB;
}
