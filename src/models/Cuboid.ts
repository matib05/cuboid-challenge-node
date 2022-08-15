import { Id, RelationMappings } from 'objection';
import { Bag } from './Bag';
import Base from './Base';

export class Cuboid extends Base {
  id!: Id;
  width!: number;
  height!: number;
  depth!: number;
  bagId?: Id;
  bag!: Bag;

  static tableName = 'cuboids';

  static get relationMappings(): RelationMappings {
    return {
      bag: {
        relation: Base.BelongsToOneRelation,
        modelClass: 'Bag',
        join: {
          from: 'cuboids.bagId',
          to: 'bags.id',
        },
      },
    };
  }

  static get virtualAttributes(): Array<string> {
    return ['volume'];
  }

  get volume(): number {
    return this.height * this.depth * this.width;
  }
}

export default Cuboid;
