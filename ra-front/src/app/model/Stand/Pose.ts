import {UniversalPoint} from "../MapAreas/UniversalPoint";
import {Orientation} from "./Orientation";

export class Pose {
  position: UniversalPoint = new UniversalPoint(null, null, null);
  orientation: Orientation = new Orientation(0, 0, 0, 0);
}
