import { Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { Id } from 'objection';
import { Bag, Cuboid } from '../models';

export const list = async (req: Request, res: Response): Promise<Response> => {
  const ids = req.query.ids as Id[];
  const cuboids = await Cuboid.query().findByIds(ids).withGraphFetched('bag');

  return res.status(200).json(cuboids);
};

export const get = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.id as Id;
  const cuboid = await Cuboid.query().findById(id);

  if (!cuboid) {
    return res
      .status(HttpStatus.NOT_FOUND)
      .json({ message: 'Cuboid not found' });
  }

  return res.status(200).json(cuboid);
};

export const create = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { width, height, depth, bagId } = req.body;

  const bag = await Bag.query().findById(bagId).withGraphFetched('cuboids');
  const cuboidVolume = width * height * depth;

  if (!bag) {
    return res.status(HttpStatus.NOT_FOUND).json({ message: 'Bag not found' });
  }

  if (bag.availableVolume < cuboidVolume) {
    return res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json({ message: 'Insufficient capacity in bag' });
  }

  const cuboid = await Cuboid.query().insert({
    width,
    height,
    depth,
    volume: width * height * depth,
    bagId,
  });

  return res.status(HttpStatus.CREATED).json(cuboid);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id as Id;
  const { newWidth, newHeight, newDepth } = req.body;

  const cuboid = await Cuboid.query()
    .findById(id)
    .withGraphFetched('bag.[cuboids]');

  if (!cuboid) {
    return res
      .status(HttpStatus.NOT_FOUND)
      .json({ message: 'Cuboid not found' });
  }

  if (cuboid.bag.availableVolume < newWidth * newHeight * newDepth) {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      message: 'Insufficient capacity in bag',
    });
  }

  const updatedCuboid = await Cuboid.query()
    .updateAndFetchById(id, {
      width: newWidth,
      height: newHeight,
      depth: newDepth,
    })
    .withGraphFetched('bag');

  return res.status(HttpStatus.OK).json(updatedCuboid);
};

export const deleteCuboid = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id as Id;

  const cuboid = await Cuboid.query().findById(id);

  if (!cuboid) {
    return res
      .status(HttpStatus.NOT_FOUND)
      .json({ message: 'Cuboid not found' });
  }

  await Cuboid.query().deleteById(id);

  return res.status(HttpStatus.OK).json({
    message: 'Cuboid deleted',
  });
};
