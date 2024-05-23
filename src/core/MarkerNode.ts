export interface IMarkerNode<T = unknown> {
  readonly start: number;
  readonly end: number;
  readonly children: IMarkerNode<T>[];
  data: T;

  isOverlapping: (marker: MarkerNode<T>) => boolean;
  addChildren: (...nodes: MarkerNode<T>[]) => void;
  getOverlappingChildren: (node: MarkerNode<T>) => MarkerNode<T>[];
}


export class MarkerNode<T = unknown> implements IMarkerNode<T> {
  children: MarkerNode<T>[];

  constructor(
    public start: number,
    public end: number,
    public data: T,
    children: IMarkerNode<T>[] = [],
    protected parent: MarkerNode<T> | null = null,
  ) {
    // todo: set key
    this.children = children.map(MarkerNode.of);
  }

  public addChildren(...nodes: MarkerNode<T>[]) {
    for (const newMarker of nodes) {
      // 1. newMarker doesn't overlap with any existing marker
      let overlappingMarkers = this.getOverlappingChildren(newMarker);
      if (overlappingMarkers.length === 0) {
        this.children.push(newMarker);
        newMarker.setParent(this);
        continue;
      }

      // 2. new marker is contained by an exiting marker
      // recursively add newMarker to that child
      const superMarker = this.getSuperMarker(newMarker);
      if (superMarker) {
        superMarker.addChildren(newMarker);
        continue;
      }

      // 3. there are some children newMarker can contain
      // push those markers to newMarker
      for (const overlappingMarker of overlappingMarkers) {
        if (newMarker.contains(overlappingMarker)) {
          newMarker.addChildren(overlappingMarker);
          this.removeChild(overlappingMarker);
        }
      }

      // 4. There are some partially overlapping markers
      // we break the newMarker for those overlapping marker
      overlappingMarkers = this.getOverlappingChildren(newMarker);
      let breakpoints = overlappingMarkers.flatMap((e) => [e.start, e.end]);
      breakpoints = [...breakpoints, newMarker.start, newMarker.end].filter((i) => i >= newMarker.start && i < newMarker.end && i <= newMarker.end);
      breakpoints = Array.from(new Set(breakpoints)).sort((a, b) => a - b);

      this.addChildren(...newMarker.split(...breakpoints))
    }
  }

  /**
   * Determines if two marker nodes are equal based on their start, end, and data properties.
   *
   * @param m1 - The first marker node.
   * @param m2 - The second marker node.
   *
   * @return Returns true if the marker nodes are equal, otherwise false.
   */
  static is(m1: IMarkerNode, m2: IMarkerNode) {
    return m1.start === m2.start && m1.end === m2.end && Object.is(m1, m2);
  }

  /**
   * Type lift IMarkerNode to MarkerElement
   */
  static of<T>(m: IMarkerNode<T>): MarkerNode<T> {
    if (m instanceof MarkerNode) {
      return m as MarkerNode<T>;
    }
    return new MarkerNode<T>(
      m.start, m.end,
      (m as IMarkerNode<T>).data,
      m.children as IMarkerNode<T>[],
    );
  }

  protected containsPoint(point: number): boolean {
    return point >= this.start && point <= this.end;
  }

  /**
   * Checks whether the given point or marker is contained within the current object.
   *
   * @param pointOrMarker - The point or marker to be checked.
   * @return True if the point or marker is contained, false otherwise.
   */
  contains(pointOrMarker: number | Pick<IMarkerNode, 'start' | 'end'>): boolean {
    if (typeof pointOrMarker === 'number') {
      return this.containsPoint(pointOrMarker);
    }
    return this.containsPoint(pointOrMarker.start) && this.containsPoint(pointOrMarker.end);
  }

  /**
   * Determines whether the given marker overlaps with the current marker.
   *
   * @param marker - The marker to check for overlapping.
   * @return True if the markers overlap, false otherwise.
   */
  isOverlapping(marker: MarkerNode<T>): boolean {
    return (
      this.contains(marker.start) ||
      this.contains(marker.end) ||
      marker.contains(this.start) ||
      marker.contains(this.end)
    );
  }

  /**
   * Returns an array of children nodes that overlap with the given marker.
   *
   * @param marker - The marker element to check for overlap with children nodes.
   * @return An array containing the child nodes that overlap with the given marker.
   */
  getOverlappingChildren(marker: MarkerNode<T>) {
    return this.children.filter((node) => node.isOverlapping(marker));
  }

  /**
   * Retrieves the super marker of the given marker.
   *
   * @param marker - The marker to get the super marker for.
   * @returns The super marker of the given marker, or undefined if no super marker is found.
   * @throws {Error} If the given marker has multiple super markers.
   */
  getSuperMarker(marker: MarkerNode<T>): MarkerNode<T> | undefined {
    const superMarkers = this.children.filter((r) => r.contains(marker));
    if (superMarkers.length > 1) {
      throw new Error('A marker should not have multiple super markers');
    }
    return superMarkers[0];
  }

  /**
   * Removes a child node from the parent node.
   *
   * @param marker - The child marker node to remove.
   */
  removeChild(marker: MarkerNode<T>) {
    this.children = this.children.filter((child) => !MarkerNode.is(child as MarkerNode, marker as MarkerNode));
  }

  /**
   * Splits a marker and its children on the points
   * @param points
   */
  split(...points: number[]) {
    const newMarkers: MarkerNode<T>[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      const newMarker = new MarkerNode(start, end, this.data, [], this.parent);

      const newChildren = this.children
        .filter((c) => newMarker.isOverlapping(c))
        .flatMap((c) => {
          if (newMarker.contains(c)) {
            return [c];
          }

          return c.split(start, end);
        });


      newMarker.addChildren(...newChildren)
      newMarkers.push(newMarker);
    }

    return newMarkers;
  }

  setParent(node: MarkerNode<T>) {
    this.parent = node;
  }
}