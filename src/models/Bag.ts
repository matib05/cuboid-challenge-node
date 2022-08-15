import { Id, RelationMappings } from 'objection';
import { Cuboid } from './Cuboid';
import Base from './Base';

export class Bag extends Base {
  id!: Id;
  volume!: number;
  title!: string;
  cuboids?: Cuboid[] | undefined;

  static tableName = 'bags';

  static get relationMappings(): RelationMappings {
    return {
      cuboids: {
        relation: Base.HasManyRelation,
        modelClass: 'Cuboid',
        join: {
          from: 'bags.id',
          to: 'cuboids.bagId',
        },
      },
    };
  }

  static get virtualAttributes(): Array<string> {
    return ['payloadVolume', 'availableVolume'];
  }

  get payloadVolume(): number {
    return (
      this.cuboids
        ?.map((cuboid: Cuboid) => cuboid.volume)
        .reduce((prev: number, current: number) => prev + current, 0) || 0
    );
  }

  get availableVolume(): number {
    return this.volume - this.payloadVolume;
  }
}

export default Bag;
