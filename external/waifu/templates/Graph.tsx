import "./graph.css";

export interface GraphNode {
  id: string;
  name: string;
  avatar?: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface GraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const WIDTH = 1600;
const HEIGHT = 1200;
const AVATAR_SIZE = 64;

export default function Graph({ nodes = [], edges = [] }: GraphProps) {
  return (
    <div className="graph-root">
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#ff7fa6" />
          </marker>
          {nodes.map((node) => (
            <clipPath id={`clip-${node.id}`} key={node.id}>
              <circle cx={node.x} cy={node.y} r={AVATAR_SIZE / 2} />
            </clipPath>
          ))}
        </defs>
        <g className="edges">
          {edges.map((edge, i) => (
            <line
              key={i}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              stroke="#ff7fa6"
              strokeWidth={3}
              markerEnd="url(#arrow)"
            />
          ))}
        </g>
        <g className="nodes">
          {nodes.map((node) => (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r={AVATAR_SIZE / 2 + 4} fill="#fff" stroke="#ff7fa6" strokeWidth={3} />
              {node.avatar ? (
                <image
                  href={node.avatar}
                  x={node.x - AVATAR_SIZE / 2}
                  y={node.y - AVATAR_SIZE / 2}
                  width={AVATAR_SIZE}
                  height={AVATAR_SIZE}
                  clipPath={`url(#clip-${node.id})`}
                />
              ) : null}
              <text x={node.x} y={node.y + AVATAR_SIZE / 2 + 22} textAnchor="middle" fontSize={20} fill="#3a2a30">
                {node.name}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
