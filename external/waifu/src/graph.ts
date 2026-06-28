export interface GraphMember {
  id: string;
  name: string;
  avatar?: string;
}

export interface RelationshipEdge {
  owner_id: string;
  waifu_id: string;
}

export interface GraphNode extends GraphMember {
  x: number;
  y: number;
}

export interface GraphEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface RelationshipGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const WIDTH = 1600;
const HEIGHT = 1200;
const NODE_R = 48;
const GAP = 60;

export function buildRelationshipGraph(
  edges: RelationshipEdge[],
  members: Map<string, GraphMember>
): RelationshipGraph {
  const nodeIds = new Set<string>();
  for (const edge of edges) {
    nodeIds.add(edge.owner_id);
    nodeIds.add(edge.waifu_id);
  }
  if (nodeIds.size === 0) return { nodes: [], edges: [] };

  const adj = new Map<string, Set<string>>();
  for (const id of nodeIds) adj.set(id, new Set());
  for (const edge of edges) {
    adj.get(edge.owner_id)!.add(edge.waifu_id);
    adj.get(edge.waifu_id)!.add(edge.owner_id);
  }
  const components: string[][] = [];
  const visited = new Set<string>();
  for (const startId of nodeIds) {
    if (visited.has(startId)) continue;
    const queue = [startId];
    const comp: string[] = [];
    while (queue.length) {
      const id = queue.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      comp.push(id);
      for (const nb of adj.get(id)!) queue.push(nb);
    }
    components.push(comp);
  }

  const compRadius = (n: number) => Math.max(NODE_R * 2, (NODE_R * 2 + GAP / 2) * n / (2 * Math.PI));

  const compSizes = components.map((comp) => {
    const visualR = comp.length === 1 ? NODE_R : compRadius(comp.length) + NODE_R;
    return visualR * 2 + GAP;
  });

  const cols = Math.max(1, Math.ceil(Math.sqrt(components.length)));
  const positions: { cx: number; cy: number }[] = [];
  let x = 0, y = 0, rowH = 0, col = 0;
  for (let i = 0; i < components.length; i++) {
    const s = compSizes[i]!;
    if (col > 0 && col >= cols) { x = 0; y += rowH; rowH = 0; col = 0; }
    positions.push({ cx: x + s / 2, cy: y + s / 2 });
    x += s;
    rowH = Math.max(rowH, s);
    col++;
  }

  const totalW = Math.max(...positions.map((p, i) => p.cx + compSizes[i]! / 2));
  const totalH = Math.max(...positions.map((p, i) => p.cy + compSizes[i]! / 2));
  const scale = Math.min((WIDTH - GAP * 2) / totalW, (HEIGHT - GAP * 2) / totalH, 1);
  const offX = (WIDTH - totalW * scale) / 2;
  const offY = (HEIGHT - totalH * scale) / 2;

  const coordMap = new Map<string, { x: number; y: number }>();
  for (let i = 0; i < components.length; i++) {
    const comp = components[i]!;
    const { cx, cy } = positions[i]!;
    const r = compRadius(comp.length);
    comp.forEach((id, j) => {
      const angle = (2 * Math.PI * j) / comp.length - Math.PI / 2;
      const nx = comp.length === 1 ? cx : cx + r * Math.cos(angle);
      const ny = comp.length === 1 ? cy : cy + r * Math.sin(angle);
      coordMap.set(id, { x: nx * scale + offX, y: ny * scale + offY });
    });
  }

  const nodes: GraphNode[] = Array.from(nodeIds).map((id) => {
    const member = members.get(id);
    const { x, y } = coordMap.get(id)!;
    return { id, name: member?.name ?? id, avatar: member?.avatar, x, y };
  });

  const renderEdges: GraphEdge[] = edges.map((edge) => {
    const from = coordMap.get(edge.owner_id)!;
    const to = coordMap.get(edge.waifu_id)!;
    return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
  });

  return { nodes, edges: renderEdges };
}
