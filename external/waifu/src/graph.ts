import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from "d3-force";

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
const PADDING = 90;
const SIMULATION_TICKS = 300;

interface SimNode {
  id: string;
  name: string;
  avatar?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * 用力导向布局把婚姻关系边列表转换成可直接渲染的节点坐标 + 连线坐标
 */
export function buildRelationshipGraph(
  edges: RelationshipEdge[],
  members: Map<string, GraphMember>
): RelationshipGraph {
  const nodeIds = new Set<string>();
  for (const edge of edges) {
    nodeIds.add(edge.owner_id);
    nodeIds.add(edge.waifu_id);
  }

  const simNodes: SimNode[] = Array.from(nodeIds).map((id) => {
    const member = members.get(id);
    return { id, name: member?.name ?? id, avatar: member?.avatar, x: 0, y: 0, vx: 0, vy: 0 };
  });
  const nodeById = new Map(simNodes.map((node) => [node.id, node]));

  const simLinks = edges.map((edge) => ({
    source: nodeById.get(edge.owner_id)!,
    target: nodeById.get(edge.waifu_id)!
  }));

  const simulation = forceSimulation(simNodes)
    .force("link", forceLink(simLinks).distance(220).strength(0.4))
    .force("charge", forceManyBody().strength(-500))
    .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
    .force("collide", forceCollide(70))
    .stop();

  for (let i = 0; i < SIMULATION_TICKS; i++) {
    simulation.tick();
  }

  const nodes: GraphNode[] = simNodes.map((node) => ({
    id: node.id,
    name: node.name,
    avatar: node.avatar,
    x: clamp(node.x, PADDING, WIDTH - PADDING),
    y: clamp(node.y, PADDING, HEIGHT - PADDING)
  }));
  const renderNodeById = new Map(nodes.map((node) => [node.id, node]));

  const renderEdges: GraphEdge[] = edges.map((edge) => {
    const from = renderNodeById.get(edge.owner_id)!;
    const to = renderNodeById.get(edge.waifu_id)!;
    return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
  });

  return { nodes, edges: renderEdges };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
